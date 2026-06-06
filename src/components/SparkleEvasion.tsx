import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SparkleEvasionProps {
  onProceed: () => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Velocity3D {
  vx: number;
  vy: number;
  vz: number;
}

interface Particle extends Point3D {
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface Star3D extends Point3D {
  size: number;
  color: string;
  twinkleSpeed: number;
  phase: number;
}

export const SparkleEvasion: React.FC<SparkleEvasionProps> = ({ onProceed }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Game states: 'intro' | 'flying' | 'stopping' | 'message' | 'warp'
  const [gameState, setGameState] = useState<'intro' | 'flying' | 'stopping' | 'message' | 'warp'>('intro');
  const [attempts, setAttempts] = useState(0);
  const [messageVisible, setMessageVisible] = useState(false);

  // 3D Card tilt coordinates
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Trigger intro sequence on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState('flying');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // 3D Physics and Rendering Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D camera settings
    const FL = 350; // Focal length
    const camZ = 450; // Camera distance from screen plane

    // Sparkle 3D coordinates & physics
    let sparkle: Point3D = { x: 0, y: -200, z: 200 };
    let sparkleTarget: Point3D = { x: 0, y: 0, z: 0 };
    let sparkleVel: Velocity3D = { vx: 0, vy: 0, vz: 0 };

    // Sparkle trail & explosion particles
    let trail: Point3D[] = [];
    let particles: Particle[] = [];

    // Background 3D Starfield
    const stars: Star3D[] = [];
    const starCount = 60;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800 - 200,
        size: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.4 ? '#ff2a85' : Math.random() > 0.5 ? '#bd00ff' : '#fcd34d',
        twinkleSpeed: Math.random() * 0.05 + 0.01,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let targetTimer = 0;
    let timeInState = 0;
    let fleeCooldown = 0;

    // Helper: Project 3D coordinate to 2D Screen
    const project = (point: Point3D) => {
      const scale = FL / (point.z + camZ);
      return {
        x: width / 2 + point.x * scale,
        y: height / 2 + point.y * scale,
        scale,
      };
    };

    // Helper: Spawn starburst explosion particles
    const spawnExplosion = (x: number, y: number, z: number, count: number = 15) => {
      if (window.playUISfx) window.playUISfx('click');
      const colors = ['#ff2a85', '#bd00ff', '#fcd34d', '#ff00aa', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = Math.random() * 6 + 4;

        particles.push({
          x,
          y,
          z,
          vx: Math.sin(phi) * Math.cos(theta) * speed,
          vy: Math.sin(phi) * Math.sin(theta) * speed,
          vz: Math.cos(phi) * speed,
          size: Math.random() * 2.5 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: Math.random() * 0.03 + 0.015,
        });
      }
    };

    // Main animation loop
    const loop = () => {
      timeInState += 1;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.25)'; // Smooth trails backdrop
      ctx.fillRect(0, 0, width, height);

      // --- Render Starfield ---
      stars.forEach((star) => {
        star.phase += star.twinkleSpeed;

        if (gameState === 'warp') {
          // Rushing hyperspace effect
          star.z -= 18;
          if (star.z < -camZ + 10) {
            star.z = 600;
            star.x = (Math.random() - 0.5) * 1200;
            star.y = (Math.random() - 0.5) * 800;
          }
        } else {
          // Slow ambient drift
          star.z -= 0.3;
          if (star.z < -camZ + 10) {
            star.z = 600;
          }
        }

        const proj = project(star);
        if (proj.x >= 0 && proj.x <= width && proj.y >= 0 && proj.y <= height) {
          const size = star.size * proj.scale;
          if (size > 0) {
            const twinkle = Math.abs(Math.sin(star.phase));
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = Math.max(0.15, twinkle * 0.65) * (1 - (star.z + camZ) / 1000);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      });

      // --- Evasion and Flight Physics ---
      if (gameState === 'flying' || gameState === 'stopping') {
        // Sparkle autonomous movement
        if (gameState === 'flying') {
          targetTimer--;
          if (targetTimer <= 0) {
            // Pick a new random target in 3D
            sparkleTarget = {
              x: (Math.random() - 0.5) * (width * 0.5),
              y: (Math.random() - 0.5) * (height * 0.5),
              z: Math.random() * 300 - 100, // Move forward and backward in depth
            };
            targetTimer = Math.random() * 90 + 60; // 1.5 - 2.5 seconds
          }
        } else if (gameState === 'stopping') {
          // Slowly home to center
          sparkleTarget = { x: 0, y: 0, z: 0 };
        }

        // Apply attraction force to target
        const ax = (sparkleTarget.x - sparkle.x) * 0.025;
        const ay = (sparkleTarget.y - sparkle.y) * 0.025;
        const az = (sparkleTarget.z - sparkle.z) * 0.025;

        sparkleVel.vx += ax;
        sparkleVel.vy += ay;
        sparkleVel.vz += az;

        // Apply drag
        sparkleVel.vx *= 0.94;
        sparkleVel.vy *= 0.94;
        sparkleVel.vz *= 0.94;

        // Update position
        sparkle.x += sparkleVel.vx;
        sparkle.y += sparkleVel.vy;
        sparkle.z += sparkleVel.vz;

        // Project sparkle to screen space
        const proj = project(sparkle);

        // --- Active Evasion Logic ---
        if (gameState === 'flying') {
          if (fleeCooldown > 0) fleeCooldown--;

          if (mouseRef.current.active && fleeCooldown === 0) {
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const dx = proj.x - mx;
            const dy = proj.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If cursor gets close (within 160px)
            if (dist < 160) {
              fleeCooldown = 15; // Cooldown frames

              // Increment attempts
              setAttempts((prev) => {
                const next = prev + 1;
                if (next >= 4) {
                  // Wait 1.2s, then change to stopping stage
                  setTimeout(() => {
                    setGameState('stopping');
                  }, 1200);
                }
                return next;
              });

              // Playful repulsion force in 3D
              const force = 30;
              const angle = Math.atan2(dy, dx);
              
              // Push target to far side of screen
              sparkleTarget = {
                x: sparkle.x + Math.cos(angle) * 350 + (Math.random() - 0.5) * 200,
                y: sparkle.y + Math.sin(angle) * 350 + (Math.random() - 0.5) * 200,
                z: Math.random() * 300 - 150, // Rapidly shift depth
              };

              // Apply immediate velocity impulse
              sparkleVel.vx += Math.cos(angle) * force;
              sparkleVel.vy += Math.sin(angle) * force;
              sparkleVel.vz += (Math.random() - 0.5) * 18;

              // Spawn sparkling stardust burst
              spawnExplosion(sparkle.x, sparkle.y, sparkle.z, 20);
            }
          }
        }

        // Add trail coordinates
        trail.push({ x: sparkle.x, y: sparkle.y, z: sparkle.z });
        if (trail.length > 25) trail.shift();

        // Draw trail in projected 2D space
        if (trail.length > 1) {
          ctx.beginPath();
          const startProj = project(trail[0]);
          ctx.moveTo(startProj.x, startProj.y);

          for (let i = 1; i < trail.length; i++) {
            const pProj = project(trail[i]);
            ctx.lineTo(pProj.x, pProj.y);
          }

          // Shifting gradient for the tail
          const grad = ctx.createLinearGradient(
            project(trail[0]).x,
            project(trail[0]).y,
            proj.x,
            proj.y
          );
          grad.addColorStop(0, 'rgba(189, 0, 255, 0)');
          grad.addColorStop(0.5, 'rgba(255, 42, 133, 0.45)');
          grad.addColorStop(1, 'rgba(252, 211, 77, 0.95)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 4 * proj.scale;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        // --- Render the main Sparkle Star ---
        const wave = Math.sin(timeInState * 0.1);
        const radius = (14 + wave * 3) * proj.scale;
        
        ctx.save();
        ctx.shadowBlur = 25 * proj.scale;
        ctx.shadowColor = 'rgba(252, 211, 77, 0.9)';
        ctx.fillStyle = '#fff';

        // Draw a beautiful 4-point star lens flare
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y - radius);
        ctx.quadraticCurveTo(proj.x, proj.y, proj.x + radius, proj.y);
        ctx.quadraticCurveTo(proj.x, proj.y, proj.x, proj.y + radius);
        ctx.quadraticCurveTo(proj.x, proj.y, proj.x - radius, proj.y);
        ctx.quadraticCurveTo(proj.x, proj.y, proj.x, proj.y - radius);
        ctx.closePath();
        ctx.fill();

        // Inner glowing core
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff2a85';
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // If stopping and very close to center, transition to message card
        if (gameState === 'stopping') {
          const distToCenter = Math.sqrt(sparkle.x * sparkle.x + sparkle.y * sparkle.y + sparkle.z * sparkle.z);
          if (distToCenter < 12) {
            setGameState('message');
            // Trigger explosion at the center
            spawnExplosion(0, 0, 0, 30);
            setTimeout(() => {
              setMessageVisible(true);
            }, 600);
          }
        }
      }

      // --- Render Explosion/Burst Particles ---
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.alpha -= p.decay;

        // Apply drag
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.vz *= 0.97;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        const proj = project(p);
        const size = p.size * proj.scale;
        if (size > 0) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // --- Message state ambient core pulse ---
      if (gameState === 'message' || gameState === 'warp') {
        const pulse = 24 + Math.sin(timeInState * 0.05) * 6;
        const proj = project({ x: 0, y: 0, z: 0 });

        ctx.save();
        ctx.shadowBlur = 50;
        ctx.shadowColor = 'rgba(255, 42, 133, 0.6)';
        
        // Inner glowing radial gradient
        const radGrad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, pulse);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, 'rgba(252, 211, 77, 0.85)');
        radGrad.addColorStop(0.7, 'rgba(255, 42, 133, 0.4)');
        radGrad.addColorStop(1, 'rgba(189, 0, 255, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState]);

  // Handle 3D Message Card parallax mouse tilts
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates from -0.5 to 0.5
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    setCardTilt({
      rotateX: -normY * 18, // Tilt up/down
      rotateY: normX * 18, // Tilt left/right
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0 });
  };

  // Transition to next stage when clicking YES
  const handleProceedClick = () => {
    if (window.playUISfx) window.playUISfx('teleport');
    setGameState('warp');
    setMessageVisible(false);
    
    // Warp speed duration: 1200ms
    setTimeout(() => {
      onProceed();
    }, 1200);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 w-full min-h-screen flex items-center justify-center pointer-events-auto overflow-hidden bg-transparent select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* 1. Header Instruction Hint */}
      <AnimatePresence>
        {gameState === 'flying' && attempts < 4 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 z-20 pointer-events-none text-center"
          >
            <h3 className="font-serif italic text-lg md:text-xl text-amber-200 tracking-wider flex items-center gap-2 justify-center drop-shadow-md">
              <Sparkles size={18} className="animate-pulse text-amber-300" />
              Catch the magical sparkle! ✨
            </h3>
            <p className="font-sans text-[11px] text-zinc-500 uppercase tracking-widest mt-1">
              Try to move your cursor over it
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Glassmorphic 3D Holographic Card */}
      <AnimatePresence>
        {messageVisible && gameState === 'message' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -30 }}
            transition={{ type: 'spring', damping: 18, stiffness: 120 }}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
              transformStyle: 'preserve-3d',
            }}
            className="relative z-20 w-11/12 max-w-md p-8 glass-panel rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center preserve-3d"
          >
            {/* Holographic Glowing Accents */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-tr from-biolum-pink/20 via-transparent to-biolum-purple/20 opacity-60 pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-biolum-pink/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-biolum-purple/10 rounded-full blur-2xl pointer-events-none" />

            {/* Inner content with 3D translation depth */}
            <div style={{ transform: 'translateZ(40px)' }} className="space-y-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <Sparkles size={24} className="text-white animate-pulse" />
              </div>

              <div className="space-y-3">
                <span className="font-mono text-[10px] tracking-[0.3em] text-amber-300 uppercase block font-semibold">
                  SURPRISE UNLOCKED
                </span>
                <h2 className="font-serif italic text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-amber-200 to-zinc-100 drop-shadow">
                  Open me
                </h2>
                <p className="font-serif text-lg text-rose-300 italic">
                  you have another surprise
                </p>
              </div>

              <p className="font-sans text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed border-t border-white/5 pt-4">
                You chased the magic, now step into a deeper vault. A family circle is waiting to share their chapters of love with you.
              </p>

              {/* Pulsating Glowing Button */}
              <motion.button
                onClick={handleProceedClick}
                className="relative w-full py-4 bg-gradient-to-r from-biolum-pink to-biolum-purple text-white font-bold rounded-2xl cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(255,42,133,0.45)] overflow-hidden transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 group font-sans text-sm tracking-wider uppercase"
                whileHover={{ scale: 1.03 }}
              >
                {/* Button light shimmer */}
                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.25)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_infinite] pointer-events-none" />
                
                <span>Open the Vault</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -250px 0; }
          100% { background-position: 250px 0; }
        }
      `}</style>
    </div>
  );
};

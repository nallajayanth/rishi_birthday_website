import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  targetOpacity: number;
  color: string;
}

export const CanvasFireflies: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 65;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color palette for bioluminescent fireflies
    const colors = [
      'rgba(255, 42, 133,',  // Pink
      'rgba(189, 0, 255,',  // Purple
      'rgba(252, 211, 77,',  // Gold
    ];

    const createParticle = (initBottom = false): Particle => {
      const size = Math.random() * 2 + 0.6;
      return {
        x: Math.random() * canvas.width,
        y: initBottom ? canvas.height + 20 : Math.random() * canvas.height,
        size,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -(Math.random() * 0.5 + 0.2), // Rising slowly
        opacity: 0,
        targetOpacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(false));
    }

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseLeave);

    // Animation loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        // Move particle
        p.x += p.speedX;
        p.y += p.speedY;

        // Interaction with mouse (repulsion)
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 120;

          if (distance < forceRadius) {
            const force = (forceRadius - distance) / forceRadius;
            p.x += (dx / distance) * force * 1.5;
            p.y += (dy / distance) * force * 1.5;
          }
        }

        // Pulse/fade-in opacity
        if (p.opacity < p.targetOpacity) {
          p.opacity += 0.005;
        }

        // Respawn if offscreen
        if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          particles[idx] = createParticle(true);
        }

        // Draw particle
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `${p.color}${p.opacity})`);
        gradient.addColorStop(0.4, `${p.color}${p.opacity * 0.4})`);
        gradient.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
    />
  );
};

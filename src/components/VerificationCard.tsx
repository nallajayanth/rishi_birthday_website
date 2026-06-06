import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartCrack, ShieldAlert } from 'lucide-react';

interface VerificationCardProps {
  onSuccess: () => void;
}

interface LoveParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({ onSuccess }) => {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [particles, setParticles] = useState<LoveParticle[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Trigger runaway No button
  const handleNoRunaway = () => {
    if (window.playUISfx) {
      window.playUISfx('teleport');
    }

    const card = cardRef.current;
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    
    // Define safe movement boundaries relative to the button's starting spot.
    // We want the button to stay within a reasonable range around the card.
    const maxOffset = 180;
    const minOffset = 70;

    const getRandomOffset = () => {
      const sign = Math.random() > 0.5 ? 1 : -1;
      const val = Math.random() * (maxOffset - minOffset) + minOffset;
      return val * sign;
    };

    let newX = getRandomOffset();
    let newY = getRandomOffset();

    // Ensure it doesn't run fully off-screen (accounting for viewport boundaries)
    const btnWidth = 100;
    const btnHeight = 45;
    const btnLeft = cardRect.left + cardRect.width / 2 + newX - btnWidth / 2;
    const btnTop = cardRect.top + cardRect.height - 80 + newY - btnHeight / 2;

    if (btnLeft < 20) newX += 120;
    if (btnLeft > window.innerWidth - btnWidth - 20) newX -= 120;
    if (btnTop < 20) newY += 120;
    if (btnTop > window.innerHeight - btnHeight - 20) newY -= 120;

    setNoPosition({ x: newX, y: newY });
  };

  const handleYes = () => {
    if (window.playUISfx) {
      window.playUISfx('success');
    }
    
    setIsSuccess(true);

    // Generate burst particles
    const newParticles: LoveParticle[] = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400 - 50,
      scale: Math.random() * 1.5 + 0.5,
      rotation: Math.random() * 360,
    }));

    setParticles(newParticles);

    // Proceed to Screen 3 after burst finishes
    setTimeout(() => {
      onSuccess();
    }, 1800);
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center bg-transparent px-4 py-12">
      <AnimatePresence>
        {!isSuccess ? (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full max-w-md glass-panel p-8 rounded-3xl text-center select-none preserve-3d"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-biolum-pink rounded-full opacity-20 blur-md"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-white/10 text-amber-300">
                  <ShieldAlert size={32} />
                </div>
              </div>
            </div>

            <h2 className="font-serif text-3xl font-bold tracking-tight text-white mb-2">
              First, a quick verification! 🧐
            </h2>
            <p className="text-zinc-400 font-sans text-base mb-8">
              Do you love your brother?
            </p>

            <div className="relative flex items-center justify-center gap-6 h-28">
              {/* YES! Button */}
              <motion.button
                onClick={handleYes}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="z-10 px-8 py-3.5 rounded-full bg-gradient-to-r from-biolum-pink to-biolum-purple text-white font-bold shadow-lg shadow-biolum-pink/20 hover:shadow-biolum-pink/40 border border-white/10 cursor-pointer flex items-center gap-2 transition-shadow"
              >
                <Heart className="fill-white" size={18} />
                YES! ❤️
              </motion.button>

              {/* runaway NO button */}
              <motion.button
                animate={{ x: noPosition.x, y: noPosition.y }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                onMouseEnter={handleNoRunaway}
                onTouchStart={(e) => {
                  e.preventDefault(); // Prevent standard touch triggers
                  handleNoRunaway();
                }}
                className="absolute px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 font-medium cursor-pointer flex items-center gap-2"
                style={{ left: 'calc(50% + 20px)' }}
              >
                <HeartCrack size={16} />
                No 😢
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="relative flex items-center justify-center w-full max-w-md h-[400px]">
            {/* Celebration Particle Burst */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.2 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: p.scale,
                  rotate: p.rotation,
                }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute text-biolum-pink"
              >
                <Heart className="fill-current" size={24} />
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="text-center"
            >
              <h2 className="font-serif text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-biolum-pink to-amber-300 glow-pink">
                I knew it! ❤️✨
              </h2>
              <p className="text-zinc-400 font-sans text-sm mt-3 tracking-widest uppercase">
                Verification complete
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

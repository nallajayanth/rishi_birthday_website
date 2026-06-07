import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'start' | '1A' | '1B'>('start');
  const [typedText, setTypedText] = useState('');
  const fullText = "A little surprise is waiting for you... Let's see what it is! 👀";

  useEffect(() => {
    if (stage === '1A') {
      const timer = setTimeout(() => {
        setStage('1B');
      }, 5000); // Hold for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === '1B') {
      let index = 0;
      const typeInterval = setInterval(() => {
        setTypedText((prev) => prev + fullText.charAt(index));
        index++;
        if (index >= fullText.length) {
          clearInterval(typeInterval);
          
          // Hold for 1.5 seconds after typing finishes, then dissolve
          setTimeout(() => {
            onComplete();
          }, 1500);
        }
      }, 50); // 50ms per letter typing speed

      return () => clearInterval(typeInterval);
    }
  }, [stage]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center bg-transparent px-6 text-center select-none">
      <AnimatePresence mode="wait">
        {stage === 'start' && (
          <motion.div
            key="stage-start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center justify-center space-y-8 max-w-lg"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-biolum-pink rounded-full opacity-10 blur-xl animate-pulse"
                style={{ filter: 'blur(24px)' }}
              />
              <motion.h1 
                className="font-serif text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-rose-300 to-amber-200 glow-pink md:text-5xl leading-tight text-center"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                A Magical Surprise Awaits... ✨
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-sm font-sans tracking-wide text-zinc-400 font-light leading-relaxed max-w-sm"
            >
              Put on your headphones or turn up your sound for the full experience.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, type: 'spring' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (window.startBackgroundMusic) {
                  window.startBackgroundMusic();
                }
                if (window.playUISfx) {
                  window.playUISfx('success');
                }
                setStage('1A');
              }}
              className="px-8 py-4 bg-gradient-to-r from-biolum-pink to-biolum-purple hover:shadow-[0_0_30px_rgba(255,42,133,0.5)] text-white font-bold rounded-full cursor-pointer shadow-lg flex items-center gap-2 group font-sans text-sm tracking-wider uppercase border border-white/15 transition-all duration-300"
            >
              <span>Open the Surprise 🎁</span>
            </motion.button>
          </motion.div>
        )}

        {stage === '1A' && (
          <motion.div
            key="stage-1a"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <motion.h1 
              className="font-serif text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-violet-300 glow-pink md:text-6xl lg:text-7xl leading-tight"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Happy Birthday to my amazing sister! 🎉✨
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono"
            >
              A magical experience designed just for you
            </motion.p>
          </motion.div>
        )}

        {stage === '1B' && (
          <motion.div
            key="stage-1b"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center max-w-xl"
          >
            <h2 className="font-mono text-xl font-light leading-relaxed text-zinc-300 md:text-3xl">
              <span>{typedText}</span>
              <span className="inline-block w-1.5 h-6 ml-1 bg-biolum-pink cursor-blink border-r-2 border-biolum-pink" />
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

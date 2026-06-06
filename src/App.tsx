import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CanvasFireflies } from './components/CanvasFireflies';
import { BioluminescentCursor } from './components/BioluminescentCursor';
import { AudioEngine } from './components/AudioEngine';
import { CinematicIntro } from './components/CinematicIntro';
import { VerificationCard } from './components/VerificationCard';
import { LetterOfLove } from './components/LetterOfLove';
import { MemoryGrid } from './components/MemoryGrid';
import { FinalPromise } from './components/FinalPromise';
import { ArrowDown } from 'lucide-react';

type AppStage = 'intro' | 'verification' | 'letter' | 'game';

function App() {
  const [stage, setStage] = useState<AppStage>('intro');
  const [allMatched, setAllMatched] = useState(false);

  // Auto-scroll to the Climax/Promise when unlocked
  useEffect(() => {
    if (allMatched) {
      setTimeout(() => {
        const promiseEl = document.getElementById('promise-section');
        if (promiseEl) {
          promiseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1000);
    }
  }, [allMatched]);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-x-hidden">
      {/* 1. Global Cinematic Elements */}
      <CanvasFireflies />
      <BioluminescentCursor />
      <AudioEngine />

      {/* 2. Global background glowing accent spots */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-biolum-pink/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-biolum-purple/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      {/* 3. Screen Stage Router */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div
              key="intro-screen"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <CinematicIntro onComplete={() => setStage('verification')} />
            </motion.div>
          )}

          {stage === 'verification' && (
            <motion.div
              key="verification-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <VerificationCard onSuccess={() => setStage('letter')} />
            </motion.div>
          )}

          {stage === 'letter' && (
            <motion.div
              key="letter-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <LetterOfLove onUnlock={() => setStage('game')} />
            </motion.div>
          )}

          {stage === 'game' && (
            <motion.div
              key="game-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full flex flex-col items-center"
            >
              {/* Game & Galleries */}
              <MemoryGrid onAllMatched={() => setAllMatched(true)} />

              {/* Scroll down indicator for game completion */}
              {allMatched && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: [0, 10, 0] }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className="flex flex-col items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-widest my-12"
                >
                  <span>Scroll Down for the Final Surprise</span>
                  <ArrowDown size={16} />
                </motion.div>
              )}

              {/* Final Climax Screen */}
              {allMatched && (
                <motion.div
                  id="promise-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="w-full min-h-screen flex items-center justify-center border-t border-white/5"
                >
                  <FinalPromise />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

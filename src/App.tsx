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
import { FamilyMemoryVault } from './components/FamilyMemoryVault';
import { ArrowDown } from 'lucide-react';

type AppStage = 'intro' | 'verification' | 'letter' | 'game' | 'family-vault';

function App() {
  const [stage, setStage] = useState<AppStage>('intro');
  const [allMatched, setAllMatched] = useState(false);
  const [showPromise, setShowPromise] = useState(false);

  // Auto-scroll to the Climax/Promise when manually triggered
  useEffect(() => {
    if (showPromise) {
      setTimeout(() => {
        const promiseEl = document.getElementById('promise-section');
        if (promiseEl) {
          promiseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
    }
  }, [showPromise]);

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

              {/* Floating Button to Proceed to Final surprise */}
              {allMatched && !showPromise && (
                <motion.button
                  initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                  transition={{ type: 'spring', delay: 1 }}
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    setShowPromise(true);
                  }}
                  className="fixed bottom-8 left-1/2 z-40 bg-gradient-to-r from-biolum-pink to-biolum-purple hover:shadow-[0_0_25px_rgba(255,42,133,0.45)] text-white font-bold px-8 py-4 rounded-full cursor-pointer shadow-lg active:scale-95 flex items-center gap-2 group font-sans text-xs tracking-wider uppercase border border-white/10"
                >
                  <span>Read My Brother's Message</span>
                  <ArrowDown size={14} className="animate-bounce" />
                </motion.button>
              )}

              {/* Final Climax Screen */}
              {showPromise && (
                <motion.div
                  id="promise-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="w-full min-h-screen flex items-center justify-center border-t border-white/5"
                >
                  <FinalPromise onNextSurprise={() => setStage('family-vault')} />
                </motion.div>
              )}
            </motion.div>
          )}

          {stage === 'family-vault' && (
            <motion.div
              key="family-vault-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full animate-fade-in"
            >
              <FamilyMemoryVault onBack={() => setStage('game')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

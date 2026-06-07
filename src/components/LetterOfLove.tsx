import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MailOpen } from 'lucide-react';

interface LetterOfLoveProps {
  onUnlock: () => void;
}

export const LetterOfLove: React.FC<LetterOfLoveProps> = ({ onUnlock }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenLetter = () => {
    if (window.playUISfx) {
      window.playUISfx('success');
    }
    setIsOpen(true);
  };

  const handleNextStage = () => {
    if (window.playUISfx) {
      window.playUISfx('click');
    }
    onUnlock();
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center bg-transparent px-4 py-16">
      <div className="w-full max-w-xl preserve-3d">
        {!isOpen ? (
          /* Sealed Glowing Envelope */
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 100 }}
            onClick={handleOpenLetter}
            className="group relative w-full h-[280px] rounded-3xl glass-panel border border-white/10 hover:border-amber-300/40 p-6 flex flex-col items-center justify-center cursor-pointer shadow-2xl select-none"
            whileHover={{ scale: 1.02 }}
          >
            {/* Ambient gold glow */}
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 rounded-3xl" />
            
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300 mb-6 group-hover:text-amber-200 group-hover:border-amber-300/60 transition-all duration-300 shadow-lg group-hover:shadow-amber-500/10"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MailOpen size={36} />
            </motion.div>
            
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-white text-center">
              You have a secret letter...
            </h2>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mt-3">
              Click to Open
            </p>
          </motion.div>
        ) : (
          /* Open Envelope and Slide Out Letter Sheet */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full flex flex-col items-center"
          >
            {/* Ethereal background aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-rose-500/5 via-violet-500/5 to-amber-500/5 blur-3xl rounded-full pointer-events-none" />

            {/* Letter Sheet */}
            <motion.div
              initial={{ y: 150, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 28, stiffness: 90, delay: 0.1 }}
              className="w-full glass-panel border border-white/10 hover:border-white/15 px-8 py-10 rounded-3xl shadow-2xl relative"
            >
              {/* Gold wax seal watermark */}
              <div className="absolute top-6 right-8 font-serif italic text-4xl text-amber-300/15 pointer-events-none select-none">
                Amma 🤍
              </div>

              {/* Letter Heading */}
              <h3 className="font-serif text-3xl italic font-medium tracking-wide text-amber-300 mb-8 border-b border-white/10 pb-4">
                To My Dearest Amma,
              </h3>

              {/* Letter Paragraph */}
              <p className="font-serif text-lg md:text-xl leading-relaxed text-zinc-200 tracking-wide text-justify italic mb-10 first-letter:text-4xl first-letter:font-bold first-letter:text-biolum-pink first-letter:float-left first-letter:mr-2">
                "Two years ago, when our paths crossed at the institute, I had no idea that destiny was introducing me to my Sister. 
                We didn’t share a childhood, but the bond we’ve built in these two years feels stronger than a lifetime. 
                You became my Sister, my protector, and my guide not by birth, but by choice, and that is a choice I will cherish forever. 
                Thank you for showing me that family isn't defined by blood, but by the love and support we give to each other. Happy Birthday, my dearest Amma..."
              </p>

              {/* Next Step Button */}
              <div className="flex justify-center border-t border-white/10 pt-8">
                <motion.button
                  onClick={handleNextStage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-amber-950 font-bold tracking-wide shadow-xl shadow-amber-500/15 hover:shadow-amber-500/35 cursor-pointer flex items-center gap-2 border border-amber-300/20 active:scale-95 duration-100"
                >
                  Unlock Our Memories 🎮
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

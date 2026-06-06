import React from 'react';
import { motion } from 'framer-motion';

export const FinalPromise: React.FC = () => {
  const sentences = [
    "Through every high and every low, remember that you never walk alone.",
    "Your brother will always be right beside you, shielding you, cheering for you, until his very last breath.",
    "Happy Birthday to my favorite person. 🤍"
  ];

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 2.2, // Stagger each sentence by 2.2 seconds for cinematic reading speed
        delayChildren: 0.8,
      }
    }
  };

  const sentenceVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.8,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center bg-transparent px-6 py-24 select-none">
      
      {/* Bioluminescent dark ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,10,10,0.95)_0%,#050505_100%)] pointer-events-none" />
      
      <div className="relative max-w-2xl text-center flex flex-col items-center">
        
        {/* Pulsating Infinity Symbol / Heart Layout */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="relative mb-12 flex items-center justify-center"
        >
          {/* Outer back glow */}
          <motion.div
            className="absolute w-32 h-20 bg-gradient-to-r from-biolum-pink to-biolum-purple opacity-20 blur-2xl rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.35, 0.15]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* SVG Infinity Symbol */}
          <svg
            width="120"
            height="64"
            viewBox="0 0 120 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative drop-shadow-[0_0_12px_rgba(255,42,133,0.3)]"
          >
            <defs>
              <linearGradient id="infinity-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff2a85" />
                <stop offset="50%" stopColor="#bd00ff" />
                <stop offset="100%" stopColor="#fcd34d" />
              </linearGradient>
            </defs>
            <motion.path
              d="M32 48C45.2548 48 56 37.2548 56 24C56 10.7452 45.2548 0 32 0C18.7452 0 8 10.7452 8 24C8 37.2548 18.7452 48 32 48Z"
              stroke="url(#infinity-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="300"
              initial={{ strokeDashoffset: 300 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
            <motion.path
              d="M88 48C101.255 48 112 37.2548 112 24C112 10.7452 101.255 0 88 0C74.7452 0 64 10.7452 64 24C64 37.2548 74.7452 48 88 48Z"
              stroke="url(#infinity-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="300"
              initial={{ strokeDashoffset: 300 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 3, ease: 'easeInOut', delay: 0.5 }}
            />
          </svg>
        </motion.div>

        {/* Cinematic Staggered Sentences */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 md:space-y-10"
        >
          {sentences.map((sentence, idx) => (
            <motion.p
              key={idx}
              variants={sentenceVariants}
              className={`font-serif text-xl md:text-2xl leading-relaxed text-zinc-300 italic ${
                idx === 2 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-violet-300 font-extrabold text-2xl md:text-3xl glow-pink mt-10' 
                  : ''
              }`}
            >
              {sentence}
            </motion.p>
          ))}

          {/* Sibling Signature */}
          <motion.div
            variants={sentenceVariants}
            className="pt-12 border-t border-white/5"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
              With endless love,
            </p>
            <h4 className="font-serif text-2xl italic font-semibold text-amber-300 mt-2">
              Your Brother 🤍
            </h4>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

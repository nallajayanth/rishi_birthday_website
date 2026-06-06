import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ArrowLeft, ArrowRight, Heart, Star, Sparkles, Home, User, Play, Pause, X, Camera } from 'lucide-react';

interface FamilyCard {
  id: number;
  pairId: string;
  label: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Chapter {
  title: string;
  quote: string;
  story: string;
  image: string;
  themeColor: string;
  icon: React.ReactNode;
}

interface FamilyMemoryVaultProps {
  onBack: () => void;
}

// 1. Dynamically import all family photos inside src/assets/family
const familyImagesGlob = import.meta.glob('../assets/family/family_*.{jpeg,jpg,png}', { eager: true });

const getFamilyNumber = (filename: string): number => {
  const match = filename.match(/family_(\d+)\.(jpeg|jpg|png)$/i);
  if (match) return parseInt(match[1], 10);
  
  const prodMatch = filename.match(/family_(\d+)-[\w\d]+\.(jpeg|jpg|png)$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

// Sort the image URLs naturally sequentially: family_1, family_2...
const familyImageUrls = Object.keys(familyImagesGlob)
  .sort((a, b) => getFamilyNumber(a) - getFamilyNumber(b))
  .map((key) => {
    const module = familyImagesGlob[key] as any;
    return module.default || module;
  });

// High-quality fallback images in case familyImageUrls is empty
const fallbackImages = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80'
];

export const FamilyMemoryVault: React.FC<FamilyMemoryVaultProps> = ({ onBack }) => {
  const [cards, setCards] = useState<FamilyCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  
  // Navigation states
  const [showChapters, setShowChapters] = useState(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'album'>('chapters');
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [showCelebration, setShowCelebration] = useState(false);

  // Lightbox & Slideshow state for Family Album
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);

  // Initialize and shuffle matching game cards (uses first 5 family images)
  useEffect(() => {
    const templates = [
      { pairId: 'mom', label: "Mom's Love 👩‍🍼", image: familyImageUrls[1] || fallbackImages[0] },
      { pairId: 'mom', label: "Mom's Love 👩‍🍼", image: familyImageUrls[1] || fallbackImages[0] },
      { pairId: 'pinni', label: "Playful Pinni 🤪", image: familyImageUrls[20] || fallbackImages[1] },
      { pairId: 'pinni', label: "Playful Pinni 🤪", image: familyImageUrls[20] || fallbackImages[1] },
      { pairId: 'brother', label: 'Brother 🛡️', image: familyImageUrls[2] || fallbackImages[2] },
      { pairId: 'brother', label: 'Brother 🛡️', image: familyImageUrls[2] || fallbackImages[2] },
      { pairId: 'sister', label: 'Sister (Rishi) ✨', image: familyImageUrls[4] || fallbackImages[3] },
      { pairId: 'sister', label: 'Sister (Rishi) ✨', image: familyImageUrls[4] || fallbackImages[3] },
      { pairId: 'family', label: 'Family Together 🏡', image: familyImageUrls[15] || fallbackImages[4] },
      { pairId: 'family', label: 'Family Together 🏡', image: familyImageUrls[15] || fallbackImages[4] },
    ];

    const shuffled = templates
      .map((c, i) => ({ ...c, id: i, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'ArrowLeft') {
        if (window.playUISfx) window.playUISfx('click');
        setLightboxIdx((prev) => (prev !== null ? (prev - 1 + familyImageUrls.length) % familyImageUrls.length : null));
      } else if (e.key === 'ArrowRight') {
        if (window.playUISfx) window.playUISfx('click');
        setLightboxIdx((prev) => (prev !== null ? (prev + 1) % familyImageUrls.length : null));
      } else if (e.key === 'Escape') {
        setLightboxIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIdx]);

  // Slideshow Autoplay Timer
  useEffect(() => {
    if (!slideshowActive || lightboxIdx === null) return;
    const interval = setInterval(() => {
      setLightboxIdx((prev) => (prev !== null ? (prev + 1) % familyImageUrls.length : null));
    }, 3000);
    return () => clearInterval(interval);
  }, [slideshowActive, lightboxIdx]);

  // Handle Card Click (Matching Game)
  const handleCardClick = (idx: number) => {
    if (window.playUISfx) window.playUISfx('click');

    const clickedCard = cards[idx];
    if (clickedCard.isMatched || clickedCard.isFlipped || flippedIndices.length >= 2) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[idx].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    // Check for match
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        // MATCH FOUND
        setTimeout(() => {
          if (window.playUISfx) window.playUISfx('match');

          const matchedCards = [...updatedCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);

          const nextMatches = matchesCount + 1;
          setMatchesCount(nextMatches);

          if (nextMatches === 5) {
            // WIN
            setTimeout(() => {
              if (window.playUISfx) window.playUISfx('win');
              setShowChapters(true);
            }, 1200);
          }
        }, 500);
      } else {
        // NO MATCH -> Flip back
        setTimeout(() => {
          const resetCards = [...updatedCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // Memory Chapters data (uses family images 6 to 10)
  const chapters: Chapter[] = [
    {
      title: "Chapter 1: The Circle of Warmth",
      quote: "Family is where life begins and love never ends.",
      story: "Siri, you are the heartbeat of our family. Together, we have built a sanctuary of laughter, shared meals, and unwavering strength. No matter where we go, we are bound by a love that is unconditional and forever. You are our greatest strength.",
      image: familyImageUrls[5] || fallbackImages[4],
      themeColor: "from-pink-500/20 to-purple-500/20",
      icon: <Home size={20} className="text-pink-400 animate-pulse" />
    },
    {
      title: "Chapter 2: A Mother's Blessing",
      quote: "A mother's arms are made of tenderness and children sleep soundly in them.",
      story: "Mom's love is your silent shield. Her warm hugs, endless encouragement, and constant prayers have shaped you into the strong, beautiful woman you are today. She is your safest harbor, and her pride in you has no bounds.",
      image: familyImageUrls[34] || fallbackImages[0],
      themeColor: "from-rose-500/20 to-amber-500/20",
      icon: <Heart size={20} className="text-rose-400 animate-pulse" />
    },
    {
      title: "Chapter 3: The Playful Bond (Pinni)",
      quote: "Arguments, teasing, and reverse talk—our funny battles never end, but our love is forever.",
      story: "You and your Pinni are the ultimate Tom & Jerry duo of our family! Whether it's answering back in reverse or teasing each other endlessly, your funny fights fill the house with laughter. Beneath all the playful banter lies Pinni's deep, unconditional love for you. She is always cheering for you and wishes you the absolute happiest birthday! Keep smiling and keep teasing! 🤍",
      image: familyImageUrls[20] || fallbackImages[1],
      themeColor: "from-orange-500/20 to-rose-500/20",
      icon: <Star size={20} className="text-orange-400 animate-pulse" />
    },
    {
      title: "Chapter 4: Sibling Love",
      quote: "We share a bond that time cannot erase, a sibling love filled with laughter and grace.",
      story: "Siri, your loving brother is sending you his warmest wishes! He cherishes every childhood memory, every shared joke, and the beautiful, protective bond you share. He stands as your constant support, wishing you a year filled with grand successes, infinite smiles, and everything you have ever dreamed of. Happy Birthday to his favorite sister! 💖",
      image: familyImageUrls[0] || fallbackImages[2],
      themeColor: "from-amber-500/20 to-red-500/20",
      icon: <User size={20} className="text-amber-400 animate-pulse" />
    },
    {
      title: "Chapter 5: Chapters Yet Written",
      quote: "The future belongs to those who believe in the beauty of their dreams.",
      story: "This is just the beginning, Siri. A blank page lies ahead, waiting for your touch. We can't wait to see you conquer your goals, write new adventures, and fill the world with your radiant light. We love you infinitely! Happy Birthday! 🎂💖",
      image: familyImageUrls[9] || fallbackImages[3],
      themeColor: "from-violet-500/20 to-fuchsia-500/20",
      icon: <Sparkles size={20} className="text-violet-400 animate-pulse" />
    }
  ];

  const handleNextChapter = () => {
    if (window.playUISfx) window.playUISfx('click');
    if (currentChapterIdx === chapters.length - 1) {
      setShowCelebration(true);
    } else {
      setDirection(1);
      setCurrentChapterIdx((prev) => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    if (window.playUISfx) window.playUISfx('click');
    if (currentChapterIdx > 0) {
      setDirection(-1);
      setCurrentChapterIdx((prev) => prev - 1);
    }
  };

  // Back Button Navigation
  const handleBackClick = () => {
    if (window.playUISfx) window.playUISfx('click');
    if (showCelebration) {
      setShowCelebration(false);
      setCurrentChapterIdx(0);
      setActiveTab('chapters');
    } else if (showChapters) {
      setShowChapters(false);
    } else {
      onBack();
    }
  };

  // Slide Animation Variants
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 25 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 25 },
        opacity: { duration: 0.3 }
      }
    })
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] px-4 py-20 text-zinc-100 overflow-hidden">
      
      {/* Global Background Glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-biolum-pink/5 to-transparent blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-biolum-purple/5 to-transparent blur-[140px]" />
      </div>

      {/* Back Navigation Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer text-xs font-mono uppercase tracking-wider active:scale-95"
      >
        <ArrowLeft size={14} />
        <span>{showChapters && !showCelebration ? 'Back to Grid' : 'Back to Galleries'}</span>
      </button>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        
        {/* PHASE 1: CARD MATCHING GAME */}
        {!showChapters && (
          <div className="w-full flex flex-col items-center space-y-10">
            <div className="text-center space-y-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-500/20 text-amber-300 text-xs font-mono tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(252,211,77,0.1)]"
              >
                <Lock size={12} className="animate-pulse" />
                Memory Vault Unlocked
              </motion.div>
              <h1 className="font-serif italic text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-amber-200 to-zinc-100 drop-shadow glow-gold leading-tight">
                The Family Memory Vault
              </h1>
              <p className="font-sans text-sm text-zinc-400 max-w-lg mx-auto">
                Flip and match the family members to reveal the golden chapters of your life.
              </p>
            </div>

            {/* Grid of 10 Cards (5 Pairs) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full max-w-3xl px-2">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="w-full aspect-[3/4] cursor-pointer preserve-3d select-none"
                  onClick={() => handleCardClick(idx)}
                >
                  <motion.div
                    className="relative w-full h-full rounded-2xl preserve-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 480, mass: 0.6 }}
                  >
                    {/* CARD BACK */}
                    <div className="absolute inset-0 w-full h-full backface-hidden glass-panel rounded-2xl border border-white/8 flex flex-col items-center justify-center p-3 bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950/20 shadow-lg">
                      <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-amber-500/10 via-transparent to-purple-500/10 opacity-30 pointer-events-none" />
                      <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/5 shadow-[0_0_15px_rgba(252,211,77,0.12)]">
                        <Lock size={18} className="text-amber-300" />
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 tracking-[0.2em] mt-3 uppercase font-semibold">
                        Family
                      </span>
                    </div>

                    {/* CARD FRONT */}
                    <div
                      className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden glass-panel flex flex-col transition-all duration-300 ${
                        card.isMatched
                          ? 'border-2 border-amber-400 shadow-[0_0_20px_rgba(252,211,77,0.35)]'
                          : 'border border-white/20'
                      }`}
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <img src={card.image} alt={card.label} className="w-full h-full object-cover filter brightness-90 saturate-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3">
                        <span className="text-[10px] font-mono tracking-widest text-amber-200 uppercase font-extrabold flex items-center gap-1.5">
                          {card.isMatched && <Unlock size={10} className="text-amber-400" />}
                          {card.label.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Score Tracker */}
            <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 bg-white/3 border border-white/5 px-4 py-2 rounded-full">
              <span>MATCHED:</span>
              <span className="text-amber-300 font-bold">{matchesCount} / 5</span>
            </div>
          </div>
        )}

        {/* PHASE 2: DUAL-TAB POST-GAME (Chapters & Full Album) */}
        {showChapters && !showCelebration && (
          <div className="w-full flex flex-col items-center space-y-8">
            
            {/* Sliding Header Tabs */}
            <div className="flex p-1 bg-white/5 rounded-full border border-white/10 shadow-lg relative select-none">
              <button
                onClick={() => {
                  if (window.playUISfx) window.playUISfx('click');
                  setActiveTab('chapters');
                }}
                className={`relative px-6 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase cursor-pointer z-10 duration-200 ${
                  activeTab === 'chapters' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Memory Chapters 📖
                {activeTab === 'chapters' && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => {
                  if (window.playUISfx) window.playUISfx('click');
                  setActiveTab('album');
                }}
                className={`relative px-6 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase cursor-pointer z-10 duration-200 ${
                  activeTab === 'album' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Family Album 📸
                {activeTab === 'album' && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* TAB 1: CHAPTERS STORYBOOK */}
            {activeTab === 'chapters' && (
              <div className="w-full flex flex-col items-center space-y-8">
                {/* Progress bar */}
                <div className="w-full max-w-md flex flex-col items-center space-y-2">
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    Chapter {currentChapterIdx + 1} of {chapters.length}
                  </span>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-biolum-pink to-biolum-purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentChapterIdx + 1) / chapters.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Chapter Page */}
                <div className="relative w-full min-h-[440px] flex items-center justify-center">
                  <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                      key={currentChapterIdx}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center bg-zinc-950/85 backdrop-blur-xl relative overflow-hidden"
                    >
                      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-br ${chapters[currentChapterIdx].themeColor} blur-[80px] pointer-events-none`} />

                      {/* 3D hover image */}
                      <motion.div
                        className="relative w-full md:w-2/5 aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 shadow-xl select-none"
                        whileHover={{ scale: 1.03, rotateY: 8, rotateX: -4 }}
                        style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                      >
                        <img
                          src={chapters[currentChapterIdx].image}
                          alt={chapters[currentChapterIdx].title}
                          className="w-full h-full object-cover filter brightness-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </motion.div>

                      {/* Story elements */}
                      <div className="w-full md:w-3/5 space-y-5 flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                          {chapters[currentChapterIdx].icon}
                          <h2 className="font-serif italic text-2xl md:text-3xl text-amber-200 tracking-wide drop-shadow-sm">
                            {chapters[currentChapterIdx].title}
                          </h2>
                        </div>

                        <div className="border-l-2 border-rose-500/40 pl-4 py-1">
                          <p className="font-serif text-sm italic text-zinc-400 leading-relaxed">
                            "{chapters[currentChapterIdx].quote}"
                          </p>
                        </div>

                        <p className="font-sans text-sm md:text-[15px] text-zinc-300 leading-relaxed font-light">
                          {chapters[currentChapterIdx].story}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-6 mt-4">
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapterIdx === 0}
                    className={`flex items-center justify-center w-12 h-12 rounded-full glass-panel border border-white/10 text-zinc-400 transition-all duration-300 hover:border-amber-300/30 hover:text-amber-200 active:scale-95 ${
                      currentChapterIdx === 0 ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <button
                    onClick={handleNextChapter}
                    className="relative flex items-center justify-center px-6 py-3 bg-gradient-to-r from-biolum-pink to-biolum-purple text-white font-semibold rounded-full cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,42,133,0.35)] transition-all duration-300 active:scale-95 group font-sans text-xs tracking-wider uppercase gap-1.5"
                  >
                    <span>
                      {currentChapterIdx === chapters.length - 1 ? 'Endless Love' : 'Next Chapter'}
                    </span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COMPLETE 36-PHOTO FAMILY ALBUM */}
            {activeTab === 'album' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                <div className="text-center space-y-1">
                  <h3 className="font-serif italic text-2xl text-amber-200">The Family Album</h3>
                  <p className="font-sans text-xs text-zinc-500 uppercase tracking-widest">
                    Click any photo to open the interactive slideshow ({familyImageUrls.length} Photos)
                  </p>
                </div>

                {/* Masonry Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full px-2">
                  {familyImageUrls.map((url, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (idx % 12) * 0.05 }}
                      whileHover={{ scale: 1.04, rotateY: 5, rotateX: -5 }}
                      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                      onClick={() => {
                        if (window.playUISfx) window.playUISfx('click');
                        setLightboxIdx(idx);
                      }}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-white/8 shadow-md hover:border-amber-400/40 hover:shadow-[0_0_15px_rgba(252,211,77,0.15)] cursor-pointer bg-zinc-900 group transition-all duration-300 select-none"
                    >
                      <img
                        src={url}
                        alt={`Family memory ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3.5">
                        <span className="text-[10px] font-mono text-amber-200 uppercase font-semibold flex items-center gap-1">
                          <Camera size={10} /> Photo #{idx + 1}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* PHASE 3: FINAL CELEBRATION OVERLAY */}
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl p-8 md:p-12 glass-panel rounded-3xl border border-white/10 shadow-2xl text-center space-y-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950/20 relative overflow-hidden"
          >
            <div className="absolute -top-10 -left-10 w-44 h-44 bg-biolum-pink/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-biolum-purple/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart size={28} className="text-white fill-white animate-pulse" />
            </div>

            <div className="space-y-4">
              <h2 className="font-serif italic text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-violet-300 font-extrabold tracking-wide drop-shadow glow-pink">
                Happy Birthday, Rishi!
              </h2>
              <p className="font-serif text-lg text-zinc-300 italic max-w-md mx-auto leading-relaxed">
                "Our family is complete because of you. Your chapters are the stories we cherish the most."
              </p>
            </div>

            <div className="border-t border-white/5 pt-8 max-w-xs mx-auto space-y-1">
              <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-semibold">
                WITH ENDLESS LOVE & BLESSINGS
              </p>
              <h4 className="font-serif text-xl italic font-semibold text-amber-300">
                From Your Entire Family 🤍
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => {
                  if (window.playUISfx) window.playUISfx('click');
                  setShowCelebration(false);
                  setCurrentChapterIdx(0);
                  setActiveTab('chapters');
                }}
                className="px-6 py-3 border border-white/10 rounded-xl font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:border-white/25 hover:text-white cursor-pointer transition-all active:scale-95"
              >
                Replay Chapters
              </button>
              <button
                onClick={() => {
                  if (window.playUISfx) window.playUISfx('click');
                  setShowChapters(false);
                  setShowCelebration(false);
                  setMatchesCount(0);
                  setCards((prev) =>
                    prev
                      .map((c) => ({ ...c, isFlipped: false, isMatched: false }))
                      .sort(() => Math.random() - 0.5)
                  );
                }}
                className="px-6 py-3 bg-gradient-to-r from-biolum-pink to-biolum-purple text-white font-semibold rounded-xl cursor-pointer shadow hover:shadow-[0_0_15px_rgba(255,42,133,0.3)] font-mono text-[11px] uppercase tracking-wider transition-all active:scale-95"
              >
                Reset matching Game
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* FULL-SCREEN LIGHTBOX & SLIDESHOW OVERLAY */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-auto"
          >
            {/* Top Bar Navigation */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 text-white select-none">
              <span className="font-mono text-xs text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                PHOTO {lightboxIdx + 1} OF {familyImageUrls.length}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    setSlideshowActive(!slideshowActive);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono cursor-pointer transition-all active:scale-95 ${
                    slideshowActive 
                      ? 'border-amber-400 text-amber-300 bg-amber-400/10 shadow-[0_0_8px_rgba(252,211,77,0.2)] font-bold' 
                      : 'border-white/10 text-zinc-300 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {slideshowActive ? <Pause size={12} className="fill-amber-300" /> : <Play size={12} className="fill-zinc-300" />}
                  <span>{slideshowActive ? 'Autoplay ON' : 'Autoplay'}</span>
                </button>

                <button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    setLightboxIdx(null);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 cursor-pointer active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Left Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setLightboxIdx((prev) => (prev !== null ? (prev - 1 + familyImageUrls.length) % familyImageUrls.length : null));
              }}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 z-10"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Center Slide Container */}
            <div className="w-11/12 max-w-4xl max-h-[75vh] flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={familyImageUrls[lightboxIdx]}
                  alt={`Family album ${lightboxIdx + 1}`}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
                />
              </AnimatePresence>
            </div>

            {/* Right Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setLightboxIdx((prev) => (prev !== null ? (prev + 1) % familyImageUrls.length : null));
              }}
              className="absolute right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 z-10"
            >
              <ArrowRight size={20} />
            </button>

            {/* Bottom Keyboard Guide */}
            <span className="absolute bottom-6 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              Use Left / Right arrow keys to browse • Esc to close
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

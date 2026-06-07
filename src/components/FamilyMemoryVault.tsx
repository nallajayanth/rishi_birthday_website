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
  persistCards: FamilyCard[];
  setPersistCards: React.Dispatch<React.SetStateAction<FamilyCard[]>>;
  persistMatches: number;
  setPersistMatches: React.Dispatch<React.SetStateAction<number>>;
  persistShowChapters: boolean;
  setPersistShowChapters: React.Dispatch<React.SetStateAction<boolean>>;
  persistSecretUnlocked: boolean;
  setPersistSecretUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
  persistCurrentChapterIdx: number;
  setPersistCurrentChapterIdx: React.Dispatch<React.SetStateAction<number>>;
  persistShowCelebration: boolean;
  setPersistShowCelebration: React.Dispatch<React.SetStateAction<boolean>>;
}

// 1. Dynamically import all family photos inside src/assets/family
const familyImagesGlob = import.meta.glob('../assets/family/family_*.{jpeg,jpg,png}', { eager: true });

// Dynamically import all my_heart images inside src/assets/my_heart
const heartImagesGlob = import.meta.glob('../assets/my_heart/heart_*.jpeg', { eager: true });

const getHeartNumber = (filename: string): number => {
  const match = filename.match(/heart_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  const prodMatch = filename.match(/heart_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

const heartImageUrls = Object.keys(heartImagesGlob)
  .sort((a, b) => getHeartNumber(a) - getHeartNumber(b))
  .map((key) => {
    const module = heartImagesGlob[key] as any;
    return module.default || module;
  });

// Dynamically import all brother_sister images inside src/assets/brother_sister
const siblingImagesGlob = import.meta.glob('../assets/brother_sister/sibling_*.jpeg', { eager: true });

const getSiblingNumber = (filename: string): number => {
  const match = filename.match(/sibling_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  const prodMatch = filename.match(/sibling_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

const siblingImageUrls = Object.keys(siblingImagesGlob)
  .sort((a, b) => getSiblingNumber(a) - getSiblingNumber(b))
  .map((key) => {
    const module = siblingImagesGlob[key] as any;
    return module.default || module;
  });

const getFamilyNumber = (filename: string): number => {
  const match = filename.match(/family_(\d+)\.(jpeg|jpg|png)$/i);
  if (match) return parseInt(match[1], 10);
  
  const prodMatch = filename.match(/family_(\d+)-[\w\d]+\.(jpeg|jpg|png)$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

interface PhotoMetadata {
  relation: string;
  caption: string;
  tags: string[];
}

const getFamilyPhotoMetadata = (index: number): PhotoMetadata => {
  const fileNum = index + 1;
  switch (fileNum) {
    case 1:
      return { relation: "Brother & Sister 🛡️", caption: "Sibling protective bond & shared laughter", tags: ["Brother", "Rishi", "Childhood"] };
    case 2:
      return { relation: "Mom's Love 👩‍🍼", caption: "A mother's warm hug and infinite blessing", tags: ["Mom", "Love", "Home"] };
    case 3:
      return { relation: "Brother's Support 🛡️", caption: "Always standing strong behind his favorite sister", tags: ["Brother", "Support", "Together"] };
    case 4:
      return { relation: "Siri's Smiles ✨", caption: "Radiant vibes and endless birthday cheer", tags: ["Rishi", "Portraits", "Joy"] };
    case 5:
      return { relation: "Sister (Rishi) 🌸", caption: "The beautiful star of our lives", tags: ["Rishi", "Birthday Girl", "Sister"] };
    case 6:
      return { relation: "Family Circle 🏡", caption: "Where life begins and love never ends", tags: ["Family", "Together", "Home"] };
    case 7:
      return { relation: "Festive Joy 🪔", caption: "Lighting up our home with sweet celebrations", tags: ["Celebration", "Festival", "Home"] };
    case 8:
      return { relation: "Mom's Guidance 💖", caption: "Her gentle words are our daily strength", tags: ["Mom", "Blessing", "Family"] };
    case 9:
      return { relation: "Sisterhood Sparkle 👭", caption: "Shared secrets and lifetime moments", tags: ["Rishi", "Sister", "Sparkle"] };
    case 10:
      return { relation: "Family Gathering 🍽️", caption: "Delicious meals and loudest laughter", tags: ["Family", "Gathering", "Food"] };
    case 11:
      return { relation: "Sibling Teasing 🤪", caption: "Fighting all day, but inseparable always", tags: ["Brother", "Teasing", "Sibling"] };
    case 12:
      return { relation: "Mom's Pride 🥰", caption: "Watching her children grow with pride", tags: ["Mom", "Love", "Pride"] };
    case 13:
      return { relation: "Holiday Escape 🏖️", caption: "Sunny days and waves of happiness", tags: ["Trip", "Vacation", "Family"] };
    case 14:
      return { relation: "Celebrations 🎉", caption: "Cheering for another beautiful year", tags: ["Celebration", "Party", "Joy"] };
    case 15:
      return { relation: "Rishi's Charm 🌟", caption: "Spreading warmth wherever she goes", tags: ["Rishi", "Sister", "Portraits"] };
    case 16:
      return { relation: "Family Portrait 🏡", caption: "Complete, united, and infinitely blessed", tags: ["Family", "Together", "Main"] };
    case 17:
      return { relation: "Winter Warmth ☕", caption: "Chilly evenings made warm by family conversations", tags: ["Family", "Conversations", "Home"] };
    case 18:
      return { relation: "Mom's Smile 😊", caption: "Her smile makes the entire house glow", tags: ["Mom", "Smile", "Love"] };
    case 19:
      return { relation: "Road Trip 🚗", caption: "Exploring new horizons together", tags: ["Trip", "Travel", "Adventure"] };
    case 20:
      return { relation: "Pinni's Banter 🤪", caption: "The playful arguments that we cherish", tags: ["Pinni", "Tom & Jerry", "Teasing"] };
    case 21:
      return { relation: "Playful Pinni 🎭", caption: "Arguments, reverse talk, and absolute love", tags: ["Pinni", "Tom & Jerry", "Wishes"] };
    case 22:
      return { relation: "Sunday Brunch 🥞", caption: "Relaxed mornings and endless cups of chai", tags: ["Family", "Weekend", "Together"] };
    case 23:
      return { relation: "Brotherly Love 🛡️", caption: "He will always fight the world for you", tags: ["Brother", "Protector", "Sibling"] };
    case 24:
      return { relation: "Mom's Comfort 🤗", caption: "The safest place in the world is her hug", tags: ["Mom", "Comfort", "Blessing"] };
    case 25:
      return { relation: "Birthday Bash 🎂", caption: "Cutting cakes and making magical wishes", tags: ["Celebration", "Birthday", "Cake"] };
    case 26:
      return { relation: "Pinni's Support 🤍", caption: "She is always cheering loudest for you", tags: ["Pinni", "Support", "Wishes"] };
    case 27:
      return { relation: "Rishi's Journey 🚀", caption: "Conquering goals and writing new adventures", tags: ["Rishi", "Future", "Portraits"] };
    case 28:
      return { relation: "Sweet Home 🏡", caption: "Where every corner holds a memory", tags: ["Family", "Home", "Love"] };
    case 29:
      return { relation: "Sibling Secrets 🤫", caption: "We share jokes that only we understand", tags: ["Sibling", "Brother", "Secrets"] };
    case 30:
      return { relation: "Mom's Hug 👩‍🍼", caption: "Her embrace shields us from all storms", tags: ["Mom", "Love", "Comfort"] };
    case 31:
      return { relation: "Grand Dinner 🥂", caption: "Celebrating milestones and shared successes", tags: ["Celebration", "Family", "Together"] };
    case 32:
      return { relation: "Pinni's Love 🤪", caption: "Teasing is just her way of saying she cares", tags: ["Pinni", "Love", "Tom & Jerry"] };
    case 33:
      return { relation: "Outing Day 🌳", caption: "Green grass, blue skies, and warm hearts", tags: ["Trip", "Outing", "Together"] };
    case 34:
      return { relation: "Rishi's Dreams ✨", caption: "Shining bright with expectations and goals", tags: ["Rishi", "Dreams", "Future"] };
    case 35:
      return { relation: "A Mother's Blessing 🌹", caption: "Her prayers are your silent shield", tags: ["Mom", "Blessing", "Chapter 2"] };
    case 36:
      return { relation: "Forever Together 💞", caption: "Bounded by love, today and for all tomorrows", tags: ["Family", "Love", "Together"] };
    default:
      return { relation: "Family Memory 📸", caption: "A beautiful moment captured in time", tags: ["Family", "Memory"] };
  }
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

const SECRET_VASAVI_LETTER = `To my favorite human, my absolute heart, Rishi 💖,

Happy 20th Birthday, my love! 🎂

I never thought I could miss someone this much until these walls became so quiet. Ever since your surgery, this place feels so empty. I walk in and there’s no one to fight with, no one to argue with over the silly little things, and no one to laugh with until our stomachs hurt. Everyone says we are like Tom and Jerry, fighting all day, but they don't know that at the end of the day, no matter how much we fight, we always settle down and sleep together.

Every single night, I would drift off to sleep resting my head on your hand. And now... I’m sleeping alone, missing the warmth of your hand, unable to sleep peacefully. I toss and turn, wishing you were right here beside me.

We support each other, we love each other, and we fight like crazy—but we are inseparable. You are not just a roommate to me, Rishi... you are my heart. I know the doctor said you need to take complete rest at home to heal, and I want you to be healthy more than anything. But these 2 months until you return to the hostel feel like an eternity. I am counting down the days, the hours, the minutes until you come back and we can stay together again.

Your brother is making this website of memories just to see you smile, because you deserve the entire world on your 20th birthday. Please take care of yourself, heal quickly, and know that your Vasavi is waiting for you with open arms and a heart full of love.

Happy Birthday, my heart. I love you, and I miss you more than words can ever say. 🤍

Always yours,
Vasavi`;

export const FamilyMemoryVault: React.FC<FamilyMemoryVaultProps> = ({ 
  onBack,
  persistCards,
  setPersistCards,
  persistMatches,
  setPersistMatches,
  persistShowChapters,
  setPersistShowChapters,
  persistSecretUnlocked,
  setPersistSecretUnlocked,
  persistCurrentChapterIdx,
  setPersistCurrentChapterIdx,
  persistShowCelebration,
  setPersistShowCelebration
}) => {
  const cards = persistCards;
  const setCards = setPersistCards;
  const matchesCount = persistMatches;
  const setMatchesCount = setPersistMatches;
  const showChapters = persistShowChapters;
  const setShowChapters = setPersistShowChapters;
  const isHeartSecretUnlocked = persistSecretUnlocked;
  const setIsHeartSecretUnlocked = setPersistSecretUnlocked;
  const currentChapterIdx = persistCurrentChapterIdx;
  const setCurrentChapterIdx = setPersistCurrentChapterIdx;
  const showCelebration = persistShowCelebration;
  const setShowCelebration = setPersistShowCelebration;

  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'chapters' | 'album'>('chapters');
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [chapterRevealTargetIdx, setChapterRevealTargetIdx] = useState<number | null>(null);
  const [showMagicTransition, setShowMagicTransition] = useState(false);
  const [polaroidStack, setPolaroidStack] = useState<number[]>([0, 1, 2]);
  
  // Choice Prompt for Ending / Family Album
  const [showEndChoicePrompt, setShowEndChoicePrompt] = useState(false);
  
  // Sibling Ending states
  const [siblingPolaroidStack, setSiblingPolaroidStack] = useState<number[]>([0, 1, 2, 3, 4]);
  const [showSiblingPromise, setShowSiblingPromise] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  
  // Evasion & PIN lock states
  const [mysteryButtonOffset, setMysteryButtonOffset] = useState({ x: 0, y: 0 });
  const [showPinPad, setShowPinPad] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleMysteryButtonEvasion = () => {
    if (window.playUISfx) window.playUISfx('teleport');
    const rangeX = 140;
    const rangeY = 70;
    let nextX = (Math.random() - 0.5) * rangeX * 2;
    let nextY = (Math.random() - 0.5) * rangeY * 2;
    if (Math.abs(nextX) < 45) nextX = nextX > 0 ? 65 : -65;
    if (Math.abs(nextY) < 20) nextY = nextY > 0 ? 35 : -35;
    setMysteryButtonOffset({ x: nextX, y: nextY });
  };

  const getMysteryConfig = (targetIdx: number) => {
    switch (targetIdx) {
      case 1: // Chapter 2
        return {
          question: "Who holds the key to the warmest hugs, gentlest guidance, and your silent shield? 👩‍🍼",
          mainBtn: "Reveal the Blessing 🌹",
          runawayBtn: "Skip Mom's love 🥺",
          portalText: "Channelling Mom's infinite warmth... 💖",
          cardClass: "border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-rose-950/20",
          btnClass: "from-rose-500 to-red-600 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]",
          glowBgClass: "bg-rose-500/10",
          icon: <Heart size={28} className="text-rose-400 fill-rose-400/20" />,
          ringBorderClass: "border-rose-500/20",
          portalGradient: "from-rose-500/10",
          particleColorClass: "text-rose-500/40",
          textClass: "text-rose-400"
        };
      case 2: // Chapter 3
        return {
          question: "Who is your ultimate partner in endless reverse-talk battles and Tom & Jerry fights? 🤪",
          mainBtn: "Expose the Partner-in-Crime 🎭",
          runawayBtn: "Keep the peace 🕊️",
          portalText: "Preparing for Tom & Jerry battle... 🥊",
          cardClass: "border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.15)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20",
          btnClass: "from-orange-500 to-red-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]",
          glowBgClass: "bg-orange-500/10",
          icon: <Star size={28} className="text-orange-400" />,
          ringBorderClass: "border-orange-500/20",
          portalGradient: "from-orange-500/10",
          particleColorClass: "text-orange-500/40",
          textClass: "text-orange-400"
        };
      case 3: // Chapter 4
        return {
          question: "Who is the favorite protector who fought with you all day but stands as your permanent shield? 🛡️",
          mainBtn: "Reveal My Brother! ⚔️",
          runawayBtn: "Fight him instead 🥊",
          portalText: "Forging sibling bond connection... ✨",
          cardClass: "border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20",
          btnClass: "from-amber-500 to-yellow-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
          glowBgClass: "bg-amber-500/10",
          icon: <User size={28} className="text-amber-400" />,
          ringBorderClass: "border-amber-500/20",
          portalGradient: "from-amber-500/10",
          particleColorClass: "text-amber-500/40",
          textClass: "text-amber-400"
        };
      case 4: // Chapter 5
        return {
          question: "Who is the absolute favorite person counting down the minutes to sleep holding your hand? 💖",
          mainBtn: "Reveal Her Secret Letter! ✉️",
          runawayBtn: "End the journey here 🔒",
          portalText: "Decoding the secret letter... 🔐",
          cardClass: "border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20",
          btnClass: "from-red-500 to-rose-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
          glowBgClass: "bg-red-500/10",
          icon: <Heart size={28} className="text-red-400 fill-red-400/20 animate-pulse" />,
          ringBorderClass: "border-red-500/20",
          portalGradient: "from-red-500/10",
          particleColorClass: "text-red-500/40",
          textClass: "text-red-400"
        };
      default:
        return {
          question: "Who is the next family member waiting to be revealed in the vault? 📸",
          mainBtn: "Reveal Next Memory ✨",
          runawayBtn: "Keep it locked 🔒",
          portalText: "Opening the vault gates... 🔑",
          cardClass: "border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950/20",
          btnClass: "from-violet-500 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]",
          glowBgClass: "bg-violet-500/10",
          icon: <Lock size={28} className="text-violet-400" />,
          ringBorderClass: "border-violet-500/20",
          portalGradient: "from-violet-500/10",
          particleColorClass: "text-violet-500/40",
          textClass: "text-violet-400"
        };
    }
  };

  const checkPin = (pin: string) => {
    if (pin.length === 6) {
      if (pin === '080609') {
        setTimeout(() => {
          if (window.playUISfx) window.playUISfx('success');
          setIsHeartSecretUnlocked(true);
          setShowPinPad(false);
          setEnteredPin('');
        }, 300);
      } else {
        setTimeout(() => {
          if (window.playUISfx) window.playUISfx('click');
          setPinError(true);
          setTimeout(() => {
            setEnteredPin('');
            setPinError(false);
          }, 1000);
        }, 300);
      }
    }
  };

  const rotatePolaroidStack = () => {
    if (window.playUISfx) window.playUISfx('click');
    setPolaroidStack((prev) => {
      const next = [...prev];
      const first = next.shift();
      if (first !== undefined) {
        next.push(first);
      }
      return next;
    });
  };

  const handleConfirmChapterReveal = (targetIdx: number) => {
    if (window.playUISfx) window.playUISfx('teleport');
    setShowMagicTransition(true);

    setTimeout(() => {
      if (window.playUISfx) window.playUISfx('success');
      setShowMagicTransition(false);
      setDirection(1);
      setCurrentChapterIdx(targetIdx);
      setChapterRevealTargetIdx(null);
      setMysteryButtonOffset({ x: 0, y: 0 });
    }, 2500);
  };

  const rotateSiblingPolaroidStack = () => {
    if (window.playUISfx) window.playUISfx('click');
    setSiblingPolaroidStack((prev) => {
      const next = [...prev];
      const first = next.shift();
      if (first !== undefined) {
        next.push(first);
      }
      return next;
    });
  };

  const handlePromiseReveal = () => {
    if (window.playUISfx) window.playUISfx('win');
    setShowSiblingPromise(true);
    
    // Generate floating hearts
    const hearts = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 240,
      y: (Math.random() - 0.5) * 120,
      size: Math.random() * 20 + 10,
    }));
    setFloatingHearts(hearts);
    setTimeout(() => {
      setFloatingHearts([]);
    }, 3000);
  };

  // Lightbox & Slideshow state for Family Album
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);

  // Filter state for Family Album
  const [selectedFamilyTag, setSelectedFamilyTag] = useState<string>('All');
  
  const familyTagsList = ['All', 'Family', 'Rishi', 'Mom', 'Pinni', 'Brother', 'Trip', 'Celebration'];
  
  const filteredFamilyImages = familyImageUrls.map((url, idx) => ({
    url,
    originalIndex: idx,
    metadata: getFamilyPhotoMetadata(idx)
  })).filter(item => {
    return selectedFamilyTag === 'All' || item.metadata.tags.includes(selectedFamilyTag);
  });

  // Initialize and shuffle matching game cards (uses first 5 family images)
  useEffect(() => {
    if (cards.length > 0) return; // Skip if already initialized!
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
      if (lightboxIdx === null || filteredFamilyImages.length === 0) return;
      if (e.key === 'ArrowLeft') {
        if (window.playUISfx) window.playUISfx('click');
        setLightboxIdx((prev) => (prev !== null ? (prev - 1 + filteredFamilyImages.length) % filteredFamilyImages.length : null));
      } else if (e.key === 'ArrowRight') {
        if (window.playUISfx) window.playUISfx('click');
        setLightboxIdx((prev) => (prev !== null ? (prev + 1) % filteredFamilyImages.length : null));
      } else if (e.key === 'Escape') {
        setLightboxIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIdx, filteredFamilyImages.length]);

  // Slideshow Autoplay Timer
  useEffect(() => {
    if (!slideshowActive || lightboxIdx === null || filteredFamilyImages.length === 0) return;
    const interval = setInterval(() => {
      setLightboxIdx((prev) => (prev !== null ? (prev + 1) % filteredFamilyImages.length : null));
    }, 3000);
    return () => clearInterval(interval);
  }, [slideshowActive, lightboxIdx, filteredFamilyImages.length]);

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
      title: "Chapter 5: A Message From Her Heart",
      quote: "No matter where we are, our hearts beat as one, and my world is incomplete without you.",
      story: `Happy 20th Birthday, Rishi! 🎂💖 Wishing you a year full of happiness, laughter, and endless success. Even though we are apart right now, you are always in my thoughts. Have the most wonderful day, my dear!

— Love, Vasavi ✨`,
      image: heartImageUrls[0] || fallbackImages[3],
      themeColor: "from-red-500/20 to-rose-500/20",
      icon: <Heart size={20} className="text-rose-400 animate-pulse fill-rose-400" />
    }
  ];

  const handleNextChapter = () => {
    if (window.playUISfx) window.playUISfx('click');
    if (currentChapterIdx === chapters.length - 1) {
      setShowEndChoicePrompt(true);
    } else {
      setMysteryButtonOffset({ x: 0, y: 0 });
      setChapterRevealTargetIdx(currentChapterIdx + 1);
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

            {/* Score Tracker & Go Forward Button */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 bg-white/3 border border-white/5 px-4 py-2 rounded-full">
                <span>MATCHED:</span>
                <span className="text-amber-300 font-bold">{matchesCount} / 5</span>
              </div>
              
              {matchesCount === 5 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    setShowChapters(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-300 to-amber-400 text-zinc-950 font-bold rounded-xl text-xs font-mono tracking-widest uppercase cursor-pointer shadow-[0_0_15px_rgba(252,211,77,0.3)] flex items-center gap-1.5"
                >
                  <Unlock size={12} />
                  Enter Memory Vault 🔑
                </motion.button>
              )}
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

                      {/* 3D hover image or 3D Polaroid stack for Chapter 5 */}
                      {currentChapterIdx === 4 ? (
                        <div className="relative w-full md:w-2/5 aspect-[4/5] flex items-center justify-center select-none" style={{ perspective: 1200 }}>
                          {polaroidStack.map((imgIdx, stackPos) => {
                            const isFront = stackPos === 0;
                            const rotations = [0, -6, 5];
                            const xOffsets = [0, -15, 15];
                            const yOffsets = [0, 8, -8];
                            const scales = [1, 0.96, 0.92];
                            const zIndices = [30, 20, 10];
                            
                            const imageUrl = heartImageUrls[imgIdx % heartImageUrls.length] || fallbackImages[stackPos % fallbackImages.length];

                            return (
                              <motion.div
                                key={imgIdx}
                                style={{
                                  zIndex: zIndices[stackPos],
                                  transformStyle: 'preserve-3d',
                                }}
                                animate={{
                                  rotateZ: rotations[stackPos],
                                  x: xOffsets[stackPos],
                                  y: yOffsets[stackPos],
                                  scale: scales[stackPos],
                                }}
                                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                whileHover={isFront ? { scale: 1.05, rotateY: 12, rotateX: -6 } : {}}
                                onClick={isFront ? rotatePolaroidStack : undefined}
                                className="absolute w-[85%] aspect-[3.5/4.5] bg-white p-3.5 pb-10 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-zinc-200/50 cursor-pointer flex flex-col justify-between"
                              >
                                <div className="w-full aspect-square overflow-hidden bg-zinc-950 rounded-xl border border-zinc-200/20">
                                  <img
                                    src={imageUrl}
                                    alt={`Heart memory ${imgIdx + 1}`}
                                    className="w-full h-full object-cover filter brightness-95 saturate-110"
                                  />
                                </div>
                                <div className="mt-3 text-center">
                                  <span className="font-serif italic text-zinc-800 text-xs md:text-sm tracking-wider block font-extrabold">
                                    {imgIdx === 0 ? "You & Me 💖" : imgIdx === 1 ? "My Heart, Vasavi ✨" : "Inseparable Roomies 👭"}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono block mt-1">
                                    Photo {imgIdx + 1} of {heartImageUrls.length || 3} • Tap to Rotate
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
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
                      )}

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

                        <p className="font-sans text-sm md:text-[15px] text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                          {currentChapterIdx === 4 && isHeartSecretUnlocked 
                            ? SECRET_VASAVI_LETTER 
                            : chapters[currentChapterIdx].story}
                        </p>

                        {currentChapterIdx === 4 && (
                          <div className="pt-2">
                            {!isHeartSecretUnlocked ? (
                              <motion.button
                                onClick={() => {
                                  if (window.playUISfx) window.playUISfx('click');
                                  setShowPinPad(true);
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] text-white font-bold rounded-xl text-xs font-mono tracking-wider uppercase cursor-pointer flex items-center gap-1.5"
                              >
                                <Lock size={12} />
                                Unlock Her Heart's Secrets 🔑
                              </motion.button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[10px] font-mono tracking-wider uppercase select-none">
                                <Unlock size={10} className="animate-pulse text-rose-400" />
                                <span>Deep Connection Unlocked ❤️</span>
                              </div>
                            )}
                          </div>
                        )}
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
                    Click any photo to open the interactive slideshow ({filteredFamilyImages.length} Photos)
                  </p>
                </div>

                {/* Filter Badges */}
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl px-4 select-none">
                  {familyTagsList.map((tag) => {
                    const isActive = selectedFamilyTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          if (window.playUISfx) window.playUISfx('click');
                          setSelectedFamilyTag(tag);
                          setLightboxIdx(null);
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-amber-300 text-zinc-950 font-bold border border-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.3)]'
                            : 'bg-white/3 border border-white/8 text-zinc-400 hover:text-zinc-200 hover:border-white/15'
                        }`}
                      >
                        {tag === 'All' ? '🌐 All' : tag}
                      </button>
                    );
                  })}
                </div>

                {/* Photo Container */}
                {filteredFamilyImages.length === 0 ? (
                  <div className="text-center py-10 font-sans text-sm text-zinc-500">
                    No memories found for this filter.
                  </div>
                ) : (
                  /* NORMAL GRID WITH CHAPTER STYLING */
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full px-2 select-none">
                      {filteredFamilyImages.map((item, idx) => (
                        <motion.div
                          key={item.originalIndex}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (idx % 12) * 0.04 }}
                          whileHover={{ scale: 1.03, rotateY: 8, rotateX: -4 }}
                          style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                          onClick={() => {
                            if (window.playUISfx) window.playUISfx('click');
                            setLightboxIdx(idx);
                          }}
                          className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 shadow-xl cursor-pointer bg-zinc-900 group transition-all duration-300"
                        >
                          <img
                            src={item.url}
                            alt={item.metadata.caption}
                            className="w-full h-full object-cover filter brightness-95 transition-transform duration-500 group-hover:scale-102"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-4">
                            <span className="text-[9px] font-mono text-amber-300 uppercase tracking-widest block font-bold mb-1">
                              {item.metadata.relation}
                            </span>
                            <h5 className="font-serif italic text-white text-xs leading-tight block group-hover:text-amber-200 transition-colors">
                              {item.metadata.caption}
                            </h5>
                            <div className="flex flex-wrap gap-1 mt-2 opacity-80">
                              {item.metadata.tags.slice(0, 2).map((t) => (
                                <span key={t} className="text-[7px] font-mono bg-white/5 border border-white/10 text-zinc-400 px-1.5 py-0.2 rounded uppercase">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom of the Album CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="w-full max-w-xl mx-auto text-center p-8 mt-12 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-zinc-950/40 to-purple-500/5 shadow-[0_0_25px_rgba(252,211,77,0.06)] relative overflow-hidden select-none"
                    >
                      {/* Ambient glow */}
                      <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/10 via-transparent to-purple-500/10 opacity-30 pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(252,211,77,0.15)] animate-pulse">
                          <Heart size={20} className="text-amber-400 fill-amber-400/20 animate-pulse" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-serif italic text-xl text-amber-200">
                            The Journey of Memories is Complete... ❤️
                          </h4>
                          <p className="font-sans text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                            You've seen all the precious moments of our family. Now, there is one last surprise waiting for you.
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (window.playUISfx) window.playUISfx('win');
                            setShowCelebration(true);
                          }}
                          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 hover:shadow-[0_0_25px_rgba(252,211,77,0.4)] text-zinc-950 font-extrabold rounded-full cursor-pointer text-xs font-mono tracking-widest uppercase transition-all duration-300 active:scale-95 border border-white/20"
                        >
                          <Sparkles size={14} className="animate-spin" />
                          Open Brother's Ending Message 💖
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* PHASE 3: FINAL CELEBRATION OVERLAY */}
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl p-8 md:p-12 glass-panel rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-12"
          >
            {/* Ambient glows */}
            <div className="absolute -top-10 -left-10 w-44 h-44 bg-biolum-pink/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-biolum-purple/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Floating Hearts Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <AnimatePresence>
                {floatingHearts.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: [0, 1.5, 0.8],
                      x: h.x,
                      y: h.y - 180,
                      rotate: Math.random() * 360,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                    className="absolute text-rose-400"
                    style={{ left: '50%', top: '50%', fontSize: `${h.size}px` }}
                  >
                    ❤️
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Left Column: Sibling Polaroid Stack */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <h3 className="font-mono text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-bold mb-8">
                Tap polaroids to rotate memories 📸
              </h3>
              
              <div className="relative w-64 h-80 flex items-center justify-center select-none">
                {siblingPolaroidStack.map((imgIdx, stackIdx) => {
                  const isTop = stackIdx === siblingPolaroidStack.length - 1;
                  const rotation = (stackIdx - 2) * 4 + (isTop ? 0 : (Math.random() - 0.5) * 6);
                  const scale = 0.9 + stackIdx * 0.025;
                  const yOffset = (siblingPolaroidStack.length - 1 - stackIdx) * -12;
                  
                  return (
                    <motion.div
                      key={imgIdx}
                      onClick={isTop ? rotateSiblingPolaroidStack : undefined}
                      className={`absolute w-52 bg-white p-3 pb-8 rounded-xl shadow-2xl border border-zinc-200 cursor-pointer ${
                        isTop ? 'z-30 hover:scale-105' : 'pointer-events-none'
                      }`}
                      style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'bottom center',
                      }}
                      animate={{
                        rotate: rotation,
                        scale: scale,
                        y: yOffset,
                        zIndex: stackIdx,
                      }}
                      whileHover={isTop ? { y: yOffset - 8, rotate: rotation + 1 } : {}}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                      <div className="w-full aspect-[4/5] bg-zinc-100 rounded overflow-hidden relative">
                        <img
                          src={siblingImageUrls[imgIdx % siblingImageUrls.length]}
                          alt={`Sibling Memory ${imgIdx + 1}`}
                          className="w-full h-full object-cover filter brightness-95 contrast-105"
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <span className="font-serif italic text-[11px] text-zinc-700 font-semibold block truncate">
                          {imgIdx % 2 === 0 ? "Through Thick & Thin 🛡️" : "Best Sibling Bond 🤍"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Sibling Letter & Promise */}
            <div className="flex-1 w-full space-y-6 text-center md:text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono tracking-wider uppercase">
                    <Star size={10} className="text-rose-400 fill-rose-400" />
                    The Grand Finale
                  </span>
                </div>
                <h2 className="font-serif italic text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-violet-300 font-extrabold tracking-wide drop-shadow glow-pink leading-tight">
                  Happy 20th Birthday, Amma!
                </h2>
                
                {/* Brother's handwritten-style letter */}
                <div className="glass-panel border border-white/5 bg-white/2 p-6 rounded-2xl space-y-3 font-serif italic text-[13px] md:text-sm text-zinc-300 leading-relaxed text-left shadow-inner">
                  <p>Dearest Amma,</p>
                  <p>
                    As we reach the end of this digital vault of memories, I wanted to leave you with a message straight from my heart. Building this website of our life's special moments was my little way of trying to make you smile—because you deserve all the happiness in the world on your 20th birthday.
                  </p>
                  <p>
                    Distance, times, or whatever obstacles life throws at us will never change the fact that you will always be my favorite person. I will always stand by you, cheer for you, and protect you in every step of your journey.
                  </p>
                  <p className="text-right font-semibold text-amber-200 mt-4">— Always & Forever, Your Brother 🤍</p>
                </div>
              </div>

              {/* Interactive Sibling Promise Button and Text */}
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {!showSiblingPromise ? (
                    <motion.button
                      key="promise-btn"
                      onClick={handlePromiseReveal}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-300 to-amber-400 hover:shadow-[0_0_20px_rgba(252,211,77,0.35)] text-zinc-950 font-bold rounded-xl cursor-pointer transition-all duration-300 text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2 shadow"
                    >
                      <Sparkles size={14} className="animate-pulse" />
                      Reveal Our Sibling Promise 🤝
                    </motion.button>
                  ) : (
                    <motion.div
                      key="promise-text"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)] text-center space-y-1.5"
                    >
                      <h4 className="font-serif italic text-xs text-rose-300 font-bold flex items-center justify-center gap-1">
                        ❤️ Sibling Lifetime Promise
                      </h4>
                      <p className="font-serif italic text-[11px] text-zinc-300 leading-relaxed max-w-md mx-auto">
                        "No matter where we go, or how busy we get, I promise to always listen, always care, and always protect you. You will never have to face the world alone."
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Final Navigation Actions */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                  <button
                    onClick={() => {
                      if (window.playUISfx) window.playUISfx('click');
                      setActiveTab('album');
                      setShowChapters(true);
                      setShowCelebration(false);
                    }}
                    className="px-4 py-2.5 border border-amber-500/20 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10 rounded-xl font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Camera size={12} />
                    Family Album
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.playUISfx) window.playUISfx('click');
                      setShowCelebration(false);
                      setShowChapters(false);
                    }}
                    className="px-4 py-2.5 border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white rounded-xl font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                  >
                    Family Grid
                  </button>

                  <button
                    onClick={() => {
                      if (window.playUISfx) window.playUISfx('click');
                      setShowCelebration(false);
                      setCurrentChapterIdx(0);
                      setActiveTab('chapters');
                    }}
                    className="px-4 py-2.5 border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white rounded-xl font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
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
                    className="px-4 py-2.5 bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 rounded-xl font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                  >
                    Reset Game
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Suspense Mystery Chapter Reveal Prompt */}
      <AnimatePresence>
        {chapterRevealTargetIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-45 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
          >
            {(() => {
              const config = getMysteryConfig(chapterRevealTargetIdx);
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={`w-full max-w-md glass-panel p-8 rounded-3xl border text-center space-y-6 relative overflow-hidden ${config.cardClass}`}
                >
                  {/* Glowing background highlights */}
                  <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${config.glowBgClass}`} />
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${config.glowBgClass}`} />
                  
                  {/* Floating particles icon */}
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center border animate-pulse ${config.glowBgClass} ${config.cardClass.split(' ')[0]}`}>
                    {config.icon}
                  </div>

                  <div className="space-y-3">
                    <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase font-semibold">
                      Chapter {chapterRevealTargetIdx + 1} Locked 🔒
                    </span>
                    <h3 className="font-serif italic text-2xl text-white leading-normal">
                      Who is coming next? 🤔
                    </h3>
                    <p className="font-sans text-sm text-zinc-300 leading-relaxed px-2">
                      {config.question}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    {/* Main Reveal Button */}
                    <button
                      onClick={() => handleConfirmChapterReveal(chapterRevealTargetIdx)}
                      className={`w-full py-3.5 bg-gradient-to-r text-white font-bold rounded-xl cursor-pointer shadow-lg transition-all duration-300 active:scale-95 text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-1.5 ${config.btnClass}`}
                    >
                      <Sparkles size={14} className="animate-spin" />
                      {config.mainBtn}
                    </button>
                    
                    {/* Runaway Button */}
                    <motion.button
                      animate={{ x: mysteryButtonOffset.x, y: mysteryButtonOffset.y }}
                      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                      onMouseEnter={handleMysteryButtonEvasion}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleMysteryButtonEvasion();
                      }}
                      onClick={handleMysteryButtonEvasion}
                      className="w-full py-3 border border-white/10 rounded-xl font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:border-white/20 hover:text-white cursor-pointer transition-all select-none"
                    >
                      {config.runawayBtn}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Choice Prompt */}
      <AnimatePresence>
        {showEndChoicePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md glass-panel p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(252,211,77,0.15)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(252,211,77,0.25)] animate-pulse">
                <Star size={28} className="text-amber-400 fill-amber-400/20" />
              </div>

              <div className="space-y-3">
                <h3 className="font-serif italic text-2xl text-amber-200 font-bold">
                  A Journey of Memories Completed 🌟
                </h3>
                <p className="font-sans text-sm text-zinc-300 leading-relaxed">
                  You've unlocked and read all the chapters, Rishi! Where would you like to go next?
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    setActiveTab('album');
                    setShowChapters(true);
                    setShowCelebration(false);
                    setShowEndChoicePrompt(false);
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-95 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-1.5"
                >
                  <Camera size={14} className="text-amber-400" />
                  Explore Family Album 📸
                </button>

                <button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('win');
                    setShowCelebration(true);
                    setShowEndChoicePrompt(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-biolum-pink to-biolum-purple text-white font-semibold rounded-xl cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,42,133,0.4)] transition-all duration-300 active:scale-95 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-1.5"
                >
                  <Heart size={14} className="text-white animate-pulse" />
                  Go to Sibling Ending (End Here) 💖
                </button>

                <button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    setShowEndChoicePrompt(false);
                  }}
                  className="w-full py-3 border border-white/10 rounded-xl font-mono text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 cursor-pointer transition-all select-none"
                >
                  Cancel & Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Magic Portal Transition */}
      <AnimatePresence>
        {showMagicTransition && (
          (() => {
            const targetIdx = chapterRevealTargetIdx !== null ? chapterRevealTargetIdx : 4;
            const config = getMysteryConfig(targetIdx);
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden pointer-events-auto"
              >
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  {[1, 2, 3, 4, 5].map((ring) => (
                    <motion.div
                      key={ring}
                      className={`absolute rounded-full border ${config.ringBorderClass}`}
                      initial={{ width: 10, height: 10, opacity: 0, rotate: 0 }}
                      animate={{
                        width: [10, 1000],
                        height: [10, 1000],
                        opacity: [0, 0.8, 0],
                        rotate: ring % 2 === 0 ? [0, 360] : [360, 0],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        delay: ring * 0.4,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                  <div className={`absolute w-full h-full bg-gradient-radial ${config.portalGradient} via-transparent to-transparent opacity-60`} />
                </div>

                <div className="absolute inset-0 z-10 pointer-events-none">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const startX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800);
                    const endX = startX + (Math.random() - 0.5) * 300;
                    return (
                      <motion.div
                        key={i}
                        className={`absolute ${config.particleColorClass}`}
                        initial={{
                          x: startX,
                          y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                          scale: Math.random() * 0.5 + 0.5,
                          opacity: 0,
                        }}
                        animate={{
                          y: -100,
                          x: endX,
                          opacity: [0, 0.7, 0],
                          rotate: Math.random() * 360,
                        }}
                        transition={{
                          duration: Math.random() * 2 + 1.5,
                          repeat: Infinity,
                          delay: Math.random() * 1.5,
                          ease: 'easeOut',
                        }}
                      >
                        <Heart size={24} className="fill-current" />
                      </motion.div>
                    );
                  })}
                </div>

                <div className="relative z-20 text-center space-y-6 px-4">
                  <motion.div
                    animate={{
                      rotateY: 360,
                      scale: [0.8, 1.2, 1],
                    }}
                    transition={{
                      rotateY: { duration: 2.5, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 1.5, ease: 'easeInOut' },
                    }}
                    className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-tr flex items-center justify-center border shadow-2xl ${config.glowBgClass} ${config.btnClass}`}
                  >
                    {config.icon}
                  </motion.div>

                  <div className="space-y-2">
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-serif italic text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-amber-200 to-zinc-100 font-extrabold tracking-wide drop-shadow glow-gold"
                    >
                      Unlocking Chapter {targetIdx + 1}...
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className={`font-mono text-[10px] tracking-[0.25em] uppercase font-semibold animate-pulse ${config.textClass}`}
                    >
                      {config.portalText}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )
          })()
        )}
      </AnimatePresence>

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
                PHOTO {lightboxIdx + 1} OF {filteredFamilyImages.length}
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
                setLightboxIdx((prev) => (prev !== null ? (prev - 1 + filteredFamilyImages.length) % filteredFamilyImages.length : null));
              }}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 z-10"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Center Slide Container (Styled like Memory Chapters) */}
            <div className="w-11/12 max-w-4xl flex flex-col items-center gap-4 relative">
              <div className="max-h-[60vh] flex items-center justify-center relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={lightboxIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    src={filteredFamilyImages[lightboxIdx]?.url}
                    alt={filteredFamilyImages[lightboxIdx]?.metadata.caption}
                    className="max-w-full max-h-[60vh] object-contain filter brightness-95 saturate-[1.05]"
                  />
                </AnimatePresence>
              </div>
              
              {/* Photo Description & Tags Panel */}
              <AnimatePresence mode="wait">
                {filteredFamilyImages[lightboxIdx] && (
                  <motion.div
                    key={`desc-${lightboxIdx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-full max-w-lg glass-panel p-4.5 rounded-2xl border border-white/10 text-center space-y-2 bg-zinc-950/85 backdrop-blur-md shadow-xl select-none"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-amber-300 uppercase tracking-widest block font-bold">
                        {filteredFamilyImages[lightboxIdx].metadata.relation}
                      </span>
                      <h4 className="font-serif italic text-white text-sm leading-relaxed">
                        "{filteredFamilyImages[lightboxIdx].metadata.caption}"
                      </h4>
                    </div>
                    {/* Tags list */}
                    <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                      {filteredFamilyImages[lightboxIdx].metadata.tags.map((t) => (
                        <span key={t} className="text-[9px] font-mono bg-white/5 border border-white/10 text-zinc-400 px-2.5 py-0.5 rounded-md uppercase font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Sibling Ending Trigger for Slideshow End */}
                    {lightboxIdx === filteredFamilyImages.length - 1 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => {
                          if (window.playUISfx) window.playUISfx('win');
                          setLightboxIdx(null); // Close lightbox
                          setShowCelebration(true); // Show Sibling Ending
                        }}
                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 hover:shadow-[0_0_15px_rgba(252,211,77,0.35)] text-zinc-950 font-bold rounded-xl cursor-pointer text-xs font-mono tracking-widest uppercase transition-all duration-300 active:scale-95 border border-white/10 flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Sparkles size={12} className="animate-pulse" />
                        Open Brother's Ending Message 💖
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setLightboxIdx((prev) => (prev !== null ? (prev + 1) % filteredFamilyImages.length : null));
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

      {/* PIN Pad Overlay */}
      <AnimatePresence>
        {showPinPad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={pinError ? { x: [0, -10, 10, -10, 10, -5, 5, 0], opacity: 1, scale: 1, y: 0 } : { x: 0, opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 200,
                x: { duration: 0.4 } 
              }}
              className={`w-full max-w-sm glass-panel p-6 rounded-3xl border ${
                pinError 
                  ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.25)]' 
                  : 'border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
              } bg-gradient-to-br from-zinc-950 via-zinc-900 to-rose-950/20 text-center space-y-6 relative overflow-hidden`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute -top-10 -left-10 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <button
                onClick={() => {
                  if (window.playUISfx) window.playUISfx('click');
                  setShowPinPad(false);
                  setEnteredPin('');
                  setPinError(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 z-10"
              >
                <X size={14} />
              </button>

              <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <Lock size={20} className="text-rose-400 fill-rose-400/10" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif italic text-xl text-rose-200">
                  Enter The Heart Passcode
                </h4>
                <p className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase">
                  To view Vasavi's secret wishes
                </p>
              </div>

              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <motion.div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border ${
                      pinError 
                        ? 'bg-red-500/20 border-red-500' 
                        : enteredPin.length > idx 
                          ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]' 
                          : 'border-zinc-700 bg-black/40'
                    }`}
                    animate={pinError ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    onClick={() => {
                      if (window.playUISfx) window.playUISfx('click');
                      if (enteredPin.length < 6 && !pinError) {
                        const nextPin = enteredPin + num;
                        setEnteredPin(nextPin);
                        checkPin(nextPin);
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square rounded-2xl glass-panel border border-white/5 bg-white/2 hover:border-rose-500/20 text-zinc-200 text-lg font-mono flex items-center justify-center cursor-pointer shadow-sm font-semibold active:border-rose-500/40"
                  >
                    {num}
                  </motion.button>
                ))}
                
                <button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    setEnteredPin('');
                    setPinError(false);
                  }}
                  className="aspect-square rounded-2xl glass-panel border border-white/5 bg-white/2 hover:border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-wider flex items-center justify-center cursor-pointer"
                >
                  Clear
                </button>
                
                <motion.button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    if (enteredPin.length < 6 && !pinError) {
                      const nextPin = enteredPin + '0';
                      setEnteredPin(nextPin);
                      checkPin(nextPin);
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square rounded-2xl glass-panel border border-white/5 bg-white/2 hover:border-rose-500/20 text-zinc-200 text-lg font-mono flex items-center justify-center cursor-pointer shadow-sm font-semibold"
                >
                  0
                </motion.button>
                
                <button
                  onClick={() => {
                    if (window.playUISfx) window.playUISfx('click');
                    if (enteredPin.length > 0 && !pinError) {
                      setEnteredPin(enteredPin.slice(0, -1));
                    }
                  }}
                  className="aspect-square rounded-2xl glass-panel border border-white/5 bg-white/2 hover:border-zinc-500/25 text-zinc-400 text-xs font-mono uppercase tracking-wider flex items-center justify-center cursor-pointer"
                >
                  Del
                </button>
              </div>
            </motion.div>
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

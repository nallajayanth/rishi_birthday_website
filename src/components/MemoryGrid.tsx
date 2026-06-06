import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Lock, Unlock, Eye, X, HelpCircle, Trophy, ArrowLeft, ArrowRight, Search } from 'lucide-react';

interface MemoryGridProps {
  onAllMatched: () => void;
  persistCards: Card[];
  setPersistCards: React.Dispatch<React.SetStateAction<Card[]>>;
  persistMatches: number;
  setPersistMatches: React.Dispatch<React.SetStateAction<number>>;
  persistUnlockedGalleries: {
    solo: boolean;
    heart: boolean;
    gossip: boolean;
    friend: boolean;
    sibling: boolean;
    group: boolean;
  };
  setPersistUnlockedGalleries: React.Dispatch<React.SetStateAction<{
    solo: boolean;
    heart: boolean;
    gossip: boolean;
    friend: boolean;
    sibling: boolean;
    group: boolean;
  }>>;
}

interface Card {
  id: number;
  pairId: string;      // e.g. 'solo-1', 'solo-2'
  category: 'solo' | 'heart' | 'gossip' | 'friend' | 'sibling' | 'group';
  imagePlaceholder: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Dynamically import all solo images inside src/assets/solo_pics
const soloImagesGlob = import.meta.glob('../assets/solo_pics/solo_*.jpeg', { eager: true });

const getSoloNumber = (filename: string): number => {
  const match = filename.match(/solo_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  // Try matching with production hash: e.g. solo_35-DWDRah3f.jpeg
  const prodMatch = filename.match(/solo_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

// Sort the 62 images such that solo_35, solo_45, solo_2, and solo_29 appear first, and the rest follow sequentially
const soloFeaturedNumbers = [35, 45, 2, 29];

const soloImageUrls = Object.keys(soloImagesGlob)
  .sort((a, b) => {
    const numA = getSoloNumber(a);
    const numB = getSoloNumber(b);
    
    const featIdxA = soloFeaturedNumbers.indexOf(numA);
    const featIdxB = soloFeaturedNumbers.indexOf(numB);
    
    if (featIdxA !== -1 && featIdxB !== -1) {
      return featIdxA - featIdxB;
    }
    if (featIdxA !== -1) return -1;
    if (featIdxB !== -1) return 1;
    
    return numA - numB;
  })
  .map((key) => {
    const module = soloImagesGlob[key] as any;
    return module.default || module;
  });

const soloCaptions = [
  "Elegant Slay ✨", "Dreamy Vibe 🌸", "Chaotic Energy 🔥", "Pure Radiance 🤍",
  "Golden Hour Glow ☀️", "Confidence is Key 👑", "Stunning Profile 💫", "Sweetest Smile 😊",
  "Simply Gorgeous 💖", "A Whole Mood 😎", "Looking Fab! 💅", "Picture Perfect 📸",
  "Shining Bright 🌟", "Classy & Fabulous 🥂", "Keep Smiling Bright ✨", "Candid Vibe 🍃",
  "Simply Beautiful 💕", "Retro Aesthetic 🕶️", "Charming Vibe 💫", "Eyes That Speak 👀",
  "Pure Joy 😄", "Serene & Calm 🌊", "Radiant Glow 💎", "Sun-kissed ☀️",
  "Happiness Looks Good On You 💛", "Graceful Moments 🕊️", "Slaying Everyday 🔥", "Poser Alert 🚨",
  "Cutest Smile Ever 🥰", "Breathtaking View 🌅", "Elegant Attire 👗", "Stunning Portrait 🎀",
  "Sparkle & Shine ✨", "Too Cool for School 😎", "Heartwarming Smile 💖", "Absolute Icon 🌟",
  "Vibrant Energy ⚡", "Dream Big 🌌", "Sunkissed Perfection ☀️", "A Touch of Magic 🪄",
  "Grace & Beauty 🌸", "Striking a Pose 🧍‍♀️", "Effortlessly Cool 👟", "Pure Serenity 🧘‍♀️",
  "Lovely Expression 🎀", "Full of Life 🌻", "Bold & Beautiful 🌹", "Sweet Memories 🍭",
  "Captivating Eyes 👁️", "Shine Like a Diamond 💎", "Glowing from Within ✨", "Chasing Sunsets 🌇",
  "Classy Look 🎩", "Heart of Gold 💛", "Unstoppable Force 🚀", "Perfect Framing 🖼️",
  "Simply Iconic 🌟", "Radiating Positivity ☀️", "Cherished Snapshot 📸", "Joyful Spirit 🎉",
  "Elegance Redefined ✨", "A Beautiful Soul 🤍",
  "Traditional Grace & Colorful Canopy 🌸✨",
  "Sunkissed Smiles & Endless Horizons 🌅🕶️",
  "Temple Radiance & Divine Vibe 🪔❤️",
  "Teeing Off in Style 🏌️‍♀️⛳",
  "Chikankari Grace & Bougainvillea Blooms 🌸🌿",
  "Rooftop Starlight & Whispering Wind 🌌✨",
  "Concert Chic & Slaying the Night 🖤🎵",
  "Splash of Joy at Wonderla! 🌊✌️",
  "Overcast Sky & Yellow Florals ⛅🌼",
  "Quiet Night Walks & Cozy Flannel 🌲🌙",
  "Bright Campus Days & Warm Smiles 🏫🎓",
  "Vibrant Lehenga & Festivity Joy 🦚💜",
  "Chasing Forest Sunsets & Golden Dreams 🌅🌲",
  "Blessed Moments & Gopuram Graces 🪔🙏",
  "Nature's Frame & Forest Adventures 🌳🍃",
  "Royal Blue & Sacred Serenity 💙✨",
  "Terrace Musings & Pastel Hues ⛅🌸",
  "Skyline Smile & Clear Confident Gaze 🏙️💙",
  "Bicycle Path & Bougainvillea Trail 🚲🌸",
  "Breeze in My Hair, Peace in My Soul 🌬️✨",
  "Rooftop Ukulele & Nighttime Serenade 🎶🎸",
  "Super Hero Energy & Casual Coolness 🦸‍♀️🖤",
  "Fairground Lights & Carnival Magic 🎡✨",
  "Spinning Carousel & Endless Joy 🎠💖"
];

const getTagsForIndex = (index: number) => {
  const customTags: { [key: number]: string[] } = {
    62: ['Elegant', 'Aesthetic'],
    63: ['Smile', 'Glow'],
    64: ['Elegant', 'Glow'],
    65: ['Candid', 'Aesthetic'],
    66: ['Elegant', 'Aesthetic'],
    67: ['Smile', 'Glow'],
    68: ['Elegant', 'Queen'],
    69: ['Candid', 'Smile'],
    70: ['Smile', 'Aesthetic'],
    71: ['Candid', 'Aesthetic'],
    72: ['Smile', 'Candid'],
    73: ['Elegant', 'Aesthetic'],
    74: ['Candid', 'Glow'],
    75: ['Smile', 'Elegant'],
    76: ['Candid', 'Smile'],
    77: ['Elegant', 'Queen'],
    78: ['Aesthetic', 'Glow'],
    79: ['Smile', 'Glow'],
    80: ['Candid', 'Aesthetic'],
    81: ['Candid', 'Smile'],
    82: ['Candid', 'Aesthetic'],
    83: ['Smile', 'Queen'],
    84: ['Smile', 'Glow'],
    85: ['Smile', 'Glow']
  };

  if (customTags[index] !== undefined) {
    return customTags[index];
  }

  const tagPools = [
    ['Elegant', 'Slay'],
    ['Candid', 'Glow'],
    ['Smile', 'Portrait'],
    ['Aesthetic', 'Retro'],
    ['Queen', 'Confidence'],
    ['Joy', 'Happy'],
    ['Golden Hour', 'Glow']
  ];
  return tagPools[index % tagPools.length];
};

const soloGalleryData = soloImageUrls.map((url, index) => {
  const num = getSoloNumber(url);
  const captionIndex = num - 1;
  return {
    id: 100 + index,
    image: url,
    caption: soloCaptions[captionIndex] || `Solo Portrait #${num} ✨`,
    tags: getTagsForIndex(num - 1)
  };
});

// Dynamically import all bestfriends images inside src/assets/bestfriends
const friendImagesGlob = import.meta.glob('../assets/bestfriends/friend_*.jpeg', { eager: true });

const getFriendNumber = (filename: string): number => {
  const match = filename.match(/friend_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  // Try matching with production hash: e.g. friend_1-DWDRah3f.jpeg
  const prodMatch = filename.match(/friend_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

const friendImageUrls = Object.keys(friendImagesGlob)
  .sort((a, b) => getFriendNumber(a) - getFriendNumber(b))
  .map((key) => {
    const module = friendImagesGlob[key] as any;
    return module.default || module;
  });

const friendCaptions = [
  "Crazy Squad Goals 🤙", "Partner in Crime 👯", "Gossip Partners ☕", "Unbreakable Bond 🤍",
  "Late Night Long Drives 🚗", "Laughter & Chaos 😂", "Bestie for Restie 💕", "Creating Core Memories 🌟",
  "Side by Side or Miles Apart 🗺️", "Double Trouble 😈😈", "Soul Sisters 🌸", "Chasing Adventures Together ⛰️",
  "Silly Faces, Warm Hearts 🤪", "Always Got Your Back 🛡️", "The Dream Team 🏆", "Therapy Sessions with Besties 🗣️",
  "Making Every Second Count ⏱️", "Endless Banter & Inside Jokes 💬", "Through Thick & Thin 🤞", "Pure Happiness with You 😊",
  "Our Own Little World ⚖️", "Forever & Always ♾️",
  "Two pretty best friends slaying the day 💅✨",
  "Making ordinary days extraordinary with you! 🌸💫",
  "Laughter is loudest when we are together 😂❤️",
  "Blessed with the absolute best friends 🙏🤍",
  "Through every laugh, every tear, and every selfie 📸💞",
  "No new friends, just the absolute gold ones 🥇💛",
  "Late night talks and matching energy levels ⚡🗣️",
  "Silly poses and endless comfort zone 😜🛌",
  "Chasing suns and making memories 🌅🎒",
  "Friends who become family 🏡💖",
  "Always holding each other up, no matter what 🤝🌸",
  "Smiling through life with you by my side 😊✨",
  "Our friendship is like a cup of warm hot cocoa on a winter night ☕❄️",
  "Pure sunshine in human form! Love you bestie ☀️🥰",
  "To the moon and back, forever best friends 🌙💫"
];

const getFriendTagsForIndex = (index: number) => {
  const tagPools = [
    ['Besties', 'Squad'],
    ['Candid', 'Fun'],
    ['Memories', 'Love'],
    ['Adventure', 'Vibe'],
    ['Sisters', 'Bond'],
    ['Laughter', 'Chaos'],
    ['Cute', 'Vibe']
  ];
  return tagPools[index % tagPools.length];
};

const friendGalleryData = friendImageUrls.map((url, index) => {
  const num = getFriendNumber(url);
  const captionIndex = num - 1;
  return {
    id: 200 + index,
    image: url,
    caption: friendCaptions[captionIndex] || `Best Friend Memory #${num} ✨`,
    tags: getFriendTagsForIndex(num - 1)
  };
});

// Dynamically import all my_heart images inside src/assets/my_heart
const heartImagesGlob = import.meta.glob('../assets/my_heart/heart_*.jpeg', { eager: true });

const getHeartNumber = (filename: string): number => {
  const match = filename.match(/heart_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  // Try matching with production hash: e.g. heart_1-DWDRah3f.jpeg
  const prodMatch = filename.match(/heart_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

const heartImageUrls = Object.keys(heartImagesGlob)
  .sort((a, b) => getHeartNumber(a) - getHeartNumber(b))
  .map((key) => {
    const module = heartImagesGlob[key] as any;
    return module.default || module;
  });

const heartCaptions = [
  "Thickest Best Friend Ever 💕", "My Twin Soul 🌸", "Two Bodies, One Soul 🤍", "Double Trouble 😈😈",
  "Unbreakable Friendship 🤞", "Laughter & Pure Joy 😂", "Gossip Queen Partners ☕", "Best Friend Goals 👭",
  "Always Slaying Together 🔥", "Partner in Crime 👯‍♀️", "Forever and Always ♾️", "Making Every Moment Count ✨",
  "Silly Faces, Warm Hearts 🤪", "Pure Happiness in One Frame 😊", "Shared Secrets & Inside Jokes 🤫", "My Heart & Soul 💖",
  "Holding Hands through Life 🤝", "A Bond beyond Words 🌟", "Sisters by Choice 🤍", "Chasing Sunsets together 🌅",
  "The Perfect Duo 🎀", "Glow-up Partners ✨", "Late Night Conversations 🗣️", "Joyful Memories 🎉",
  "Crazy Times with You 😜", "Got Your Back Always 🛡️", "Unstoppable Together 🚀", "Radiating Happiness ☀️",
  "Simply Inseparable 💞", "My Safe Place 🏰", "Through Thick & Thin 🤞", "A Lifetime of Friendship 🏆",
  "Laughter is Louder with You 😂", "Beautiful Souls 💫", "Sweetest Friendship 🍬", "Double the Fun 🎈",
  "Grateful for You Every Day 🙏", "My Favorite Human 🤍", "Endless Smiles with You 😄", "A Constant in My Life 📌",
  "Side by Side always 👯‍♀️", "Radiant & Stunning ✨", "Pure Love 💖", "Cherishing Every Moment 📸",
  "My Sister & My Bestie 💕", "Slaying Everyday Vibe 🔥", "Warm Hugs & Big Smiles 🤗", "An Eternal Bond ♾️",
  "Brightening My World 🌟", "Inside Jokes & Endless Banter 💬", "My Ultimate Supporter 📣", "A Bond That Never Fades 🍃",
  "Making Memories with You 🗺️", "Two of a Kind 🃏", "Love You to the Moon & Back 🌙", "Simply the Best 🥇",
  "Heartwarming Moments 🥰", "Golden Memories 🌟", "My Heart, My Bestie 💖", "True Sisterhood 👭",
  "Sparkling Friendship ✨", "Forever Bonded ♾️",
  "You are the sparkle in my everyday life ✨💖",
  "Two hearts, one unbreakable connection ♾️🤍"
];

const getHeartTagsForIndex = (index: number) => {
  const customTags: { [key: number]: string[] } = {
    0: ['My Heart', 'Bestie'],     // heart_1
    1: ['Candid', 'Love'],         // heart_2
    2: ['Sisters', 'Bond'],        // heart_3
    3: ['Cute', 'Vibe'],           // heart_4
    4: ['Squad', 'Goals'],         // heart_5
    5: ['Happy', 'Joy'],           // heart_6
    6: ['Glow', 'Slay'],           // heart_7
    7: ['Mirror Selfie', 'Vibe'],  // heart_8
    8: ['Selfie', 'Smile'],        // heart_9
    9: ['Outing', 'Fun'],          // heart_10
    10: ['Laughter', 'Besties'],   // heart_11
    11: ['Adventures', 'Travel'],  // heart_12
    12: ['Blessed', 'Temple'],     // heart_13
    13: ['Cafe Date', 'Food'],     // heart_14
    14: ['Silly Us', 'Fun'],       // heart_15
    15: ['Lovely', 'Glow'],        // heart_16
    16: ['Always', 'Together'],    // heart_17
    17: ['Sunsets', 'Outing'],     // heart_18
    18: ['Gossip', 'Chit-Chat'],   // heart_19
    19: ['Twin Energy', 'Bond'],   // heart_20
    20: ['Slaying', 'Elegant'],    // heart_21
    21: ['Pure Joy', 'Laughter'],  // heart_22
    22: ['Sweetest', 'Memories'],  // heart_23
    23: ['Bestie Goals', 'Love'],  // heart_24
    24: ['Cozy Vibes', 'Happy'],   // heart_25
    25: ['Outing Diaries', 'Vibe'],// heart_26
    26: ['Traditional', 'Grace'],  // heart_27
    27: ['Blessed', 'Prayers'],    // heart_28
    28: ['Wonderla', 'Thrills'],   // heart_29
    29: ['Fairground', 'Joy'],     // heart_30
    30: ['Night Walks', 'Cozy'],   // heart_31
    31: ['Campus Days', 'Smiles'], // heart_32
    32: ['Lehenga Look', 'Slay'],  // heart_33
    33: ['Rooftop', 'Windy'],      // heart_34
    34: ['Starry Night', 'Vibe'],  // heart_35
    35: ['Ukulele', 'Music'],      // heart_36
    36: ['Traditional', 'Glow'],   // heart_37
    37: ['Selfie', 'Slay'],        // heart_38
    38: ['Candid', 'Smile'],       // heart_39
    39: ['Elegant', 'Glow'],       // heart_40
    40: ['Silly Faces', 'Fun'],    // heart_41
    41: ['Best Friends', 'Love'],  // heart_42
    42: ['Mirror Selfie', 'Vibe'],  // heart_43
    43: ['Outing', 'Adventures'],  // heart_44
    44: ['Laughter', 'Loud'],      // heart_45
    45: ['Cozy Talk', 'Coffee'],   // heart_46
    46: ['Forever Bond', 'Heart'], // heart_47
    47: ['Charming', 'Style'],     // heart_48
    48: ['Pure Happiness', 'Joy'], // heart_49
    49: ['Glow-up', 'Slay'],       // heart_50
    50: ['Blessed gopuram', '🪔'], // heart_51
    51: ['Selfie Sparkle', '✨'],  // heart_52
    52: ['Wonderla Splash', '🌊'], // heart_53
    53: ['Double Trouble', '😈'],  // heart_54
    54: ['Golden Hour', '☀️'],     // heart_55
    55: ['Twin Souls', '🤍'],      // heart_56
    56: ['Outing Day', '🎒'],      // heart_57
    57: ['Joyful frame', '🎉'],    // heart_58
    58: ['Elegant grace', '🌸'],   // heart_59
    59: ['Infinite Love', '♾️'],   // heart_60
    60: ['Chasing Sunsets', '🌅'], // heart_61
    61: ['True Sisterhood', '👭'],  // heart_62
    62: ['Sparkle', 'Love'],       // heart_63
    63: ['Connection', 'Bond']     // heart_64
  };

  return customTags[index] || ['My Heart', 'Bestie'];
};

const heartGalleryData = heartImageUrls.map((url, index) => {
  const num = getHeartNumber(url);
  const captionIndex = num - 1;
  return {
    id: 400 + index,
    image: url,
    caption: heartCaptions[captionIndex] || `Heart Memory #${num} 💖`,
    tags: getHeartTagsForIndex(num - 1)
  };
});

// Dynamically import all gossip_partner images inside src/assets/gossip_partner
const gossipImagesGlob = import.meta.glob('../assets/gossip_partner/gossip_*.jpeg', { eager: true });

const getGossipNumber = (filename: string): number => {
  const match = filename.match(/gossip_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  // Try matching with production hash: e.g. gossip_1-DWDRah3f.jpeg
  const prodMatch = filename.match(/gossip_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

const gossipImageUrls = Object.keys(gossipImagesGlob)
  .sort((a, b) => getGossipNumber(a) - getGossipNumber(b))
  .map((key) => {
    const module = gossipImagesGlob[key] as any;
    return module.default || module;
  });

const gossipCaptions = [
  "Partners in Gossip 🗣️☕", "Chit-Chat Queens 👑", "Laughter is Guaranteed 😂", "Unfiltered Conversations 🤐",
  "Spilling the Tea 🍵", "Endless Talks & Fun 💬", "My Favorite Gossip Partner 💕", "A Match Made in Heaven 😇",
  "Two Peas in a Pod 🌱", "Smiling Through it All 😊", "Silly Secrets Shared 🤫", "Always Laughing Together 🌸",
  "Our Own Little World 🌎", "Gossip & Slay ✨", "Besties for Life ♾️", "Glow Queens ✨💅",
  "Dynamic Duo 🔥", "True Friendship Vibes ✌️", "Late Night Debates 🗣️", "Joyful Memories 🎉",
  "Always Slaying together 🔥"
];

const getGossipTagsForIndex = (index: number) => {
  const tagPools = [
    ['Gossip', 'Chit-Chat'],
    ['Besties', 'Love'],
    ['Fun', 'Laughter'],
    ['Candid', 'Bond'],
    ['Happy', 'Joy'],
    ['Glow', 'Slay']
  ];
  return tagPools[index % tagPools.length];
};

const gossipGalleryData = gossipImageUrls.map((url, index) => {
  const num = getGossipNumber(url);
  const captionIndex = num - 1;
  return {
    id: 500 + index,
    image: url,
    caption: gossipCaptions[captionIndex] || `Gossip Partner Memory #${num} 💬`,
    tags: getGossipTagsForIndex(num - 1)
  };
});

// Dynamically import all brother_sister images inside src/assets/brother_sister
const siblingImagesGlob = import.meta.glob('../assets/brother_sister/sibling_*.jpeg', { eager: true });

const getSiblingNumber = (filename: string): number => {
  const match = filename.match(/sibling_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  // Try matching with production hash: e.g. sibling_1-DWDRah3f.jpeg
  const prodMatch = filename.match(/sibling_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

const siblingImageUrls = Object.keys(siblingImagesGlob)
  .sort((a, b) => getSiblingNumber(a) - getSiblingNumber(b))
  .map((key) => {
    const module = siblingImagesGlob[key] as any;
    return module.default || module;
  });

const siblingCaptions = [
  "No matter how old we get, we'll always be the same silly kids pulling faces at each other! 🎡😜",
  "Seeing you happy and smiling is the best part of any celebration. You deserve the world! ✨👫",
  "Side-by-side or miles apart, we are connected by a bond that can never be broken. 📸💜",
  "Adore you, tease you, and squeeze your cheeks! Thanks for always being my sweet sister, even when I'm annoying. 😂❤️",
  "Cafe dates and deep talks. I'm so lucky to have a sister who is also my best friend. ☕✨",
  "Cherishing the simple moments with you. Your laughter makes our home so much brighter! 🌸💛",
  "Golden hour with my constant. No matter where life takes us, I'll always have your back! 🌅🧡",
  "Having you by my side makes every journey easier. Cheers to more food, fun, and endless laughs! 🍕🥤",
  "Temple visits and prayers for you. Thankful to God every day for blessing me with a sister like you. 🪔🙏",
  "No matter how much we tease, fight, or pull faces, you will always be my favorite human! 🎢👊"
];

const getSiblingTagsForIndex = (index: number) => {
  const tagPools = [
    ['Silly Us', 'Fair'],
    ['Celebrations', 'Us'],
    ['Selfie', 'Bond'],
    ['Candid', 'Love'],
    ['Cafe Date', 'Bestie'],
    ['Happy Times', 'Family'],
    ['Sunset', 'Constant'],
    ['Foodies', 'Laughter'],
    ['Blessed', 'Prayers'],
    ['Favorite', 'Forever']
  ];
  return tagPools[index % tagPools.length];
};

const siblingGalleryData = siblingImageUrls.map((url, index) => {
  const num = getSiblingNumber(url);
  const captionIndex = num - 1;
  return {
    id: 300 + index,
    image: url,
    caption: siblingCaptions[captionIndex] || `Brother & Sister Memory #${num} 🤍`,
    tags: getSiblingTagsForIndex(num - 1)
  };
});

// Dynamically import all group photos inside src/assets/group_photos
const groupImagesGlob = import.meta.glob('../assets/group_photos/group_*.jpeg', { eager: true });

const getGroupNumber = (filename: string): number => {
  const match = filename.match(/group_(\d+)\.jpeg$/i);
  if (match) return parseInt(match[1], 10);
  
  // Try matching with production hash: e.g. group_1-DWDRah3f.jpeg
  const prodMatch = filename.match(/group_(\d+)-[\w\d]+\.jpeg$/i);
  return prodMatch ? parseInt(prodMatch[1], 10) : 999;
};

const groupFeaturedNumbers = [33, 25, 2, 46];

const groupImageUrls = Object.keys(groupImagesGlob)
  .sort((a, b) => {
    const numA = getGroupNumber(a);
    const numB = getGroupNumber(b);
    
    const featIdxA = groupFeaturedNumbers.indexOf(numA);
    const featIdxB = groupFeaturedNumbers.indexOf(numB);
    
    if (featIdxA !== -1 && featIdxB !== -1) {
      return featIdxA - featIdxB;
    }
    if (featIdxA !== -1) return -1;
    if (featIdxB !== -1) return 1;
    
    return numA - numB;
  })
  .map((key) => {
    const module = groupImagesGlob[key] as any;
    return module.default || module;
  });

const groupCaptions = [
  "Smiling bright with my favorite human! Duo magic ✨🌸",
  "Sitting peacefully on the temple steps. Blessed moments with the squad 🪔🙏",
  "Pure adrenaline and splashy fun at Wonderla! Duo adventures 🌊🎢",
  "Sweet smiles and warm cozy vibes. Always happy with you! 🤍😊",
  "Candid laughter is the best kind of laughter! Capturing real joy ✨📸",
  "Mirror selfie double trouble! Slaying our look 💅🔥",
  "Late night bus rides and endless chatter. Traveling in style 🚌🌌",
  "Squad assembly point! Ready for another epic adventure together 🎒🌲",
  "Divine blessings and group selfies at the temple gopuram 🪔✨",
  "Sun-kissed selfie! Glowing up together, side by side ☀️💖",
  "The ultimate squad goal. So much love in one single frame! 👭🏆",
  "Chasing cafe dates and sharing sweet treats with the bestie 🍰☕",
  "Smiling through the breeze. You make every day brighter! 🌬️🌸",
  "Happy faces gathered for the best kind of celebration 🎉🥳",
  "Double the cuteness! Sweetest selfie with my favorite partner in crime 🥰🎀",
  "Crazy squad, louder laughter! Making memories that will last forever 🤪💫",
  "Quiet walks and cozy talks. Cherishing these little moments 🍃🤍",
  "Sunset views and endless chats. Best times are with you 🌅✨",
  "Glow-up selfie! Two pretty best friends slaying the day 💎💅",
  "Chilling out and catching up. Effortlessly cool vibes only 👟✌️",
  "Bright eyes and wide smiles. Happiness is homemade with you! 😄💛",
  "Casual day out, but make it look absolutely fab! 👗🕶️",
  "A bond like no other. Always holding hands through life's ride 🤝💖",
  "When the whole squad shows up, chaos and fun are guaranteed! 💥😂",
  "Warm hugs and sweet memories. So grateful for this friendship 🤗💕",
  "Silly poses and inside jokes. Nobody gets me like you do! 😜🃏",
  "Sparkling eyes and beautiful smiles. Radiating pure joy 🌟🤍",
  "Elegant and classy. Slaying our traditional look together! 🦚✨",
  "Outing diaries! Exploring new places with the favorite crew 🗺️🌲",
  "A perfect portrait of friendship. Forever and always ♾️🎀",
  "Laughter is louder when we are together. Duo diaries 😄❤️",
  "Sweet moments and endless peace. So glad you're in my life 🕊️💛",
  "Two peas in a pod. Sharing all the gossip and smiles ☕💬",
  "Squad goals unlocked! Every outing with you guys is an adventure 🎒⛰️",
  "Charming look and gorgeous smiles. Fab duo vibe 💫💅",
  "Gathered under the open sky. Endless conversations and laughter ⛅🌻",
  "Selfie time! Brightening up the day with your lovely smile 🥰☀️",
  "Happy heart and glowing faces. Truly blessed 🤍🪔",
  "Candid giggles. The best moments are always unplanned 🍃✨",
  "Coolest guys in town! Chilling with my favorite best friends 😎🤙",
  "The gang's all here! Creating core memories, one step at a time 🚶‍♀️🌟",
  "Pure comfort and endless laughter. Thank you for being you 🌸💖",
  "Elegant traditional vibes. Looking absolutely stunning! 🪔👗",
  "Smiles that can light up the darkest night. Twin energy ✨💫",
  "Slaying the pose. Confidence looks beautiful on us! 👑🔥",
  "Big group hug! The support system that makes life so beautiful 🤝❤️",
  "Sweetest memory. Cherishing this day forever and ever 📸💞",
  "Mirror reflection selfie! Always capturing the perfect look 🤳💎",
  "Bright smiles, warm hearts. Duo friendship goals 👭💛",
  "Blessed temple visits with these beautiful souls 🪔🙏",
  "Happiness in a frame. You are my sunshine! ☀️🥰",
  "Outing diaries! Walking through the green pathways with the squad 🌳🚶‍♀️",
  "Trips, laughter, and endless fun. The crew that travels together 🚗🎒",
  "Beautiful day out with the best people. Pure serenity 🌿🌤️",
  "Silly faces at the amusement park! Joyful times with the squad 🎡🤪",
  "Gopuram views and sacred prayers. Blessed to have this gang 🪔✨",
  "The best gang ever. Standing tall and proud together! 🏆💪",
  "Sunset group photo. The sky was beautiful, but our laughs were better 🌅❤️",
  "Endless happiness and green valleys. Squad hiking memories ⛰️🍃",
  "Amusement park adventures! Experiencing the thrills with the squad 🎢🤩",
  "Beautiful memories in the making. The squad that stays together, slays together 🔥🌟",
  "The grand finale group photo! Cheers to the friendship that never ends 🥂♾️"
];

const isDuoPhoto = (num: number): boolean => {
  const groupIndices = new Set([
    2, 7, 8, 9, 11, 14, 16, 24, 29, 34, 36, 41, 46, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62
  ]);
  return !groupIndices.has(num);
};

const getGroupTagsForIndex = (num: number): string[] => {
  const isDuo = isDuoPhoto(num);
  const mainTag = isDuo ? 'Duo' : 'Group';
  const tags = [mainTag];
  if (num === 3 || num === 55 || num === 60) tags.push('Wonderla');
  else if (num === 2 || num === 9 || num === 50 || num === 56) tags.push('Temple');
  else if (isDuo) {
    const duoPool = ['Selfie', 'Candid', 'Besties', 'Outing', 'Laughter'];
    tags.push(duoPool[num % duoPool.length]);
  } else {
    const groupPool = ['Squad', 'Outing', 'Memories', 'Adventures', 'Travel'];
    tags.push(groupPool[num % groupPool.length]);
  }
  return tags;
};

const groupGalleryData = groupImageUrls.map((url, index) => {
  const num = getGroupNumber(url);
  const captionIndex = num - 1;
  return {
    id: 600 + index,
    image: url,
    caption: groupCaptions[captionIndex] || `Group Memory #${num} ✨`,
    tags: getGroupTagsForIndex(num)
  };
});

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ThreeDCard: React.FC<ThreeDCardProps> = ({ children, className = '', onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (event.clientX - rect.left) / width - 0.5;
    const mouseY = (event.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative cursor-pointer transition-transform duration-200 ease-out ${className}`}
      whileHover={{ scale: 1.04 }}
    >
      {children}
    </motion.div>
  );
};

export const MemoryGrid: React.FC<MemoryGridProps> = ({
  onAllMatched,
  persistCards,
  setPersistCards,
  persistMatches,
  setPersistMatches,
  persistUnlockedGalleries,
  setPersistUnlockedGalleries
}) => {
  // 1. Memory Game State
  const cards = persistCards;
  const setCards = setPersistCards;
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const matchesCount = persistMatches;
  const setMatchesCount = setPersistMatches;
  
  // Unified Lightbox State
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; captions: string[] } | null>(null);
  const [slideDirection, setSlideDirection] = useState<number>(0);
  
  // Solo Gallery Expand & Filter States
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSoloExpanded, setIsSoloExpanded] = useState<boolean>(false);

  // Heart Gallery Expand & Filter States
  const [selectedHeartTag, setSelectedHeartTag] = useState<string>('All');
  const [heartSearchQuery, setHeartSearchQuery] = useState<string>('');
  const [isHeartExpanded, setIsHeartExpanded] = useState<boolean>(false);

  // Gossip Gallery Expand & Filter States
  const [selectedGossipTag, setSelectedGossipTag] = useState<string>('All');
  const [gossipSearchQuery, setGossipSearchQuery] = useState<string>('');
  const [isGossipExpanded, setIsGossipExpanded] = useState<boolean>(false);
  
  // Friends Gallery Expand & Filter States
  const [selectedFriendTag, setSelectedFriendTag] = useState<string>('All');
  const [friendSearchQuery, setFriendSearchQuery] = useState<string>('');
  const [isFriendExpanded, setIsFriendExpanded] = useState<boolean>(false);
  
  // Sibling Gallery Expand & Filter States
  const [selectedSiblingTag, setSelectedSiblingTag] = useState<string>('All');
  const [siblingSearchQuery, setSiblingSearchQuery] = useState<string>('');
  const [isSiblingExpanded, setIsSiblingExpanded] = useState<boolean>(false);
  
  // Group Gallery Expand & Filter States
  const [selectedGroupTag, setSelectedGroupTag] = useState<string>('All');
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>('');
  const [isGroupExpanded, setIsGroupExpanded] = useState<boolean>(false);
  
  // Gallery Unlock States (True when all pairs of that category are matched)
  const unlockedGalleries = persistUnlockedGalleries;
  const setUnlockedGalleries = setPersistUnlockedGalleries;

  // Highlight flash animations for newly unlocked galleries
  const [flashGallery, setFlashGallery] = useState<'solo' | 'heart' | 'gossip' | 'friend' | 'sibling' | 'group' | null>(null);

  // 2. Initialize Game Cards
  useEffect(() => {
    if (cards.length > 0) return; // Skip if already initialized!
    const cardTemplates: Omit<Card, 'id' | 'isFlipped' | 'isMatched'>[] = [
      { pairId: 'solo-1', category: 'solo', label: 'Solo Portrait', imagePlaceholder: soloImageUrls[0] || 'path_to_solo_1.jpg' },
      { pairId: 'solo-1', category: 'solo', label: 'Solo Portrait', imagePlaceholder: soloImageUrls[0] || 'path_to_solo_1.jpg' },
      { pairId: 'heart-1', category: 'heart', label: 'My Heart 💖', imagePlaceholder: heartImageUrls[0] || 'path_to_heart_1.jpg' },
      { pairId: 'heart-1', category: 'heart', label: 'My Heart 💖', imagePlaceholder: heartImageUrls[0] || 'path_to_heart_1.jpg' },
      { pairId: 'gossip-1', category: 'gossip', label: 'Gossip Partner 💬', imagePlaceholder: gossipImageUrls[0] || 'path_to_gossip_1.jpg' },
      { pairId: 'gossip-1', category: 'gossip', label: 'Gossip Partner 💬', imagePlaceholder: gossipImageUrls[0] || 'path_to_gossip_1.jpg' },

      { pairId: 'friend-1', category: 'friend', label: 'Best Friends 🤍', imagePlaceholder: friendImageUrls[0] || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80' },
      { pairId: 'friend-1', category: 'friend', label: 'Best Friends 🤍', imagePlaceholder: friendImageUrls[0] || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80' },
      { pairId: 'friend-2', category: 'friend', label: 'Besties 🌟', imagePlaceholder: friendImageUrls[1] || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80' },
      { pairId: 'friend-2', category: 'friend', label: 'Besties 🌟', imagePlaceholder: friendImageUrls[1] || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80' },

      { pairId: 'sibling-1', category: 'sibling', label: 'Silly Faces 😜', imagePlaceholder: siblingImageUrls[0] },
      { pairId: 'sibling-1', category: 'sibling', label: 'Silly Faces 😜', imagePlaceholder: siblingImageUrls[0] },
      { pairId: 'sibling-2', category: 'sibling', label: 'Bond Forever ✨', imagePlaceholder: siblingImageUrls[1] },
      { pairId: 'sibling-2', category: 'sibling', label: 'Bond Forever ✨', imagePlaceholder: siblingImageUrls[1] },

      { pairId: 'group-1', category: 'group', label: 'Squad Goals 📸', imagePlaceholder: groupImageUrls[0] || 'path_to_group_1.jpg' },
      { pairId: 'group-1', category: 'group', label: 'Squad Goals 📸', imagePlaceholder: groupImageUrls[0] || 'path_to_group_1.jpg' },
    ];

    // Shuffle cards
    const shuffled = cardTemplates
      .map((card, idx) => ({ ...card, id: idx, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
  }, []);

  // 3. Handle Card Clicks
  const handleCardClick = (clickedIdx: number) => {
    if (window.playUISfx) window.playUISfx('click');

    const clickedCard = cards[clickedIdx];
    
    // Prevent clicking matched, already flipped, or clicking 3rd card during comparison
    if (clickedCard.isMatched || clickedCard.isFlipped || flippedIndices.length >= 2) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[clickedIdx].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, clickedIdx];
    setFlippedIndices(newFlipped);

    // Check for match when two cards are flipped
    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH FOUND!
        setTimeout(() => {
          if (window.playUISfx) window.playUISfx('match');

          const matchedCards = [...updatedCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          
          const newMatchesCount = matchesCount + 1;
          setMatchesCount(newMatchesCount);

          // Check if category is completely matched to unlock the corresponding gallery
          checkCategoryUnlock(matchedCards, firstCard.category as any);
        }, 500);
      } else {
        // NO MATCH -> Flip back after delay
        setTimeout(() => {
          const resetCards = [...updatedCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // 4. Verify Gallery Unlocks
  const checkCategoryUnlock = (currentCards: Card[], category: 'solo' | 'heart' | 'gossip' | 'friend' | 'sibling' | 'group') => {
    const categoryCards = currentCards.filter(c => c.category === category);
    const allMatched = categoryCards.every(c => c.isMatched);

    if (allMatched) {
      setUnlockedGalleries(prev => {
        const next = { ...prev, [category]: true };
        
        // Trigger screen flash animation for category unlock
        setFlashGallery(category);
        setTimeout(() => setFlashGallery(null), 1000);

        if (window.playUISfx) {
          setTimeout(() => window.playUISfx?.('success'), 200);
        }

        // Check if all galleries are now unlocked
        if (next.solo && next.heart && next.gossip && next.friend && next.sibling && next.group) {
          setTimeout(() => {
            if (window.playUISfx) window.playUISfx('win');
            onAllMatched();
          }, 1500);
        }

        return next;
      });
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'ArrowLeft') {
        if (window.playUISfx) window.playUISfx('click');
        setSlideDirection(-1);
        setLightbox(prev => {
          if (!prev) return null;
          return { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length };
        });
      } else if (e.key === 'ArrowRight') {
        if (window.playUISfx) window.playUISfx('click');
        setSlideDirection(1);
        setLightbox(prev => {
          if (!prev) return null;
          return { ...prev, index: (prev.index + 1) % prev.images.length };
        });
      } else if (e.key === 'Escape') {
        setLightbox(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  const openLightbox = (imagesList: string[], idx: number, captionsList: string[]) => {
    if (window.playUISfx) window.playUISfx('click');
    setSlideDirection(0);
    setLightbox({
      images: imagesList,
      index: idx,
      captions: captionsList
    });
  };


  const filteredSoloGallery = soloGalleryData.filter(item => {
    const matchesTag = selectedTag === 'All' || item.tags.includes(selectedTag);
    const matchesSearch = item.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const filteredHeartGallery = heartGalleryData.filter(item => {
    const matchesTag = selectedHeartTag === 'All' || item.tags.includes(selectedHeartTag);
    const matchesSearch = item.caption.toLowerCase().includes(heartSearchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(heartSearchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const filteredGossipGallery = gossipGalleryData.filter(item => {
    const matchesTag = selectedGossipTag === 'All' || item.tags.includes(selectedGossipTag);
    const matchesSearch = item.caption.toLowerCase().includes(gossipSearchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(gossipSearchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const filteredFriendGallery = friendGalleryData.filter(item => {
    const matchesTag = selectedFriendTag === 'All' || item.tags.includes(selectedFriendTag);
    const matchesSearch = item.caption.toLowerCase().includes(friendSearchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(friendSearchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const filteredSiblingGallery = siblingGalleryData.filter(item => {
    const matchesTag = selectedSiblingTag === 'All' || item.tags.includes(selectedSiblingTag);
    const matchesSearch = item.caption.toLowerCase().includes(siblingSearchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(siblingSearchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const filteredGroupGallery = groupGalleryData.filter(item => {
    const matchesTag = selectedGroupTag === 'All' || item.tags.includes(selectedGroupTag);
    const matchesSearch = item.caption.toLowerCase().includes(groupSearchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(groupSearchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center">
      
      {/* 3D Flash Unlock Effect */}
      <AnimatePresence>
        {flashGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className={`fixed inset-0 z-50 pointer-events-none blur-xl bg-gradient-to-r ${
              flashGallery === 'solo'
                ? 'from-biolum-pink/40 to-transparent'
                : flashGallery === 'heart'
                ? 'from-red-500/40 to-transparent'
                : flashGallery === 'gossip'
                ? 'from-teal-500/40 to-transparent'
                : flashGallery === 'friend'
                ? 'from-amber-300/40 to-transparent'
                : flashGallery === 'sibling'
                ? 'from-biolum-purple/40 to-transparent'
                : 'from-purple-500/40 to-transparent'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Screen Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 select-none"
      >
        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white glow-pink mb-4">
          Unlock Our Memory Vault 🗝️
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base font-sans">
          Match the golden geometric cards below. Each full pair matched unlocks a special curated chapter of memories!
        </p>

        {/* Progress Tracker */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs font-mono tracking-widest text-zinc-500 uppercase">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${unlockedGalleries.solo ? 'bg-biolum-pink shadow-[0_0_8px_#ff2a85]' : 'bg-zinc-800'}`} />
            Solo Chapter
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${unlockedGalleries.heart ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-zinc-800'}`} />
            My Heart Chapter
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${unlockedGalleries.gossip ? 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]' : 'bg-zinc-800'}`} />
            Gossip Partner Chapter
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${unlockedGalleries.friend ? 'bg-amber-300 shadow-[0_0_8px_#fcd34d]' : 'bg-zinc-800'}`} />
            Best Friends Chapter
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${unlockedGalleries.sibling ? 'bg-biolum-purple shadow-[0_0_8px_#bd00ff]' : 'bg-zinc-800'}`} />
            Sibling Chapter
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${unlockedGalleries.group ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : 'bg-zinc-800'}`} />
            Squad & Duos Chapter
          </div>
        </div>
      </motion.div>

      {/* GAME GRID */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 md:gap-6 max-w-5xl w-full mb-20">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className="aspect-[3/4] cursor-pointer preserve-3d h-full w-full select-none"
          >
            <motion.div
              className="relative w-full h-full rounded-2xl preserve-3d"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', damping: 22, stiffness: 480, mass: 0.6 }}
            >
              {/* CARD BACK (Luxurious Gold Geometric Pattern) */}
              <div 
                className="absolute inset-0 rounded-2xl glass-panel border border-amber-300/20 hover:border-amber-300/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 flex flex-col items-center justify-center p-3 text-amber-300 backface-hidden"
              >
                {/* Decorative golden geometric square */}
                <div className="w-[85%] h-[85%] border border-amber-500/25 rounded-xl flex items-center justify-center relative">
                  <div className="absolute inset-2 border border-amber-500/10 rounded-lg rotate-45" />
                  <HelpCircle size={22} className="opacity-45 text-amber-300/70" />
                </div>
              </div>

              {/* CARD FRONT (Bioluminescent Card Reveal) */}
              <div
                className={`absolute inset-0 rounded-2xl glass-panel p-2 flex flex-col items-center justify-center text-center backface-hidden bg-gradient-to-tr ${
                  card.category === 'solo' 
                    ? 'border-biolum-pink/30 shadow-[inset_0_0_12px_rgba(255,42,133,0.05)]' 
                    : card.category === 'heart' 
                    ? 'border-red-500/30 shadow-[inset_0_0_12px_rgba(239,68,68,0.05)]' 
                    : card.category === 'gossip' 
                    ? 'border-teal-500/30 shadow-[inset_0_0_12px_rgba(45,212,191,0.05)]' 
                    : card.category === 'friend' 
                    ? 'border-amber-300/30 shadow-[inset_0_0_12px_rgba(252,211,77,0.05)]' 
                    : card.category === 'sibling'
                    ? 'border-biolum-purple/30 shadow-[inset_0_0_12px_rgba(189,0,255,0.05)]'
                    : 'border-purple-500/30 shadow-[inset_0_0_12px_rgba(168,85,247,0.05)]'
                }`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                {/* Visual placeholder inside game card */}
                <div className="w-full h-full rounded-xl bg-black/40 overflow-hidden flex flex-col items-center justify-center border border-white/5 relative p-2">
                  {card.imagePlaceholder && !card.imagePlaceholder.startsWith('path_to_') ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img 
                        src={card.imagePlaceholder} 
                        alt={card.label} 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 duration-350" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                        <span className="text-[9px] text-zinc-300 font-medium font-sans truncate block">{card.label}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest text-center mt-1">
                        {card.category}
                      </div>
                      
                      {/* Glowing decorative indicator */}
                      <span className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center my-3 ${
                        card.category === 'solo' ? 'text-biolum-pink' : card.category === 'heart' ? 'text-red-500' : card.category === 'gossip' ? 'text-teal-400' : card.category === 'friend' ? 'text-amber-300' : card.category === 'sibling' ? 'text-biolum-purple' : 'text-purple-400'
                      }`}>
                        <Trophy size={14} className="opacity-75" />
                      </span>

                      <div className="text-zinc-300 font-medium font-sans text-xs line-clamp-1">
                        {card.label}
                      </div>
                    </>
                  )}

                  {card.isMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-10"
                    >
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                        card.category === 'solo' ? 'border-biolum-pink/40 text-biolum-pink bg-biolum-pink/10' : card.category === 'heart' ? 'border-red-500/40 text-red-500 bg-red-500/10' : card.category === 'gossip' ? 'border-teal-400/40 text-teal-400 bg-teal-400/10' : card.category === 'friend' ? 'border-amber-300/40 text-amber-300 bg-amber-300/10' : card.category === 'sibling' ? 'border-biolum-purple/40 text-biolum-purple bg-biolum-purple/10' : 'border-purple-500/40 text-purple-400 bg-purple-500/10'
                      }`}>
                        Matched
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>      {/* CURATED CHAPTERS / MEMORY GALLERIES */}
      <h3 className="font-serif text-3xl font-bold text-white mb-10 select-none">
        Memory Chapters 📖
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-12">
        
        {/* CHAPTER 1: SOLO GALLERY */}
        <div className="relative">
          <AnimatePresence>
            {!unlockedGalleries.solo && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 rounded-3xl glass-panel border border-white/10 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-biolum-pink mb-4">
                  <Lock size={20} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-1">Solo Portraits</h4>
                <p className="text-zinc-500 font-sans text-xs max-w-[200px]">
                  Match the **Solo Cards** to unlock this chapter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlocked Content */}
          <div className="rounded-3xl glass-panel p-6 border border-biolum-pink/20 hover:border-biolum-pink/40 bg-zinc-950/20 duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="text-biolum-pink font-mono text-sm">[01]</span>
                Solo Portraits
              </h4>
              <span className="text-[10px] bg-biolum-pink/15 text-biolum-pink border border-biolum-pink/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 uppercase tracking-wider">
                <Unlock size={8} /> Unlocked
              </span>
            </div>

            {/* Photo List Preview of First 4 */}
            <div className="grid grid-cols-2 gap-3 flex-grow">
              {soloGalleryData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(soloImageUrls, index, soloGalleryData.map(d => d.caption))}
                  className="group relative aspect-square rounded-xl bg-zinc-900/60 overflow-hidden cursor-pointer border border-white/10 preserve-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                  
                  {/* Real Image */}
                  <img 
                    src={item.image} 
                    alt={item.caption} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                  />

                  {/* Caption & hover reveal */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">{item.caption}</span>
                    <Eye size={12} className="text-biolum-pink opacity-0 group-hover:opacity-100 duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setIsSoloExpanded(!isSoloExpanded);
                if (!isSoloExpanded) {
                  setTimeout(() => {
                    document.getElementById('solo-expanded-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }
              }}
              className="mt-4 w-full py-2 rounded-xl border border-biolum-pink/30 bg-biolum-pink/5 text-biolum-pink hover:bg-biolum-pink/15 hover:border-biolum-pink/50 duration-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isSoloExpanded ? 'Collapse Gallery' : `Explore All ${soloGalleryData.length} Pics ↗`}
            </button>
          </div>
        </div>

        {/* CHAPTER 2: MY HEART GALLERY */}
        <div className="relative">
          <AnimatePresence>
            {!unlockedGalleries.heart && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 rounded-3xl glass-panel border border-white/10 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-red-500 mb-4">
                  <Lock size={20} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-1">My Heart</h4>
                <p className="text-zinc-500 font-sans text-xs max-w-[200px]">
                  Match the **My Heart Cards** to unlock this chapter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlocked Content */}
          <div className="rounded-3xl glass-panel p-6 border border-red-500/20 hover:border-red-500/40 bg-zinc-950/20 duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="text-red-500 font-mono text-sm">[02]</span>
                My Heart
              </h4>
              <span className="text-[10px] bg-red-500/15 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 uppercase tracking-wider">
                <Unlock size={8} /> Unlocked
              </span>
            </div>

            {/* Photo List Preview of First 4 */}
            <div className="grid grid-cols-2 gap-3 flex-grow">
              {heartGalleryData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(heartImageUrls, index, heartGalleryData.map(d => d.caption))}
                  className="group relative aspect-square rounded-xl bg-zinc-900/60 overflow-hidden cursor-pointer border border-white/10 preserve-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                  
                  <img 
                    src={item.image} 
                    alt={item.caption} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                  />

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">{item.caption}</span>
                    <Eye size={12} className="text-red-500 opacity-0 group-hover:opacity-100 duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setIsHeartExpanded(!isHeartExpanded);
                if (!isHeartExpanded) {
                  setTimeout(() => {
                    document.getElementById('heart-expanded-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }
              }}
              className="mt-4 w-full py-2 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/15 hover:border-red-500/50 duration-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isHeartExpanded ? 'Collapse Gallery' : `Explore All ${heartGalleryData.length} Pics ↗`}
            </button>
          </div>
        </div>

        {/* CHAPTER 3: GOSSIP PARTNER GALLERY */}
        <div className="relative">
          <AnimatePresence>
            {!unlockedGalleries.gossip && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 rounded-3xl glass-panel border border-white/10 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-teal-400 mb-4">
                  <Lock size={20} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-1">Gossip Partner</h4>
                <p className="text-zinc-500 font-sans text-xs max-w-[200px]">
                  Match the **Gossip Cards** to unlock this chapter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlocked Content */}
          <div className="rounded-3xl glass-panel p-6 border border-teal-500/20 hover:border-teal-500/40 bg-zinc-950/20 duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="text-teal-400 font-mono text-sm">[03]</span>
                Gossip Partner
              </h4>
              <span className="text-[10px] bg-teal-500/15 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 uppercase tracking-wider">
                <Unlock size={8} /> Unlocked
              </span>
            </div>

            {/* Photo List Preview of First 4 */}
            <div className="grid grid-cols-2 gap-3 flex-grow">
              {gossipGalleryData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(gossipImageUrls, index, gossipGalleryData.map(d => d.caption))}
                  className="group relative aspect-square rounded-xl bg-zinc-900/60 overflow-hidden cursor-pointer border border-white/10 preserve-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                  
                  <img 
                    src={item.image} 
                    alt={item.caption} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                  />

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">{item.caption}</span>
                    <Eye size={12} className="text-teal-400 opacity-0 group-hover:opacity-100 duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setIsGossipExpanded(!isGossipExpanded);
                if (!isGossipExpanded) {
                  setTimeout(() => {
                    document.getElementById('gossip-expanded-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }
              }}
              className="mt-4 w-full py-2 rounded-xl border border-teal-500/30 bg-teal-500/5 text-teal-400 hover:bg-teal-500/15 hover:border-teal-500/50 duration-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isGossipExpanded ? 'Collapse Gallery' : `Explore All ${gossipGalleryData.length} Pics ↗`}
            </button>
          </div>
        </div>

        {/* CHAPTER 4: FRIENDS GALLERY */}
        <div className="relative">
          <AnimatePresence>
            {!unlockedGalleries.friend && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 rounded-3xl glass-panel border border-white/10 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-amber-300 mb-4">
                  <Lock size={20} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-1">Best Friends</h4>
                <p className="text-zinc-500 font-sans text-xs max-w-[200px]">
                  Match the **Best Friend Cards** to unlock this chapter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlocked Content */}
          <div className="rounded-3xl glass-panel p-6 border border-amber-300/20 hover:border-amber-300/40 bg-zinc-950/20 duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="text-amber-300 font-mono text-sm">[04]</span>
                Best Friends
              </h4>
              <span className="text-[10px] bg-amber-300/15 text-amber-300 border border-amber-300/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 uppercase tracking-wider">
                <Unlock size={8} /> Unlocked
              </span>
            </div>

            {/* Photo List */}
            <div className="grid grid-cols-2 gap-3 flex-grow">
              {friendGalleryData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(friendImageUrls, index, friendGalleryData.map(d => d.caption))}
                  className="group relative aspect-square rounded-xl bg-zinc-900/60 overflow-hidden cursor-pointer border border-white/10 preserve-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                  
                  <img 
                    src={item.image} 
                    alt={item.caption} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                  />

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">{item.caption}</span>
                    <Eye size={12} className="text-amber-300 opacity-0 group-hover:opacity-100 duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setIsFriendExpanded(!isFriendExpanded);
                if (!isFriendExpanded) {
                  setTimeout(() => {
                    document.getElementById('friend-expanded-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }
              }}
              className="mt-4 w-full py-2 rounded-xl border border-amber-300/30 bg-amber-300/5 text-amber-300 hover:bg-amber-300/15 hover:border-amber-300/50 duration-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isFriendExpanded ? 'Collapse Gallery' : `Explore All ${friendGalleryData.length} Pics ↗`}
            </button>
          </div>
        </div>

        {/* CHAPTER 5: BROTHER & SISTER */}
        <div className="relative">
          <AnimatePresence>
            {!unlockedGalleries.sibling && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 rounded-3xl glass-panel border border-white/10 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-biolum-purple mb-4">
                  <Lock size={20} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-1">Brother & Sister</h4>
                <p className="text-zinc-500 font-sans text-xs max-w-[200px]">
                  Match the **Sibling Cards** to unlock this chapter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlocked Content */}
          <div className="rounded-3xl glass-panel p-6 border border-biolum-purple/20 hover:border-biolum-purple/40 bg-zinc-950/20 duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="text-biolum-purple font-mono text-sm">[05]</span>
                Brother & Sister
              </h4>
              <span className="text-[10px] bg-biolum-purple/15 text-biolum-purple border border-biolum-purple/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 uppercase tracking-wider">
                <Unlock size={8} /> Unlocked
              </span>
            </div>

            {/* Photo List Preview of First 4 */}
            <div className="grid grid-cols-2 gap-3 flex-grow">
              {siblingGalleryData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(siblingImageUrls, index, siblingGalleryData.map(d => d.caption))}
                  className="group relative aspect-square rounded-xl bg-zinc-900/60 overflow-hidden cursor-pointer border border-white/10 preserve-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                  
                  <img 
                    src={item.image} 
                    alt={item.caption} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                  />

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">{item.caption}</span>
                    <Eye size={12} className="text-biolum-purple opacity-0 group-hover:opacity-100 duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setIsSiblingExpanded(!isSiblingExpanded);
                if (!isSiblingExpanded) {
                  setTimeout(() => {
                    document.getElementById('sibling-expanded-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }
              }}
              className="mt-4 w-full py-2 rounded-xl border border-biolum-purple/30 bg-biolum-purple/5 text-biolum-purple hover:bg-biolum-purple/15 hover:border-biolum-purple/50 duration-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isSiblingExpanded ? 'Collapse Scrapbook' : 'Open 3D Scrapbook ↗'}
            </button>
          </div>
        </div>

        {/* CHAPTER 6: SQUAD & DUOS GALLERY */}
        <div className="relative">
          <AnimatePresence>
            {!unlockedGalleries.group && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 rounded-3xl glass-panel border border-white/10 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-purple-400 mb-4">
                  <Lock size={20} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-1">Squad & Duos</h4>
                <p className="text-zinc-500 font-sans text-xs max-w-[200px]">
                  Match the **Squad Cards** to unlock this chapter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlocked Content */}
          <div className="rounded-3xl glass-panel p-6 border border-purple-500/20 hover:border-purple-500/40 bg-zinc-950/20 duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="text-purple-400 font-mono text-sm">[06]</span>
                Squad & Duos
              </h4>
              <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 uppercase tracking-wider">
                <Unlock size={8} /> Unlocked
              </span>
            </div>

            {/* Photo List Preview of First 4 */}
            <div className="grid grid-cols-2 gap-3 flex-grow">
              {groupGalleryData.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(groupImageUrls, index, groupGalleryData.map(d => d.caption))}
                  className="group relative aspect-square rounded-xl bg-zinc-900/60 overflow-hidden cursor-pointer border border-white/10 preserve-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                  
                  <img 
                    src={item.image} 
                    alt={item.caption} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                  />

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">{item.caption}</span>
                    <Eye size={12} className="text-purple-400 opacity-0 group-hover:opacity-100 duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={() => {
                if (window.playUISfx) window.playUISfx('click');
                setIsGroupExpanded(!isGroupExpanded);
                if (!isGroupExpanded) {
                  setTimeout(() => {
                    document.getElementById('group-expanded-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }
              }}
              className="mt-4 w-full py-2 rounded-xl border border-purple-500/30 bg-purple-500/5 text-purple-400 hover:bg-purple-500/15 hover:border-purple-500/50 duration-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isGroupExpanded ? 'Collapse Gallery' : `Explore All ${groupGalleryData.length} Pics ↗`}
            </button>
          </div>
        </div>

      </div>

      {/* Expanded Solo Gallery Section - Renders Full Width Below the Cards */}
      <div id="solo-expanded-section" className="w-full">
        <AnimatePresence>
          {unlockedGalleries.solo && isSoloExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full border-t border-white/10 pt-12 pb-16 overflow-hidden"
            >
              <div className="text-center mb-8">
                <h4 className="font-serif text-3xl font-extrabold text-white mb-2 glow-pink">
                  Solo Gallery Collection
                </h4>
                <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto">
                  Browse, search, and filter through the complete archive of {soloGalleryData.length} stunning solo memories.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['All', 'Candid', 'Elegant', 'Smile', 'Aesthetic', 'Glow', 'Queen'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (window.playUISfx) window.playUISfx('click');
                        setSelectedTag(tag);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border duration-300 cursor-pointer transition-all ${
                        selectedTag === tag
                          ? 'bg-biolum-pink border-biolum-pink text-white shadow-[0_0_15px_#ff2a85] scale-105'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-biolum-pink/40'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Search Field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search captions or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-biolum-pink/50 focus:ring-1 focus:ring-biolum-pink/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Expanded Grid */}
              {filteredSoloGallery.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm font-mono border border-dashed border-white/5 rounded-3xl max-w-3xl mx-auto">
                  No portrait matches the query "{searchQuery || selectedTag}"
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto w-full"
                >
                  {filteredSoloGallery.map((item) => {
                    const originalIndex = soloGalleryData.findIndex(x => x.id === item.id);
                    return (
                      <ThreeDCard
                        key={item.id}
                        onClick={() => openLightbox(soloImageUrls, originalIndex, soloGalleryData.map(d => d.caption))}
                        className="group relative aspect-[3/4] rounded-2xl bg-zinc-900/60 overflow-hidden border border-white/10 shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                        
                        <img 
                          src={item.image} 
                          alt={item.caption} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                        />

                        <div className="absolute bottom-3 left-3 right-3 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-end justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] text-biolum-pink font-mono uppercase tracking-wider block mb-0.5">
                              {item.tags.join(' • ')}
                            </span>
                            <span className="text-[10px] text-white font-medium line-clamp-1 block leading-tight">{item.caption}</span>
                          </div>
                          <Eye size={12} className="text-biolum-pink opacity-0 group-hover:opacity-100 duration-300 shrink-0 ml-1 mb-0.5" />
                        </div>
                      </ThreeDCard>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Heart Gallery Section - Renders Full Width Below the Cards */}
      <div id="heart-expanded-section" className="w-full">
        <AnimatePresence>
          {unlockedGalleries.heart && isHeartExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full border-t border-white/10 pt-12 pb-16 overflow-hidden"
            >
              <div className="text-center mb-8">
                <h4 className="font-serif text-3xl font-extrabold text-white mb-2 glow-red text-red-500">
                  My Heart Collection 💖
                </h4>
                <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto">
                  Browse, search, and filter through the complete archive of {heartGalleryData.length} beautiful memories of her and her closest bestie.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['All', 'My Heart', 'Bestie', 'Candid', 'Sisters', 'Bond', 'Happy', 'Glow'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (window.playUISfx) window.playUISfx('click');
                        setSelectedHeartTag(tag);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border duration-300 cursor-pointer transition-all ${
                        selectedHeartTag === tag
                          ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_#ef4444] scale-105'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-red-500/40'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Search Field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search captions or tags..."
                    value={heartSearchQuery}
                    onChange={(e) => setHeartSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Expanded Grid */}
              {filteredHeartGallery.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm font-mono border border-dashed border-white/5 rounded-3xl max-w-3xl mx-auto">
                  No memory matches the query "{heartSearchQuery || selectedHeartTag}"
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto w-full"
                >
                  {filteredHeartGallery.map((item) => {
                    const originalIndex = heartGalleryData.findIndex(x => x.id === item.id);
                    return (
                      <ThreeDCard
                        key={item.id}
                        onClick={() => openLightbox(heartImageUrls, originalIndex, heartGalleryData.map(d => d.caption))}
                        className="group relative aspect-[3/4] rounded-2xl bg-zinc-900/60 overflow-hidden border border-white/10 shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                        
                        <img 
                          src={item.image} 
                          alt={item.caption} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                        />

                        <div className="absolute bottom-3 left-3 right-3 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-end justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] text-red-500 font-mono uppercase tracking-wider block mb-0.5">
                              {item.tags.join(' • ')}
                            </span>
                            <span className="text-[10px] text-white font-medium line-clamp-1 block leading-tight">{item.caption}</span>
                          </div>
                          <Eye size={12} className="text-red-500 opacity-0 group-hover:opacity-100 duration-300 shrink-0 ml-1 mb-0.5" />
                        </div>
                      </ThreeDCard>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Gossip Gallery Section - Renders Full Width Below the Cards */}
      <div id="gossip-expanded-section" className="w-full">
        <AnimatePresence>
          {unlockedGalleries.gossip && isGossipExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full border-t border-white/10 pt-12 pb-16 overflow-hidden"
            >
              <div className="text-center mb-8">
                <h4 className="font-serif text-3xl font-extrabold text-white mb-2 glow-teal text-teal-400">
                  Gossip Partner Collection 💬
                </h4>
                <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto">
                  Browse, search, and filter through the complete archive of {gossipGalleryData.length} fun moments of her and her gossip buddy.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['All', 'Gossip', 'Chit-Chat', 'Besties', 'Fun', 'Laughter', 'Glow', 'Slay'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (window.playUISfx) window.playUISfx('click');
                        setSelectedGossipTag(tag);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border duration-300 cursor-pointer transition-all ${
                        selectedGossipTag === tag
                          ? 'bg-teal-500 border-teal-500 text-black shadow-[0_0_15px_#2dd4bf] scale-105'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-teal-500/40'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Search Field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search captions or tags..."
                    value={gossipSearchQuery}
                    onChange={(e) => setGossipSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Expanded Grid */}
              {filteredGossipGallery.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm font-mono border border-dashed border-white/5 rounded-3xl max-w-3xl mx-auto">
                  No memory matches the query "{gossipSearchQuery || selectedGossipTag}"
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto w-full"
                >
                  {filteredGossipGallery.map((item) => {
                    const originalIndex = gossipGalleryData.findIndex(x => x.id === item.id);
                    return (
                      <ThreeDCard
                        key={item.id}
                        onClick={() => openLightbox(gossipImageUrls, originalIndex, gossipGalleryData.map(d => d.caption))}
                        className="group relative aspect-[3/4] rounded-2xl bg-zinc-900/60 overflow-hidden border border-white/10 shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                        
                        <img 
                          src={item.image} 
                          alt={item.caption} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                        />

                        <div className="absolute bottom-3 left-3 right-3 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-end justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] text-teal-400 font-mono uppercase tracking-wider block mb-0.5">
                              {item.tags.join(' • ')}
                            </span>
                            <span className="text-[10px] text-white font-medium line-clamp-1 block leading-tight">{item.caption}</span>
                          </div>
                          <Eye size={12} className="text-teal-400 opacity-0 group-hover:opacity-100 duration-300 shrink-0 ml-1 mb-0.5" />
                        </div>
                      </ThreeDCard>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Friends Gallery Section - Renders Full Width Below the Cards */}
      <div id="friend-expanded-section" className="w-full">
        <AnimatePresence>
          {unlockedGalleries.friend && isFriendExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full border-t border-white/10 pt-12 pb-16 overflow-hidden"
            >
              <div className="text-center mb-8">
                <h4 className="font-serif text-3xl font-extrabold text-white mb-2 glow-gold">
                  Best Friends Collection
                </h4>
                <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto">
                  Browse, search, and filter through the complete archive of {friendGalleryData.length} beautiful best friends memories.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['All', 'Besties', 'Candid', 'Adventure', 'Sisters', 'Laughter', 'Cute'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (window.playUISfx) window.playUISfx('click');
                        setSelectedFriendTag(tag);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border duration-300 cursor-pointer transition-all ${
                        selectedFriendTag === tag
                          ? 'bg-amber-300 border-amber-300 text-black shadow-[0_0_15px_#fcd34d] scale-105'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-amber-300/40'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Search Field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search captions or tags..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Expanded Grid */}
              {filteredFriendGallery.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm font-mono border border-dashed border-white/5 rounded-3xl max-w-3xl mx-auto">
                  No best friends photo matches the query "{friendSearchQuery || selectedFriendTag}"
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto w-full"
                >
                  {filteredFriendGallery.map((item) => {
                    const originalIndex = friendGalleryData.findIndex(x => x.id === item.id);
                    return (
                      <ThreeDCard
                        key={item.id}
                        onClick={() => openLightbox(friendImageUrls, originalIndex, friendGalleryData.map(d => d.caption))}
                        className="group relative aspect-[3/4] rounded-2xl bg-zinc-900/60 overflow-hidden border border-white/10 shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                        
                        <img 
                          src={item.image} 
                          alt={item.caption} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                        />

                        <div className="absolute bottom-3 left-3 right-3 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-end justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] text-amber-300 font-mono uppercase tracking-wider block mb-0.5">
                              {item.tags.join(' • ')}
                            </span>
                            <span className="text-[10px] text-white font-medium line-clamp-1 block leading-tight">{item.caption}</span>
                          </div>
                          <Eye size={12} className="text-amber-300 opacity-0 group-hover:opacity-100 duration-300 shrink-0 ml-1 mb-0.5" />
                        </div>
                      </ThreeDCard>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Sibling Gallery Section - Renders Full Width Below the Cards */}
      <div id="sibling-expanded-section" className="w-full">
        <AnimatePresence>
          {unlockedGalleries.sibling && isSiblingExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="w-full border-t border-white/10 pt-12 pb-16 overflow-hidden"
            >
              <div className="text-center mb-8">
                <h4 className="font-serif text-3xl font-extrabold text-white mb-2 glow-purple text-biolum-purple">
                  Brother & Sister Scrapbook 📖✨
                </h4>
                <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto">
                  A unique interactive scrapbook created for the best sister. Every memory here is precious!
                </p>
              </div>

              {/* Heartfelt Handwritten Note Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto mb-16 p-8 rounded-3xl border border-dashed border-biolum-purple/40 bg-zinc-950/80 shadow-[0_0_30px_rgba(189,0,255,0.05)] relative overflow-hidden"
              >
                {/* Decorative background details */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-biolum-purple/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-biolum-purple/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Torn notebook paper edge aesthetic top & bottom line */}
                <div className="absolute top-3 left-4 right-4 flex justify-between gap-1 opacity-20 pointer-events-none select-none">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-biolum-purple" />
                  ))}
                </div>

                <div className="mt-4 font-sans text-zinc-100 leading-relaxed text-sm md:text-base space-y-4 pr-2 pl-2 border-l-2 border-biolum-purple/20">
                  <p className="font-serif text-lg md:text-xl font-bold text-biolum-purple italic">To My Dearest Sister,</p>
                  <p className="font-serif italic text-zinc-200">
                    "Looking through our photos, I realized we might not have hundreds of selfies together. But every single picture we do have is filled with so much genuine laughter, crazy teasing, and pure love."
                  </p>
                  <p className="font-serif italic text-zinc-200">
                    "You are not just my sister; you are my constant, my confidante, and my favorite partner-in-crime. No matter how big we grow or how far we go, remember that your brother is always just one call away, standing right behind you to protect you and cheer you on."
                  </p>
                  <p className="font-serif italic text-zinc-200">
                    "Thank you for bringing so much color and joy into my life. Happy Birthday, my sweet sister! 💖"
                  </p>
                  <p className="text-right font-serif text-lg font-bold text-biolum-purple italic pr-4">- Your Brother</p>
                </div>
              </motion.div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12 max-w-5xl mx-auto w-full px-4">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['All', 'Silly Us', 'Celebrations', 'Selfie', 'Candid', 'Cafe Date', 'Sunset', 'Blessed'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (window.playUISfx) window.playUISfx('click');
                        setSelectedSiblingTag(tag);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border duration-300 cursor-pointer transition-all ${
                        selectedSiblingTag === tag
                          ? 'bg-biolum-purple border-biolum-purple text-white shadow-[0_0_15px_#bd00ff] scale-105'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-biolum-purple/40'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Search Field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search memories..."
                    value={siblingSearchQuery}
                    onChange={(e) => setSiblingSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-biolum-purple/50 focus:ring-1 focus:ring-biolum-purple/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Scrapbook Polaroid Collage Layout */}
              {filteredSiblingGallery.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm font-mono border border-dashed border-white/5 rounded-3xl max-w-3xl mx-auto">
                  No scrapbook memory matches "{siblingSearchQuery || selectedSiblingTag}"
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 max-w-6xl mx-auto w-full px-4">
                  {filteredSiblingGallery.map((item, idx) => {
                    const originalIndex = siblingGalleryData.findIndex(x => x.id === item.id);
                    // Generate pseudo-random tilts for Polaroid scrapbook style
                    const rotations = ['rotate-1', 'rotate--1', 'rotate-2', 'rotate--2', 'rotate-3', 'rotate--3'];
                    const tiltClass = rotations[(item.id) % rotations.length];
                    
                    return (
                      <ThreeDCard
                        key={item.id}
                        onClick={() => openLightbox(siblingImageUrls, originalIndex, siblingGalleryData.map(d => d.caption))}
                        className={`group relative bg-white p-3 pb-8 rounded-sm shadow-xl hover:shadow-2xl hover:scale-105 duration-350 cursor-pointer ${tiltClass} transition-transform border border-zinc-200 max-w-[240px] mx-auto w-full`}
                      >
                        {/* Polaroid Push Pin / Tape Accent */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
                          {idx % 2 === 0 ? (
                            // Push Pin
                            <div className="w-4 h-4 rounded-full bg-red-500 shadow-md relative">
                              <div className="absolute top-1 left-1.5 w-1 h-3 bg-zinc-400 rotate-12" />
                            </div>
                          ) : (
                            // Washi Tape
                            <div className="w-12 h-4 bg-yellow-100/50 backdrop-blur-xs border border-yellow-200/40 rotate-[-5deg] opacity-75 shadow-xs" />
                          )}
                        </div>

                        {/* Image Container */}
                        <div className="w-full aspect-square bg-zinc-100 overflow-hidden relative border border-zinc-200/60">
                          <img
                            src={item.image}
                            alt={item.caption}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none filter sepia-[0.1] contrast-[1.05]"
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 duration-300" />
                        </div>

                        {/* Handwritten Caption Area */}
                        <div className="mt-4 text-center">
                          <p className="font-serif text-[13px] text-zinc-800 leading-tight font-semibold line-clamp-2 px-1 select-text">
                            {item.caption}
                          </p>
                          <span className="mt-2 inline-block text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                            {item.tags.join(' • ')}
                          </span>
                        </div>
                      </ThreeDCard>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Group Gallery Section - Renders Full Width Below the Cards */}
      <div id="group-expanded-section" className="w-full">
        <AnimatePresence>
          {unlockedGalleries.group && isGroupExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full border-t border-white/10 pt-12 pb-16 overflow-hidden"
            >
              <div className="text-center mb-8">
                <h4 className="font-serif text-3xl font-extrabold text-white mb-2 glow-purple text-purple-400">
                  Squad & Duo Collection 📸
                </h4>
                <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto">
                  Browse, search, and filter through the complete archive of {groupGalleryData.length} fantastic group hangouts and cozy duo pictures.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 max-w-5xl mx-auto w-full">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['All', 'Group', 'Duo', 'Temple', 'Wonderla', 'Selfie', 'Outing', 'Squad', 'Besties'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (window.playUISfx) window.playUISfx('click');
                        setSelectedGroupTag(tag);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border duration-300 cursor-pointer transition-all ${
                        selectedGroupTag === tag
                          ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_#a855f7] scale-105'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-purple-500/40'
                      }`}
                    >
                      {tag === 'Group' ? 'Group Photos' : tag === 'Duo' ? 'Duo Photos' : tag}
                    </button>
                  ))}
                </div>

                {/* Search Field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search captions or tags..."
                    value={groupSearchQuery}
                    onChange={(e) => setGroupSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Expanded Grid */}
              {filteredGroupGallery.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm font-mono border border-dashed border-white/5 rounded-3xl max-w-3xl mx-auto">
                  No memory matches the query "{groupSearchQuery || selectedGroupTag}"
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto w-full"
                >
                  {filteredGroupGallery.map((item) => {
                    const originalIndex = groupGalleryData.findIndex(x => x.id === item.id);
                    return (
                      <ThreeDCard
                        key={item.id}
                        onClick={() => openLightbox(groupImageUrls, originalIndex, groupGalleryData.map(d => d.caption))}
                        className="group relative aspect-[3/4] rounded-2xl bg-zinc-900/60 overflow-hidden border border-white/10 shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 z-10 duration-300 group-hover:opacity-90" />
                        
                        <img 
                          src={item.image} 
                          alt={item.caption} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 duration-500 select-none" 
                        />

                        <div className="absolute bottom-3 left-3 right-3 z-15 transform translate-z-10 group-hover:translate-y-0 duration-300 flex items-end justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] text-purple-400 font-mono uppercase tracking-wider block mb-0.5">
                              {item.tags.join(' • ')}
                            </span>
                            <span className="text-[10px] text-white font-medium line-clamp-1 block leading-tight">{item.caption}</span>
                          </div>
                          <Eye size={12} className="text-purple-400 opacity-0 group-hover:opacity-100 duration-300 shrink-0 ml-1 mb-0.5" />
                        </div>
                      </ThreeDCard>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LIGHTBOX / IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => {
              if (window.playUISfx) window.playUISfx('click');
              setLightbox(null);
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 active:scale-95 duration-100 z-50"
            >
              <X size={20} />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.playUISfx) window.playUISfx('click');
                setSlideDirection(-1);
                setLightbox(prev => {
                  if (!prev) return null;
                  const newIndex = (prev.index - 1 + prev.images.length) % prev.images.length;
                  return { ...prev, index: newIndex };
                });
              }}
              className="absolute left-4 sm:left-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 active:scale-95 duration-100 z-50"
            >
              <ArrowLeft size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.playUISfx) window.playUISfx('click');
                setSlideDirection(1);
                setLightbox(prev => {
                  if (!prev) return null;
                  const newIndex = (prev.index + 1) % prev.images.length;
                  return { ...prev, index: newIndex };
                });
              }}
              className="absolute right-4 sm:right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 active:scale-95 duration-100 z-50"
            >
              <ArrowRight size={24} />
            </button>

            {/* Realistic Photo Frame */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()} // Stop closing on frame click
              className="w-full max-w-2xl glass-panel p-4 rounded-3xl border border-white/15 shadow-2xl bg-zinc-950 flex flex-col items-center text-center relative"
            >
              {/* Image Area with slide transition */}
              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-tr from-zinc-900 to-zinc-950 border border-white/5 flex flex-col items-center justify-center text-center select-none relative overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={lightbox.index}
                    src={lightbox.images[lightbox.index]}
                    alt="Curated Memory"
                    initial={{ x: slideDirection * 200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -slideDirection * 200, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                </AnimatePresence>
              </div>

              <div className="w-full py-4 border-t border-white/5 mt-4 flex items-center justify-between text-left">
                <div>
                  <h5 className="font-serif text-lg font-bold text-white">
                    {lightbox.captions[lightbox.index] || 'Memory Captured 🤍'}
                  </h5>
                  <p className="text-xs text-zinc-500 font-mono tracking-wider mt-0.5">
                    {lightbox.images[lightbox.index].includes('unsplash') ? 'THEME PRESET' : 'LOCAL PORTRAIT'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono">
                  {lightbox.index + 1} of {lightbox.images.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, Settings, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    playUISfx?: (type: 'click' | 'success' | 'match' | 'teleport' | 'win') => void;
    startBackgroundMusic?: () => void;
  }
}

export const AudioEngine: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Default URL is set to our imported Gaaju Bomma soundtrack!
  const [audioUrl, setAudioUrl] = useState('/gaaju_bomma.mp3');
  const [inputUrl, setInputUrl] = useState('/gaaju_bomma.mp3');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodeRef = useRef<HTMLAudioElement | null>(null);

  // 1. Synthesizer for Game Sound Effects (Satisfying clicks, matches, victory)
  const playSfx = (type: 'click' | 'success' | 'match' | 'teleport' | 'win') => {
    if (isMuted) return;
    
    // Initialize Web Audio context for SFX if not created yet
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'teleport') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'match') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5-E5-G5-C6 arpeggio
      notes.forEach((freq, idx) => {
        const timeOffset = idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + timeOffset);
        gain.gain.setValueAtTime(0.0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.08, now + timeOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.35);
      });
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554.37, now);
      osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } else if (type === 'win') {
      const chords = [
        [261.63, 329.63, 392.00, 523.25], // C Maj
        [349.23, 440.00, 523.25, 698.46]  // F Maj
      ];
      chords.forEach((chord, chordIdx) => {
        const chordStart = now + chordIdx * 0.4;
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, chordStart + idx * 0.04);
          gain.gain.setValueAtTime(0.0, chordStart + idx * 0.04);
          gain.gain.linearRampToValueAtTime(0.08, chordStart + idx * 0.04 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, chordStart + chordIdx * 0.4 + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(chordStart + idx * 0.04);
          osc.stop(chordStart + chordIdx * 0.4 + 0.9);
        });
      });
    }
  };

  useEffect(() => {
    window.playUISfx = playSfx;
    
    // Create background audio element
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.25; // Warm background level
    audioNodeRef.current = audio;

    // Expose startBackgroundMusic globally
    window.startBackgroundMusic = () => {
      audio.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
      }).catch(err => {
        console.log("Background music play failed:", err);
      });
    };

    // Try playing immediately
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      console.log("Autoplay blocked on mount. Waiting for user interaction.");
    });

    // Fallback interaction listener to start audio
    const handleFirstInteraction = () => {
      audio.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
        removeListeners();
      }).catch(err => {
        console.log("Interaction play blocked:", err);
      });
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.playUISfx = undefined;
      window.startBackgroundMusic = undefined;
      removeListeners();
      audio.pause();
    };
  }, []);

  // Update track source when audioUrl changes
  useEffect(() => {
    if (audioNodeRef.current) {
      const wasPlaying = isPlaying;
      audioNodeRef.current.pause();
      audioNodeRef.current.src = audioUrl;
      audioNodeRef.current.load();
      if (wasPlaying) {
        audioNodeRef.current.play().catch(err => {
          console.log("Audio autoplay blocked by browser policy:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [audioUrl]);

  // Handle Play/Pause
  const togglePlayback = () => {
    if (!audioNodeRef.current) return;
    
    playSfx('click');

    if (!isPlaying) {
      audioNodeRef.current.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
      }).catch(err => {
        console.log("Playback failed:", err);
      });
    } else {
      audioNodeRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle Mute/Unmute
  const toggleMute = () => {
    if (!audioNodeRef.current) return;
    
    playSfx('click');

    if (isMuted) {
      audioNodeRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioNodeRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Apply custom URL pasted by user
  const handleApplyUrl = () => {
    if (inputUrl.trim()) {
      setAudioUrl(inputUrl.trim());
      setShowSettings(false);
      setIsPlaying(true);
      playSfx('success');
    }
  };

  return (
    <>
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Visualizer bars */}
        {isPlaying && !isMuted && (
          <div className="flex items-end gap-0.5 h-4 px-2 select-none pointer-events-none">
            {[1, 2, 3, 4].map((bar) => (
              <motion.div
                key={bar}
                className="w-[2px] bg-biolum-pink rounded-t"
                animate={{ height: ['4px', '16px', '6px', '14px', '4px'] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: bar * 0.15,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        )}

        {/* Spinning Disc Button */}
        <motion.button
          onClick={togglePlayback}
          className="relative flex items-center justify-center w-11 h-11 rounded-full glass-panel border border-white/15 cursor-pointer shadow-lg active:scale-95 select-none"
          whileHover={{ scale: 1.08 }}
          title="Toggle Background Music"
        >
          <motion.div
            className={`flex items-center justify-center w-full h-full rounded-full border border-white/5 ${
              isPlaying && !isMuted ? 'text-biolum-pink' : 'text-zinc-400'
            }`}
            animate={isPlaying && !isMuted ? { rotate: 360 } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Music size={18} className={isPlaying && !isMuted ? 'glow-pink' : ''} />
          </motion.div>
          
          {isPlaying && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-biolum-pink border border-onyx" />
          )}
        </motion.button>

        {/* Custom Audio Settings Gear */}
        <motion.button
          onClick={() => {
            playSfx('click');
            setShowSettings(!showSettings);
          }}
          className={`flex items-center justify-center w-8 h-8 rounded-full glass-panel border border-white/10 text-zinc-400 cursor-pointer active:scale-95 select-none ${
            showSettings ? 'border-amber-300/40 text-amber-300' : ''
          }`}
          whileHover={{ scale: 1.05 }}
          title="Change Soundtrack / Song Link"
        >
          <Settings size={14} />
        </motion.button>

        {/* Mute/Unmute Toggle */}
        {isPlaying && (
          <motion.button
            onClick={toggleMute}
            className="flex items-center justify-center w-8 h-8 rounded-full glass-panel border border-white/10 text-zinc-400 cursor-pointer active:scale-95 select-none"
            whileHover={{ scale: 1.05 }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </motion.button>
        )}
      </div>

      {/* Slide-out Audio Configuration Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed top-20 right-6 z-50 w-full max-w-sm glass-panel p-6 rounded-2xl border border-white/15 shadow-2xl bg-zinc-950/95 backdrop-blur-xl text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2.5">
              <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Music size={16} className="text-biolum-pink" />
                Change Soundtrack
              </h4>
              <button
                onClick={() => {
                  playSfx('click');
                  setShowSettings(false);
                }}
                className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider text-zinc-400 uppercase mb-2">
                  Song URL (Direct MP3 or Local Path)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/gaajubomma.mp3"
                    className="flex-grow bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-biolum-pink/40"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-3.5 py-2 bg-gradient-to-r from-biolum-pink to-biolum-purple hover:shadow-[0_0_12px_rgba(255,42,133,0.3)] text-white font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1.5 transition-shadow"
                  >
                    <Check size={14} /> Apply
                  </button>
                </div>
              </div>

              {/* Suggestions / Instructions Block */}
              <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-xs space-y-2">
                <p className="text-amber-300 font-medium flex items-center gap-1.5 font-serif italic text-[13px]">
                  <span>🎵</span> How to add "Gaaju Bomma" from Hi Nanna:
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 text-zinc-400 font-sans">
                  <li>
                    Download the **Gaaju Bomma** `.mp3` song file locally.
                  </li>
                  <li>
                    Drop the file directly into your project's **`/public/`** folder and name it `gaaju_bomma.mp3`.
                  </li>
                  <li>
                    Type **`/gaaju_bomma.mp3`** in the input above and click **Apply**! This will load the high-quality song with zero latency and absolute reliability!
                  </li>
                </ol>
                <p className="text-[10px] text-zinc-500 font-mono italic leading-normal border-t border-white/5 pt-2 mt-2">
                  Alternatively, if you have a direct streaming URL (e.g. from Archive.org or other CDN), paste it directly above!
                </p>
              </div>

              {/* Presets */}
              <div>
                <span className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-2">Soundtrack Presets</span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setInputUrl('/gaaju_bomma.mp3');
                      setAudioUrl('/gaaju_bomma.mp3');
                      playSfx('success');
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-[11px] font-medium cursor-pointer text-left duration-200 transition-all ${
                      audioUrl === '/gaaju_bomma.mp3'
                        ? 'border-biolum-pink/40 bg-biolum-pink/10 text-biolum-pink shadow-[0_0_8px_rgba(255,42,133,0.15)]'
                        : 'border-white/10 text-zinc-400 bg-white/2 hover:bg-white/5'
                    }`}
                  >
                    🎵 Gaaju Bomma (Amma Special)
                  </button>
                  <button
                    onClick={() => {
                      setInputUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
                      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
                      playSfx('success');
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-[11px] font-medium cursor-pointer text-left duration-200 transition-all ${
                      audioUrl.includes('Helix') 
                        ? 'border-amber-300/40 bg-amber-300/10 text-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.15)]' 
                        : 'border-white/10 text-zinc-400 bg-white/2 hover:bg-white/5'
                    }`}
                  >
                    🎹 Acoustic Ambient Piano Track
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

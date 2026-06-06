import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const BioluminescentCursor: React.FC = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 150); // Offset by half the glow diameter (300px / 2)
      cursorY.set(e.clientY - 150);
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-40 hidden h-[300px] w-[300px] rounded-full opacity-65 mix-blend-screen blur-[80px] transition-opacity duration-500 md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        background: 'radial-gradient(circle, rgba(255,42,133,0.18) 0%, rgba(189,0,255,0.08) 50%, rgba(0,0,0,0) 70%)',
      }}
    />
  );
};

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZoomCursorProps {
  isActive: boolean;
  isZoomed: boolean;
}

export function ZoomCursor({ isActive, isZoomed }: ZoomCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
    
    return undefined;
  }, [isActive, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.15 }}
          className="fixed pointer-events-none z-9999"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {isZoomed ? (
            // Zoom Out Icon
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <circle
                cx="10"
                cy="10"
                r="7"
                stroke="white"
                strokeWidth="2"
                fill="rgba(0, 0, 0, 0.5)"
              />
              <line
                x1="15"
                y1="15"
                x2="21"
                y2="21"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Minus sign */}
              <line
                x1="7"
                y1="10"
                x2="13"
                y2="10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // Zoom In Icon
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <circle
                cx="10"
                cy="10"
                r="7"
                stroke="white"
                strokeWidth="2"
                fill="rgba(0, 0, 0, 0.5)"
              />
              <line
                x1="15"
                y1="15"
                x2="21"
                y2="21"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Plus sign */}
              <line
                x1="10"
                y1="7"
                x2="10"
                y2="13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="7"
                y1="10"
                x2="13"
                y2="10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

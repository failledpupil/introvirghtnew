import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

interface ConfettiProps {
  show: boolean;
  duration?: number;
  particleCount?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  size: number;
}

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Confetti({ show, duration = 3000, particleCount = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const newPieces = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, particleCount]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: '-10%',
                width: piece.size,
                height: piece.size * 2,
                backgroundColor: piece.color,
                borderRadius: '2px'
              }}
              initial={{ y: 0, opacity: 1, rotate: piece.rotation }}
              animate={{
                y: window.innerHeight + 100,
                opacity: [1, 1, 0],
                rotate: piece.rotation + 360
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
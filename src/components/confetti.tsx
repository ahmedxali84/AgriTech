"use client"

import React, { useEffect, useState } from 'react';

const ConfettiPiece = ({ id, onAnimationEnd }: { id: number, onAnimationEnd: (id: number) => void }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    const colors = ['#A7D1AB', '#E4D4C8', '#f5f5dc', '#F5B041', '#48C9B0'];
    setStyle({
      left: `${Math.random() * 100}%`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      transform: `rotate(${Math.random() * 360}deg)`,
      animation: `fall ${2 + Math.random() * 3}s linear forwards`,
    });
  }, []);

  return (
    <div
      className="absolute top-[-10px] w-2 h-4"
      style={style}
      onAnimationEnd={() => onAnimationEnd(id)}
    />
  );
};

export const Confetti = ({ active }: { active: boolean }) => {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    if (active) {
      setPieces(Array.from({ length: 50 }, (_, i) => i));
    }
  }, [active]);

  const handleAnimationEnd = (id: number) => {
    setPieces(prev => prev.filter(p => p !== id));
  };
  
  if (!active && pieces.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes fall {
          to {
            top: 120%;
            transform: rotate(${Math.random() * 360 + 360}deg);
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
        {pieces.map(id => (
          <ConfettiPiece key={id} id={id} onAnimationEnd={handleAnimationEnd} />
        ))}
      </div>
    </>
  );
};

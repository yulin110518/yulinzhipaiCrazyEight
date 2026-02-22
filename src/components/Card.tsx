import React from 'react';
import { Type } from '../types';
import { getSuitIcon, getSuitColor } from '../utils';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  card: Type.Card;
  onClick?: () => void;
  isFaceUp?: boolean;
  isSelected?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  isFaceUp = true, 
  isSelected = false,
  className,
  disabled = false
}) => {
  if (!isFaceUp) {
    return (
      <motion.div
        whileHover={!disabled ? { y: -10 } : {}}
        className={cn(
          "relative w-24 h-36 bg-slate-900 rounded-xl border-2 border-indigo-500/50 flex items-center justify-center overflow-hidden card-shadow",
          className
        )}
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
        <img 
          src="https://picsum.photos/seed/astronaut/200/300" 
          alt="Astronaut" 
          className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-2 text-[8px] text-indigo-300 font-mono tracking-tighter uppercase opacity-50">China Space</div>
      </motion.div>
    );
  }

  const suitIcon = getSuitIcon(card.suit);
  const colorClass = getSuitColor(card.suit);

  return (
    <motion.div
      layoutId={card.id}
      whileHover={!disabled ? { y: -15, scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative w-24 h-36 bg-white rounded-xl flex flex-col p-2 cursor-pointer select-none card-shadow transition-all duration-200",
        isSelected && "ring-4 ring-yellow-400 -translate-y-4 card-glow",
        disabled && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
    >
      <div className={cn("text-xl font-bold leading-none", colorClass)}>
        {card.label}
      </div>
      <div className={cn("text-lg", colorClass)}>
        {suitIcon}
      </div>
      
      <div className={cn("flex-1 flex items-center justify-center text-4xl", colorClass)}>
        {suitIcon}
      </div>
      
      <div className={cn("text-xl font-bold leading-none self-end rotate-180", colorClass)}>
        {card.label}
      </div>
      <div className={cn("text-lg self-end rotate-180", colorClass)}>
        {suitIcon}
      </div>
    </motion.div>
  );
};

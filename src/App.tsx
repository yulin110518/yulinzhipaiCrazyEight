import React, { useState } from 'react';
import { Menu } from './components/Menu';
import { GameBoard } from './components/GameBoard';
import { Type } from './types';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [view, setView] = useState<'menu' | 'game'>('menu');
  const [config, setConfig] = useState<{ mode: Type.GameMode; difficulty: Type.Difficulty } | null>(null);

  const handleStart = (mode: Type.GameMode, difficulty: Type.Difficulty) => {
    setConfig({ mode, difficulty });
    setView('game');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AnimatePresence mode="wait">
        {view === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Menu onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {config && (
              <GameBoard 
                mode={config.mode} 
                difficulty={config.difficulty} 
                onBack={() => setView('menu')} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

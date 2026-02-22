import React, { useState, useEffect } from 'react';
import { Type } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, Users, Globe, Shield, ShieldAlert, Zap, Play, Rocket, Info, ChevronRight } from 'lucide-react';

interface MenuProps {
  onStart: (mode: Type.GameMode, difficulty: Type.Difficulty) => void;
}

type MenuStep = 'intro' | 'rules' | 'mode' | 'difficulty';

export const Menu: React.FC<MenuProps> = ({ onStart }) => {
  const [step, setStep] = useState<MenuStep>('intro');
  const [mode, setMode] = useState<Type.GameMode>('single');
  const [difficulty, setDifficulty] = useState<Type.Difficulty>('simple');

  // Intro sequence
  useEffect(() => {
    if (step === 'intro') {
      const timer = setTimeout(() => setStep('rules'), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const renderIntro = () => (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Stars Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black" />
      
      {/* Earth */}
      <motion.div 
        initial={{ x: -600, opacity: 0 }}
        animate={{ x: -100, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-80 h-80 rounded-full bg-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.5)] overflow-hidden"
      >
        <img src="https://picsum.photos/seed/earth/600/600" alt="Earth" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
      </motion.div>

      {/* Moon */}
      <motion.div 
        initial={{ x: 600, opacity: 0 }}
        animate={{ x: 100, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-40 h-40 rounded-full bg-slate-400 shadow-[0_0_50px_rgba(148,163,184,0.5)] overflow-hidden"
      >
        <img src="https://picsum.photos/seed/moon/300/300" alt="Moon" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
      </motion.div>

      {/* Collision Flash */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 20, 0], opacity: [0, 1, 0] }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute w-20 h-20 bg-white rounded-full blur-3xl"
      />

      {/* Title Formation */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="z-10 text-center"
      >
        <h1 className="text-8xl font-display font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.7)]">
          纸牌<span className="text-indigo-500">对抗</span>
        </h1>
        <p className="text-indigo-300 font-mono tracking-[0.5em] mt-4 uppercase">Card Confrontation</p>
      </motion.div>
    </div>
  );

  const renderRules = () => (
    <div className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      
      {/* Spaceship Animation */}
      <motion.div 
        initial={{ x: -1000, y: 200, rotate: 10 }}
        animate={{ x: 1000, y: -200, rotate: -10 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute z-0 opacity-40"
      >
        <Rocket className="w-32 h-32 text-indigo-500 rotate-90" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 p-12 rounded-[40px] shadow-2xl relative"
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-500 p-4 rounded-2xl shadow-lg">
          <Info className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-display font-bold text-white mb-8 text-center mt-4">游戏规则</h2>
        
        <div className="space-y-6 text-slate-300 font-sans leading-relaxed">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">1</div>
            <p>开局每人发放5张牌，随机揭开一张作为初始花色。</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">2</div>
            <p>必须出相同花色的牌，或者使用王牌（大小王）改变花色。</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">3</div>
            <p>两张牌对比，点数大者赢得该轮并获得下一轮的出牌权。</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">4</div>
            <p>先出完手中所有纸牌的一方获得最终胜利。</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">5</div>
            <p>胜利后将触发“一剑划破大海”特效；失败则触发“巨人呐喊”特效。</p>
          </div>
        </div>

        <button 
          onClick={() => setStep('mode')}
          className="w-full mt-12 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-2 group"
        >
          <span>我已了解规则</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );

  const renderSelection = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      {/* Base Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black" />
      
      {/* Nebulae */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {/* Purple Nebula */}
        <div className="absolute top-[10%] left-[20%] w-[70%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        {/* Blue Nebula */}
        <div className="absolute bottom-[20%] right-[20%] w-[60%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse [animation-delay:1s]" />
      </div>

      {/* Sun/Bright Star in Top Right */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Planets */}
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-10 top-1/4 w-48 h-48 rounded-full bg-slate-800 shadow-[inset_-15px_-15px_40px_rgba(0,0,0,0.8)] overflow-hidden opacity-60 pointer-events-none"
      >
        <img src="https://picsum.photos/seed/planet1/300/300" alt="Planet" className="w-full h-full object-cover opacity-30 grayscale" referrerPolicy="no-referrer" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-10 bottom-1/4 w-64 h-64 rounded-full bg-stone-800 shadow-[inset_15px_15px_50px_rgba(0,0,0,0.9)] overflow-hidden opacity-50 pointer-events-none"
      >
        <img src="https://picsum.photos/seed/planet2/400/400" alt="Planet" className="w-full h-full object-cover opacity-40 sepia" referrerPolicy="no-referrer" />
      </motion.div>

      {/* Stars Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 pointer-events-none mix-blend-screen" />

      {/* Sailing Spaceships */}
      <motion.div 
        initial={{ x: -200, y: 100, opacity: 0 }}
        animate={{ x: '120vw', y: 300, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute z-0 pointer-events-none"
      >
        <Rocket className="w-8 h-8 text-blue-300 rotate-90 opacity-40" />
      </motion.div>

      {/* Falling Meteors */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`meteor-${i}`}
          initial={{ x: '100%', y: -100, opacity: 0 }}
          animate={{ x: '-20%', y: '120%', opacity: [0, 1, 0] }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            repeat: Infinity, 
            delay: Math.random() * 10,
            ease: "easeIn" 
          }}
          className="absolute w-1 h-20 bg-gradient-to-b from-white to-transparent rotate-[45deg] z-0 pointer-events-none"
        />
      ))}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[48px] flex flex-col gap-8 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {step === 'mode' ? (
            <motion.div key="mode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
              <div className="text-center">
                <h2 className="text-3xl font-display font-bold text-white mb-2">选择人数</h2>
                <p className="text-slate-400 text-sm">决定你的战场规模</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'single', label: '单人挑战', icon: User, desc: '与大师级 AI 对决' },
                  { id: 'double', label: '双人对战', icon: Users, desc: '邀请好友同台竞技' },
                  { id: 'multi', label: '多人混战', icon: Globe, desc: '全球玩家实时匹配' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id as Type.GameMode); setStep('difficulty'); }}
                    className="flex items-center gap-6 p-6 rounded-3xl border bg-white/5 border-white/5 text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                      <m.icon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-lg font-bold text-white">{m.label}</span>
                      <span className="text-xs opacity-60">{m.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="difficulty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
              <div className="text-center">
                <h2 className="text-3xl font-display font-bold text-white mb-2">选择难度</h2>
                <p className="text-slate-400 text-sm">挑战你的极限</p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { id: 'simple', label: '简单模式', desc: 'AI 辅助，好牌概率提升', icon: Shield },
                  { id: 'hard', label: '困难模式', desc: '标准对决，无辅助', icon: ShieldAlert },
                  { id: 'hell', label: '地狱模式', desc: '大师级 AI，概率劣势', icon: Zap },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id as Type.Difficulty)}
                    className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
                      difficulty === d.id 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${difficulty === d.id ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                      <d.icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold uppercase">{d.label}</span>
                      <span className="text-xs opacity-60">{d.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('mode')} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-5 rounded-3xl transition-all">返回</button>
                <button onClick={() => onStart(mode, difficulty)} className="flex-[2] bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-5 rounded-3xl transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  <span>开始游戏</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  switch (step) {
    case 'intro': return renderIntro();
    case 'rules': return renderRules();
    default: return renderSelection();
  }
};

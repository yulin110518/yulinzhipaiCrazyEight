import React, { useState, useEffect } from 'react';
import { Type } from '../types';
import { createDeck, shuffle, dealHands, getInitialCard } from '../utils';
import { Card } from './Card';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, ArrowLeft, Brain, MessageSquare, User, Bot, Layers, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";

interface GameBoardProps {
  mode: Type.GameMode;
  difficulty: Type.Difficulty;
  onBack: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ mode, difficulty, onBack }) => {
  const [gameState, setGameState] = useState<Type.GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Type.Card | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuitPicker, setShowSuitPicker] = useState(false);

  // Initialize Game
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const fullDeck = createDeck();
    const { player, ai, remaining: deckAfterDeal } = dealHands(fullDeck, difficulty);
    const { card: firstCard, remaining } = getInitialCard(deckAfterDeal);
    
    const players: Type.Player[] = [
      { id: 'player', name: '你', isAI: false, avatar: '👤' },
      { id: 'ai', name: 'AI 大师', isAI: true, avatar: '🤖' }
    ];

    const hands: Record<string, Type.Card[]> = { player, ai };

    setGameState({
      deck: [],
      drawPile: remaining,
      discardPile: [firstCard],
      hands,
      currentSuit: firstCard.suit as Type.Suit,
      currentTurn: 'player',
      lastPlayedCard: firstCard,
      roundCards: [{ playerId: 'system', card: firstCard }],
      winner: null,
      players,
      difficulty,
      mode,
      gameLog: [`游戏开始！难度: ${difficulty}`, `初始花色为 ${firstCard.suit}`, `第一轮为三张牌模式`]
    });
    setAiAnalysis(null);
  };

  const log = (msg: string) => {
    setGameState(prev => prev ? { ...prev, gameLog: [msg, ...prev.gameLog].slice(0, 10) } : null);
  };

  const handlePass = () => {
    if (!gameState || gameState.winner || gameState.currentTurn !== 'player') return;
    setGameState({ ...gameState, currentTurn: 'ai' });
    log(`你选择了跳过回合`);
  };

  const handleDraw = () => {
    if (!gameState || gameState.winner || gameState.currentTurn !== 'player') return;

    const newDrawPile = [...gameState.drawPile];
    const newHands = { ...gameState.hands };
    
    if (newDrawPile.length > 0) {
      const drawnCard = newDrawPile.pop()!;
      newHands.player = [...newHands.player, drawnCard];
      
      setGameState({
        ...gameState,
        drawPile: newDrawPile,
        hands: newHands,
      });
      log(`你摸了一张牌`);
    } else {
      // If deck is empty, player must pick up the last played card if they can't play
      const lastCardInRound = gameState.roundCards[gameState.roundCards.length - 1]?.card;
      if (lastCardInRound) {
        newHands.player = [...newHands.player, lastCardInRound];
        const newDiscard = gameState.discardPile.slice(0, -1);
        
        setGameState({
          ...gameState,
          discardPile: newDiscard,
          hands: newHands,
          lastPlayedCard: newDiscard[newDiscard.length - 1] || null,
          roundCards: [],
          currentSuit: null,
          currentTurn: 'ai' // Forced pass if picking up
        });
        log(`牌堆已空，你拾起 ${lastCardInRound.label} 并结束回合`);
      }
    }
  };

  const handlePlayCard = (card: Type.Card) => {
    if (!gameState || gameState.winner || gameState.currentTurn !== 'player') return;

    const isLead = gameState.roundCards.length === 0;
    
    // Rule: Jokers cannot be used alone (cannot lead with a Joker)
    if (isLead && card.isJoker) {
      log(`大王小王不能单独出（不能作为首牌）！`);
      return;
    }

    // Rule: Follow suit if possible
    if (!isLead && !card.isJoker) {
      const hasSuit = gameState.hands.player.some(c => c.suit === gameState.currentSuit);
      if (hasSuit && card.suit !== gameState.currentSuit) {
        log(`有 ${gameState.currentSuit} 必须出 ${gameState.currentSuit}！`);
        return;
      }
      // If they don't have the suit, they MUST play a Joker or draw.
      // The user said "出的牌是相同花色", which implies you can't play a different suit.
      if (!hasSuit && card.suit !== gameState.currentSuit) {
        log(`没有 ${gameState.currentSuit}，你必须出王牌或摸牌！`);
        return;
      }
    }

    // Validation: Must match suit if it's not the lead card
    const canPlay = card.isJoker || 
                   (isLead ? true : card.suit === gameState.currentSuit);

    if (!canPlay) {
      log(`必须出 ${gameState.currentSuit} 或王牌！`);
      return;
    }

    if (card.isJoker) {
      setShowSuitPicker(true);
      setSelectedCard(card);
      return;
    }

    executePlay('player', card);
  };

  const executePlay = (playerId: string, card: Type.Card, nextSuit?: Type.Suit) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const newHands = { ...prev.hands };
      newHands[playerId] = newHands[playerId].filter(c => c.id !== card.id);
      
      const isWinner = newHands[playerId].length === 0;
      if (isWinner) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      const newRoundCards = [...prev.roundCards, { playerId, card }];
      let nextTurn = playerId === 'player' ? 'ai' : 'player';
      let currentSuit = prev.currentSuit;
      let logMsg = `${playerId === 'player' ? '你' : 'AI'} 出了 ${card.suit} ${card.label}`;

      // Determine if this round is complete
      // First round has 3 cards (system + 2 players), others have 2
      const isFirstRound = prev.discardPile.length === 1 && prev.roundCards.some(rc => rc.playerId === 'system');
      const isRoundComplete = isFirstRound ? newRoundCards.length === 3 : newRoundCards.length === 2;

      if (isRoundComplete) {
        // Determine winner of the clash
        let roundWinner: string;
        
        // Sort cards by power: Jokers > High Value
        const sorted = [...newRoundCards].sort((a, b) => {
          if (a.card.isJoker && !b.card.isJoker) return -1;
          if (!a.card.isJoker && b.card.isJoker) return 1;
          if (a.card.isJoker && b.card.isJoker) return b.card.value - a.card.value;
          
          // If neither is joker, check suit match
          const aMatches = a.card.suit === prev.currentSuit;
          const bMatches = b.card.suit === prev.currentSuit;
          
          if (aMatches && !bMatches) return -1;
          if (!aMatches && bMatches) return 1;
          
          return b.card.value - a.card.value;
        });

        const winningPlay = sorted[0];
        roundWinner = winningPlay.playerId === 'system' ? (playerId === 'player' ? 'ai' : 'player') : winningPlay.playerId;

        nextTurn = roundWinner;
        logMsg += `。${roundWinner === 'player' ? '你' : 'AI'} 赢得了这一轮并获得出牌权！`;
        
        return {
          ...prev,
          hands: newHands,
          discardPile: [...prev.discardPile, card],
          lastPlayedCard: card,
          roundCards: [], // Clear round
          currentSuit: null, // Winner will set next suit
          currentTurn: nextTurn,
          winner: isWinner ? playerId : null,
          gameLog: [logMsg, ...prev.gameLog].slice(0, 10)
        };
      }

      // If it was the first card of the round
      if (newRoundCards.length === 1) {
        currentSuit = nextSuit || card.suit as Type.Suit;
      }

      return {
        ...prev,
        hands: newHands,
        discardPile: [...prev.discardPile, card],
        lastPlayedCard: card,
        roundCards: newRoundCards,
        currentSuit,
        currentTurn: nextTurn,
        winner: isWinner ? playerId : null,
        gameLog: [logMsg, ...prev.gameLog].slice(0, 10)
      };
    });

    setShowSuitPicker(false);
    setSelectedCard(null);
  };

  // AI Turn
  useEffect(() => {
    if (gameState && gameState.currentTurn === 'ai' && !gameState.winner) {
      const timer = setTimeout(() => {
        aiPlay();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentTurn]);

  const aiPlay = () => {
    if (!gameState) return;
    
    const aiHand = gameState.hands.ai;
    const playerHand = gameState.hands.player;
    const isLead = gameState.roundCards.length === 0;

    // Rule: AI also follows suit and cannot lead with Joker
    let playable = aiHand.filter(c => 
      (isLead ? !c.isJoker : (c.isJoker || c.suit === gameState.currentSuit))
    );

    // If following suit, must play the suit if available
    if (!isLead) {
      const hasSuit = aiHand.some(c => c.suit === gameState.currentSuit);
      if (hasSuit) {
        playable = playable.filter(c => c.suit === gameState.currentSuit);
      }
    }

    if (playable.length > 0) {
      let cardToPlay: Type.Card;

      if (difficulty === 'hell') {
        // Hell AI: Big data analysis
        const playerSuits = playerHand.map(c => c.suit);
        playable.sort((a, b) => {
          // If leading, play a suit player lacks
          if (isLead) {
            const countA = playerSuits.filter(s => s === a.suit).length;
            const countB = playerSuits.filter(s => s === b.suit).length;
            return countA - countB;
          }
          // If following, try to win with smallest possible card
          const leadCard = gameState.roundCards[0].card;
          const aWins = a.isJoker || a.value > leadCard.value;
          const bWins = b.isJoker || b.value > leadCard.value;
          if (aWins && !bWins) return -1;
          if (bWins && !aWins) return 1;
          return a.value - b.value;
        });
        cardToPlay = playable[0];
      } else {
        // Simple/Hard AI
        playable.sort((a, b) => b.value - a.value);
        cardToPlay = playable[0];
      }
      
      if (cardToPlay.isJoker) {
        let bestSuit: Type.Suit;
        if (difficulty === 'hell') {
          const playerSuits = playerHand.map(c => c.suit);
          const suits: Type.Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
          bestSuit = suits.sort((a, b) => 
            playerSuits.filter(s => s === a).length - playerSuits.filter(s => s === b).length
          )[0];
        } else {
          const suits = aiHand.filter(c => !c.isJoker).map(c => c.suit);
          bestSuit = suits.length > 0 ? suits.sort((a,b) => 
            suits.filter(v => v===a).length - suits.filter(v => v===b).length
          ).pop()! : 'spades';
        }
        executePlay('ai', cardToPlay, bestSuit);
      } else {
        executePlay('ai', cardToPlay);
      }
    } else {
      // AI must draw
      if (gameState.drawPile.length > 0) {
        const newDrawPile = [...gameState.drawPile];
        const drawn = newDrawPile.pop()!;
        const newHands = { ...gameState.hands, ai: [...aiHand, drawn] };
        setGameState({ ...gameState, drawPile: newDrawPile, hands: newHands });
        log(`AI 摸了一张牌`);
      } else {
        // Pick up opponent's card if draw pile empty
        const lastCardInRound = gameState.roundCards[gameState.roundCards.length - 1]?.card;
        if (lastCardInRound) {
          const newHands = { ...gameState.hands, ai: [...aiHand, lastCardInRound] };
          const newDiscard = gameState.discardPile.slice(0, -1);
          setGameState({ 
            ...gameState, 
            discardPile: newDiscard, 
            hands: newHands, 
            currentTurn: 'player',
            roundCards: [],
            currentSuit: null,
            lastPlayedCard: newDiscard[newDiscard.length - 1] || null
          });
          log(`AI 无法跟牌，拾起了 ${lastCardInRound.label}`);
        }
      }
    }
  };

  const analyzeWithAI = async () => {
    if (!gameState || isAnalyzing) return;
    setIsAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        你是一个纸牌游戏专家。当前游戏状态如下：
        我的手牌: ${gameState.hands.player.map(c => `${c.suit}${c.label}`).join(', ')}
        当前花色: ${gameState.currentSuit}
        最后出的牌: ${gameState.lastPlayedCard?.suit}${gameState.lastPlayedCard?.label}
        难度: ${difficulty}
        
        请简短分析：
        1. 我应该出哪张牌？
        2. 对手可能还剩什么牌？
        3. 赢球策略。
        字数控制在100字以内。
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setAiAnalysis(response.text || "分析失败，请重试。");
    } catch (err) {
      setAiAnalysis("AI 助手暂时不可用。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!gameState) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-[#020617] p-4 relative overflow-hidden">
      {/* Base Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black" />
      
      {/* Nebulae */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {/* Purple Nebula */}
        <div className="absolute top-[10%] left-[20%] w-[70%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        {/* Blue Nebula */}
        <div className="absolute bottom-[20%] right-[20%] w-[60%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse [animation-delay:1s]" />
        {/* Central Bright Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-300/30 blur-3xl rounded-full" />
      </div>

      {/* Sun/Bright Star in Top Right */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/10 blur-3xl rounded-full pointer-events-none" />

      {/* Planets */}
      {/* Large Left Planet */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-20 top-1/4 w-64 h-64 rounded-full bg-slate-800 shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(148,163,184,0.2)] overflow-hidden opacity-80 pointer-events-none"
      >
        <img src="https://picsum.photos/seed/planet1/400/400" alt="Planet" className="w-full h-full object-cover opacity-40 grayscale" referrerPolicy="no-referrer" />
      </motion.div>

      {/* Large Right Planet */}
      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-20 bottom-1/4 w-80 h-80 rounded-full bg-stone-800 shadow-[inset_20px_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(120,113,108,0.2)] overflow-hidden opacity-70 pointer-events-none"
      >
        <img src="https://picsum.photos/seed/planet2/500/500" alt="Planet" className="w-full h-full object-cover opacity-50 sepia" referrerPolicy="no-referrer" />
      </motion.div>

      {/* Small Floating Planets */}
      <motion.div 
        animate={{ x: [0, 10, 0], y: [0, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/3 top-1/3 w-12 h-12 rounded-full bg-blue-900 shadow-inner opacity-60 pointer-events-none"
      />
      <motion.div 
        animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-1/4 top-1/4 w-8 h-8 rounded-full bg-purple-900 shadow-inner opacity-50 pointer-events-none"
      />

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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(147,197,253,0.1),_transparent_70%)]" />
      
      {/* Rocket Explosion for Jokers */}
      <AnimatePresence>
        {gameState.lastPlayedCard?.isJoker && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 2, 0], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              <Rocket className="w-32 h-32 text-orange-500 animate-bounce" />
              <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-50 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-widest">Difficulty</span>
            <span className="text-sm font-bold text-emerald-400 uppercase">{difficulty}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-widest">Suit</span>
            <span className="text-xl">{getSuitIcon(gameState.currentSuit || 'spades')}</span>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="relative z-10 flex-1 flex flex-col gap-8 items-center justify-center">
        {/* Opponent Hand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">AI 大师 ({gameState.hands.ai.length})</span>
          </div>
          <div className="flex -space-x-12">
            {gameState.hands.ai.map((c, i) => (
              <Card key={c.id} card={c} isFaceUp={false} className="scale-75" disabled />
            ))}
          </div>
        </div>

        {/* Center Area */}
        <div className="flex items-center gap-12">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer" onClick={handleDraw}>
              <div className="absolute -inset-1 bg-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Card 
                card={{ id: 'back', suit: 'spades', value: 0, isJoker: false, label: '' }} 
                isFaceUp={false} 
                className="relative"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-xs font-bold">
                {gameState.drawPile.length}
              </div>
            </div>
            <button 
              onClick={handlePass}
              disabled={gameState.currentTurn !== 'player'}
              className="mt-2 px-4 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Pass Turn
            </button>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {gameState.roundCards.length > 0 ? (
                  <div className="flex -space-x-16">
                    {gameState.roundCards.map((rc, idx) => (
                      <motion.div
                        key={`${rc.card.id}-${idx}`}
                        initial={{ opacity: 0, x: idx === 0 ? -50 : 50, rotate: idx === 0 ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0, rotate: idx === 0 ? -10 : 10 }}
                        className="relative z-10"
                      >
                        <Card card={rc.card} className="card-glow" disabled />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  gameState.lastPlayedCard && (
                    <Card 
                      key={gameState.lastPlayedCard.id}
                      card={gameState.lastPlayedCard} 
                      className="opacity-40 grayscale"
                      disabled
                    />
                  )
                )}
              </AnimatePresence>
            </div>
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Round</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">你的手牌 ({gameState.hands.player.length})</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 px-4">
            {gameState.hands.player.map((c) => (
              <Card 
                key={c.id} 
                card={c} 
                onClick={() => handlePlayCard(c)}
                disabled={gameState.currentTurn !== 'player'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="relative z-10 absolute right-6 top-24 bottom-24 w-64 flex flex-col gap-4">
        <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-bottom border-white/10 pb-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Game Log</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-sm font-mono">
            {gameState.gameLog.map((msg, i) => (
              <div key={i} className={i === 0 ? "text-emerald-400" : "text-slate-500"}>
                {`> ${msg}`}
              </div>
            ))}
          </div>
        </div>

        {difficulty === 'simple' && (
          <div className="bg-indigo-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">AI Assistant</span>
              </div>
              <button 
                onClick={analyzeWithAI}
                disabled={isAnalyzing}
                className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
              </button>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed italic">
              {isAnalyzing ? "正在分析局势..." : (aiAnalysis || "点击刷新获取 AI 建议")}
            </div>
          </div>
        )}
      </div>

      {/* Suit Picker Modal */}
      <AnimatePresence>
        {showSuitPicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center"
            >
              <h3 className="text-2xl font-display font-bold mb-6">选择接下来的花色</h3>
              <div className="grid grid-cols-2 gap-4">
                {(['spades', 'hearts', 'diamonds', 'clubs'] as Type.Suit[]).map(suit => (
                  <button
                    key={suit}
                    onClick={() => executePlay('player', selectedCard!, suit)}
                    className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
                  >
                    <span className={cn("text-4xl", getSuitColor(suit))}>{getSuitIcon(suit)}</span>
                    <span className="text-xs uppercase font-bold tracking-widest text-slate-400">{suit}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory/Defeat Cinematic Screens */}
      <AnimatePresence>
        {gameState.winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden"
          >
            {gameState.winner === 'player' ? (
              /* Victory: Sword slashing the sea */
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <motion.div 
                  initial={{ x: -1000, y: -500, rotate: 45 }}
                  animate={{ x: 1000, y: 500, rotate: 45 }}
                  transition={{ duration: 0.5, ease: "easeIn" }}
                  className="absolute w-[200%] h-4 bg-white shadow-[0_0_50px_white] z-10"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 1, type: "spring" }}
                  className="text-center z-20"
                >
                  <h2 className="text-[12rem] font-display font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] leading-none">胜利</h2>
                  <div className="mt-12 flex gap-6 justify-center">
                    <button onClick={initGame} className="px-12 py-4 bg-white text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all">再战一局</button>
                    <button onClick={onBack} className="px-12 py-4 border border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-all">返回菜单</button>
                  </div>
                </motion.div>
                <div className="absolute inset-0 bg-blue-900/20 pointer-events-none" />
              </div>
            ) : (
              /* Defeat: Giant shouting at the sky */
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900">
                <motion.div 
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-center z-20"
                >
                  <div className="mb-8 text-9xl">👹</div>
                  <h2 className="text-8xl font-display font-black text-red-500 mb-4">再战！</h2>
                  <p className="text-slate-400 text-xl mb-12">巨人向天空发出了不屈的呐喊</p>
                  <div className="flex gap-6 justify-center">
                    <button onClick={initGame} className="px-12 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all">不服再战</button>
                    <button onClick={onBack} className="px-12 py-4 border border-slate-700 text-slate-400 font-bold rounded-2xl hover:bg-white/5 transition-all">灰溜溜离开</button>
                  </div>
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Turn Indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-20">
        <div className={cn(
          "px-6 py-2 rounded-full border backdrop-blur-md transition-all duration-500",
          gameState.currentTurn === 'player' 
            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
            : "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
        )}>
          <span className="text-sm font-bold uppercase tracking-[0.2em]">
            {gameState.currentTurn === 'player' ? '你的回合' : 'AI 正在思考...'}
          </span>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function getSuitIcon(suit: Type.Suit) {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    default: return '★';
  }
}

function getSuitColor(suit: Type.Suit) {
  switch (suit) {
    case 'hearts':
    case 'diamonds':
      return 'text-red-500';
    case 'joker':
      return 'text-purple-500';
    default:
      return 'text-slate-900';
  }
}

import { Type } from "./types";
import { SUITS, VALUES } from "./constants";

export const createDeck = (): Type.Card[] => {
  const deck: Type.Card[] = [];
  
  // Standard 52 cards
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      let label = value.toString();
      if (value === 1) label = 'A';
      if (value === 11) label = 'J';
      if (value === 12) label = 'Q';
      if (value === 13) label = 'K';
      
      deck.push({
        id: `${suit}-${value}`,
        suit,
        value,
        isJoker: false,
        label
      });
    });
  });
  
  // Jokers
  deck.push({
    id: 'joker-small',
    suit: 'joker',
    value: 14,
    isJoker: true,
    label: '小王'
  });
  deck.push({
    id: 'joker-big',
    suit: 'joker',
    value: 15,
    isJoker: true,
    label: '大王'
  });
  
  return shuffle(deck);
};

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getSuitIcon = (suit: Type.Suit) => {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    default: return '★';
  }
};

export const getSuitColor = (suit: Type.Suit) => {
  switch (suit) {
    case 'hearts':
    case 'diamonds':
      return 'text-red-500';
    case 'joker':
      return 'text-purple-500';
    default:
      return 'text-slate-900';
  }
};

export const getInitialCard = (deck: Type.Card[]): { card: Type.Card, remaining: Type.Card[] } => {
  const tempDeck = [...deck];
  for (let i = tempDeck.length - 1; i >= 0; i--) {
    if (!tempDeck[i].isJoker) {
      const [card] = tempDeck.splice(i, 1);
      return { card, remaining: tempDeck };
    }
  }
  // Fallback (should not happen with 54 cards)
  return { card: tempDeck.pop()!, remaining: tempDeck };
};

export const dealHands = (deck: Type.Card[], difficulty: Type.Difficulty): { player: Type.Card[], ai: Type.Card[], remaining: Type.Card[] } => {
  const tempDeck = [...deck];
  // Sort by value to facilitate biased dealing
  tempDeck.sort((a, b) => a.value - b.value);
  
  const playerHand: Type.Card[] = [];
  const aiHand: Type.Card[] = [];

  if (difficulty === 'simple') {
    // Player gets slightly better cards: pick from 60-90% percentile
    for (let i = 0; i < 5; i++) {
      const pIdx = Math.floor(tempDeck.length * 0.6) + Math.floor(Math.random() * (tempDeck.length * 0.3));
      playerHand.push(tempDeck.splice(pIdx, 1)[0]);
      
      const aIdx = Math.floor(tempDeck.length * 0.1) + Math.floor(Math.random() * (tempDeck.length * 0.4));
      aiHand.push(tempDeck.splice(aIdx, 1)[0]);
    }
  } else if (difficulty === 'hell') {
    // AI gets slightly better cards: pick from 60-90% percentile
    for (let i = 0; i < 5; i++) {
      const aIdx = Math.floor(tempDeck.length * 0.6) + Math.floor(Math.random() * (tempDeck.length * 0.3));
      aiHand.push(tempDeck.splice(aIdx, 1)[0]);
      
      const pIdx = Math.floor(tempDeck.length * 0.1) + Math.floor(Math.random() * (tempDeck.length * 0.4));
      playerHand.push(tempDeck.splice(pIdx, 1)[0]);
    }
  } else {
    // Hard: Random
    for (let i = 0; i < 5; i++) {
      const pIdx = Math.floor(Math.random() * tempDeck.length);
      playerHand.push(tempDeck.splice(pIdx, 1)[0]);
      const aIdx = Math.floor(Math.random() * tempDeck.length);
      aiHand.push(tempDeck.splice(aIdx, 1)[0]);
    }
  }

  return { 
    player: shuffle(playerHand), 
    ai: shuffle(aiHand), 
    remaining: shuffle(tempDeck) 
  };
};

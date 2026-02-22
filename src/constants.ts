import { Type } from "./types";

export const SUITS: Type.Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const VALUES = Array.from({ length: 13 }, (_, i) => i + 1);

export const DIFFICULTY_SETTINGS = {
  simple: {
    playerGoodCardProb: 0.7,
    aiHelp: true,
    aiSmartness: 'low',
  },
  hard: {
    playerGoodCardProb: 0.5,
    aiHelp: false,
    aiSmartness: 'medium',
  },
  hell: {
    playerGoodCardProb: 0.3,
    aiHelp: false,
    aiSmartness: 'high',
  }
};

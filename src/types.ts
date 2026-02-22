export namespace Type {
  export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs' | 'joker';
  
  export interface Card {
    id: string;
    suit: Suit;
    value: number; // 1-13, 14 for small joker, 15 for big joker
    isJoker: boolean;
    label: string;
  }

  export type Difficulty = 'simple' | 'hard' | 'hell';
  export type GameMode = 'single' | 'double' | 'multi';

  export interface GameState {
    deck: Card[];
    hands: Record<string, Card[]>; // playerId -> cards
    currentSuit: Suit | null;
    currentTurn: string; // playerId
    lastPlayedCard: Card | null;
    roundCards: { playerId: string, card: Card }[];
    drawPile: Card[];
    discardPile: Card[];
    winner: string | null;
    players: Player[];
    difficulty: Difficulty;
    mode: GameMode;
    gameLog: string[];
  }

  export interface Player {
    id: string;
    name: string;
    isAI: boolean;
    avatar: string;
  }
}

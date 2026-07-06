export interface FeynmanCard {
  id: string;
  concept: string;
  category: string;
  definition: string;
  realLifeExample: string;
  commonMistakes: string[];
  memoryTrick: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FeynmanProgress {
  cardId: string;
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
  reviewCount: number;
  lastReviewed: string;
  nextReview: string;
  isFavorite: boolean;
}

export const FEYNMAN_CATEGORIES = [
  '计算机科学',
  '物理学',
  '心理学',
  '经济学',
  '生物学',
  '哲学',
  '数学',
  '化学',
] as const;

export type FeynmanCategory = (typeof FEYNMAN_CATEGORIES)[number];
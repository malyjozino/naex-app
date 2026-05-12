export interface User {
  id: string;
  nickname: string;
  pin: string;
  avatar: string;
  totalLitres: number;
  totalBeers: number;
  streakCurrent: number;
  streakLongest: number;
  rankTitle: string;
  lastBeerDate?: string;
}

export interface BeerPost {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  photoUrl: string;
  amount: 0.3 | 0.5;
  timestamp: any; // Firestore Timestamp
  totalLitresAfter: number;
  reactions: Record<string, string[]>; // emoji -> userIds
  isPending?: boolean;
}

export interface PendingPost extends Omit<BeerPost, 'id' | 'timestamp'> {
  tempId: string;
  progress: number;
  photoBlob: Blob;
}

export const RANKS = [
  { minLitres: 0, title: 'Bar Novice' },
  { minLitres: 5, title: 'Ale Apprentice' },
  { minLitres: 15, title: 'Draft Drinker' },
  { minLitres: 30, title: 'Pub Regular' },
  { minLitres: 60, title: 'Tavern King' },
  { minLitres: 100, title: 'Beer Lord' },
  { minLitres: 200, title: 'Legendary Brew-Master' },
];

export function getRank(litres: number): string {
  const rank = RANKS.slice().reverse().find(r => litres >= r.minLitres);
  return rank ? rank.title : RANKS[0].title;
}

export const FUNNY_AVATARS = [
  '🍺', '🍻', '🥨', '🍖', '🧔', '🏰', '🛡️', '👑', '🧙', '🔥', '💀', '🪵'
];

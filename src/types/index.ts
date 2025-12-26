// Types for the billiard rating system

export interface Player {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  yearOfBirth?: number;
  age?: number;
  rating: number;
  matches: string[]; // Match IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  player1Score: number;
  player2Score: number;
  maxScore: number; // До скільки очок грали (наприклад, до 5, до 7, до 10)
  player1RatingBefore: number;
  player2RatingBefore: number;
  player1RatingAfter: number;
  player2RatingAfter: number;
  player1RatingChange: number;
  player2RatingChange: number;
  date: Date;
  sequenceIndex?: number; // Порядок обробки матчу при імпорті (для сортування при однаковій даті)
  tournament?: string; // Назва турніру або змагання
}

export interface RatingBand {
  name: string;
  color: string;
  textColor: string;
  minRating: number;
  maxRating: number;
}

export const RATING_BANDS: RatingBand[] = [
  { name: 'Newbie', color: 'bg-gray-500', textColor: 'text-gray-500', minRating: 0, maxRating: 1199 },
  { name: 'Pupil', color: 'bg-green-500', textColor: 'text-green-500', minRating: 1200, maxRating: 1399 },
  { name: 'Specialist', color: 'bg-cyan-500', textColor: 'text-cyan-500', minRating: 1400, maxRating: 1599 },
  { name: 'Expert', color: 'bg-blue-500', textColor: 'text-blue-500', minRating: 1600, maxRating: 1899 },
  { name: 'Candidate Master', color: 'bg-purple-500', textColor: 'text-purple-500', minRating: 1900, maxRating: 2099 },
  { name: 'Master', color: 'bg-orange-500', textColor: 'text-orange-500', minRating: 2100, maxRating: 2299 },
  { name: 'International Master', color: 'bg-orange-600', textColor: 'text-orange-600', minRating: 2300, maxRating: 2399 },
  { name: 'Grandmaster', color: 'bg-red-500', textColor: 'text-red-500', minRating: 2400, maxRating: Infinity },
];

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  highestRating: number;
  lowestRating: number;
  ratingChange: number;
}

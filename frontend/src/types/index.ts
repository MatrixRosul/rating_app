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
  initialRating?: number; // Початковий рейтинг після калібрування (для графіка)
  isCMS?: boolean; // Кандидат у майстри спорту (реальне звання)
  matches: string[]; // Match IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name?: string; // Ім'я гравця 1 (для віртуальних профілів)
  player2Name?: string; // Ім'я гравця 2 (для віртуальних профілів)
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
  stage?: string; // Стадія матчу: group, round16, quarterfinal, semifinal, final
  matchWeight?: number; // Вага матчу (1.0-2.0) для розрахунку рейтингу
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
  { name: 'Expert', color: 'bg-blue-500', textColor: 'text-blue-500', minRating: 1600, maxRating: 1799 },
  { name: 'Candidate Master', color: 'bg-purple-500', textColor: 'text-purple-500', minRating: 1800, maxRating: 2299 },
  { name: 'Master', color: 'bg-orange-500', textColor: 'text-orange-500', minRating: 2300, maxRating: 2499 },
  { name: 'Grandmaster', color: 'bg-red-500', textColor: 'text-red-500', minRating: 2500, maxRating: Infinity },
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

// Tournament types
export type TournamentStatus = 'pending' | 'ongoing' | 'completed';

export interface TournamentRegisteredPlayer {
  playerId: string;
  playerName: string;
  rating: number;
  username?: string;
  registeredAt: string;
  registeredByAdmin: boolean;
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: TournamentStatus;
  startDate?: string;
  endDate?: string;
  createdByAdminId: number;
  createdAt: string;
  registeredCount: number;
  isRegistered?: boolean;
  registeredPlayers?: TournamentRegisteredPlayer[];
}

export interface AvailablePlayer {
  id: string;
  name: string;
  rating: number;
  matchesPlayed: number;
}



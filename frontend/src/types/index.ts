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
  peakRating?: number; // Найвищий рейтинг гравця
  matchesCount?: number; // Кількість зіграних матчів
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
  { name: 'Новачок', color: 'bg-gray-500', textColor: 'text-gray-500', minRating: 0, maxRating: 1199 },
  { name: 'Учень', color: 'bg-green-500', textColor: 'text-green-500', minRating: 1200, maxRating: 1399 },
  { name: 'Спеціаліст', color: 'bg-cyan-500', textColor: 'text-cyan-500', minRating: 1400, maxRating: 1599 },
  { name: 'Експерт', color: 'bg-blue-500', textColor: 'text-blue-500', minRating: 1600, maxRating: 1799 },
  { name: 'Кандидат у Майстри', color: 'bg-purple-500', textColor: 'text-purple-500', minRating: 1800, maxRating: 2299 },
  { name: 'Майстер', color: 'bg-orange-500', textColor: 'text-orange-500', minRating: 2300, maxRating: 2499 },
  { name: 'Гросмейстер', color: 'bg-red-500', textColor: 'text-red-500', minRating: 2500, maxRating: Infinity },
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
export type TournamentStatus = 'registration' | 'in_progress' | 'finished';
export type ParticipantStatus = 'pending' | 'confirmed' | 'rejected' | 'active' | 'eliminated';

export type TournamentDiscipline = 
  | 'FREE_PYRAMID'
  | 'FREE_PYRAMID_EXTENDED'
  | 'COMBINED_PYRAMID'
  | 'DYNAMIC_PYRAMID'
  | 'COMBINED_PYRAMID_CHANGES';export interface TournamentParticipant {
  id: number;
  playerId: number;
  playerName: string;
  rating: number;
  status: ParticipantStatus;
  seed?: number;
  registeredAt: string;
  confirmedAt?: string;
  registeredByAdmin: boolean;
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: TournamentStatus;
  registrationStart?: string;
  registrationEnd: string;
  startDate?: string;
  endDate?: string;
  startedAt?: string;
  finishedAt?: string;
  city: string;
  country: string;
  club: string;
  discipline: TournamentDiscipline;
  isRated: boolean;
  createdByAdminId: number;
  createdAt: string;
  registeredCount: number;
  isRegistered?: boolean;
  registeredPlayers?: TournamentParticipant[];
}

export interface AvailablePlayer {
  id: number;
  name: string;
  rating: number;
  matchesPlayed: number;
}

// PHASE 3: Match Management types
export type MatchStatus = 'pending' | 'in_progress' | 'finished';

export interface TournamentMatch {
  id: number;
  tournamentId: number;
  matchNumber: number;
  round: string;
  roundName?: string;
  player1Id?: number;
  player2Id?: number;
  player1Name?: string;
  player2Name?: string;
  winnerId?: number;
  player1Score: number;
  player2Score: number;
  maxScore: number | null;  // Can be null if race_to not set for this round
  status: MatchStatus;
  nextMatchId?: number;
  positionInNext?: number;
  startedAt?: string;
  finishedAt?: string;
  tableId?: number;
  tableName?: string;
  videoUrl?: string;
  date?: string;
  createdAt?: string;
}

export interface Table {
  id: number;
  tournamentId: number;
  name: string;
  isActive: boolean;
  isOccupied: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StartMatchRequest {
  tableId: number;
  videoUrl?: string;
}

export interface FinishMatchRequest {
  player1Score: number;
  player2Score: number;
}

export interface EditMatchRequest {
  player1Score: number;
  player2Score: number;
}



/**
 * Application constants for frontend
 * Following best practices: STRING in DB, constants in code with TypeScript types
 */

// ============================================
// USER ROLES
// ============================================
export const ROLES = {
  GUEST: "guest",
  PLAYER: "player",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// ============================================
// TOURNAMENT STATUS
// ============================================
export const TOURNAMENT_STATUS = {
  REGISTRATION: "registration",
  IN_PROGRESS: "in_progress",
  FINISHED: "finished",
  DRAFT: "draft",
  CANCELED: "canceled",
} as const;

export type TournamentStatus = typeof TOURNAMENT_STATUS[keyof typeof TOURNAMENT_STATUS];

// ============================================
// DISCIPLINES
// ============================================
export const DISCIPLINES = {
  FREE_PYRAMID: "free_pyramid",
  FREE_PYRAMID_EXTENDED: "free_pyramid_extended",
  COMBINED_PYRAMID: "combined_pyramid",
  DYNAMIC_PYRAMID: "dynamic_pyramid",
  COMBINED_PYRAMID_CHANGES: "combined_pyramid_changes",
} as const;

export type Discipline = typeof DISCIPLINES[keyof typeof DISCIPLINES];

// Локалізовані назви дисциплін
export const DISCIPLINE_NAMES: Record<Discipline, string> = {
  [DISCIPLINES.FREE_PYRAMID]: "Вільна піраміда",
  [DISCIPLINES.FREE_PYRAMID_EXTENDED]: "Вільна піраміда (розширена)",
  [DISCIPLINES.COMBINED_PYRAMID]: "Комбінована піраміда",
  [DISCIPLINES.DYNAMIC_PYRAMID]: "Динамічна піраміда",
  [DISCIPLINES.COMBINED_PYRAMID_CHANGES]: "Комбінована піраміда (зміни)",
};

// ============================================
// BRACKET TYPES
// ============================================
export const BRACKET_TYPES = {
  SINGLE_ELIMINATION: "single_elimination",
  DOUBLE_ELIMINATION: "double_elimination",
  GROUP_STAGE: "group_stage",
} as const;

export type BracketType = typeof BRACKET_TYPES[keyof typeof BRACKET_TYPES];

// Локалізовані назви типів сіток
export const BRACKET_TYPE_NAMES: Record<BracketType, string> = {
  [BRACKET_TYPES.SINGLE_ELIMINATION]: "Одинарна елімінація",
  [BRACKET_TYPES.DOUBLE_ELIMINATION]: "Подвійна елімінація",
  [BRACKET_TYPES.GROUP_STAGE]: "Групова стадія",
};

// ============================================
// MATCH STATUS
// ============================================
export const MATCH_STATUS = {
  PENDING: "pending",          // Status in DB
  SCHEDULED: "scheduled",      // Alias for backward compatibility
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FINISHED: "finished",        // Alias for backward compatibility
  CANCELLED: "cancelled",
} as const;

export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];

// ============================================
// REGISTRATION STATUS
// ============================================
export const REGISTRATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type RegistrationStatus = typeof REGISTRATION_STATUS[keyof typeof REGISTRATION_STATUS];

// ============================================
// STATUS NAMES (LOCALIZED)
// ============================================
export const STATUS_NAMES: Record<TournamentStatus, string> = {
  [TOURNAMENT_STATUS.REGISTRATION]: "Реєстрація",
  [TOURNAMENT_STATUS.IN_PROGRESS]: "Триває",
  [TOURNAMENT_STATUS.FINISHED]: "Завершено",
  [TOURNAMENT_STATUS.DRAFT]: "Чернетка",
  [TOURNAMENT_STATUS.CANCELED]: "Скасовано",
};

export const MATCH_STATUS_NAMES: Record<string, string> = {
  [MATCH_STATUS.PENDING]: "Очікує",
  [MATCH_STATUS.SCHEDULED]: "Заплановано",
  [MATCH_STATUS.IN_PROGRESS]: "Триває",
  [MATCH_STATUS.COMPLETED]: "Завершено",
  [MATCH_STATUS.FINISHED]: "Завершено",
  [MATCH_STATUS.CANCELLED]: "Скасовано",
};

// ============================================
// DEFAULT VALUES
// ============================================
export const DEFAULT_RATING = 1300.0;
export const DEFAULT_COUNTRY = "Україна";

// ============================================
// API ENDPOINTS
// ============================================
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  ME: "/api/auth/me",
  
  // Players
  PLAYERS: "/api/players",
  PLAYER_BY_ID: (id: number) => `/api/players/${id}`,
  
  // Tournaments
  TOURNAMENTS: "/api/tournaments",
  TOURNAMENT_BY_ID: (id: number) => `/api/tournaments/${id}`,
  TOURNAMENT_REGISTER: (id: number) => `/api/tournaments/${id}/register`,
  TOURNAMENT_START: (id: number) => `/api/tournaments/${id}/start`,
  
  // Matches
  MATCHES: "/api/matches",
  MATCH_BY_ID: (id: number) => `/api/matches/${id}`,
  MATCH_RESULT: (id: number) => `/api/matches/${id}/result`,
} as const;

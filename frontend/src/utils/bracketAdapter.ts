/**
 * Bracket Adapter
 * Converts our TournamentMatch data to react-tournament-brackets format
 */

import { TournamentMatch } from '@/types';

// Types for react-tournament-brackets library
export interface BracketParticipant {
  id: string;
  name: string;
  isWinner?: boolean;
  status?: 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null;
  resultText?: string | null;
}

export interface BracketMatch {
  id: number | string;
  name: string;
  nextMatchId: number | string | null;
  nextLooserMatchId?: number | string | null;
  tournamentRoundText: string;
  startTime: string;
  state: 'DONE' | 'SCORE_DONE' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'PENDING';
  participants: BracketParticipant[];
}

export interface DoubleEliminationMatches {
  upper: BracketMatch[];
  lower: BracketMatch[];
}

// Round name translations for display
const ROUND_LABELS: Record<string, string> = {
  // Single Elimination
  'R64': '1/64 фіналу',
  'R32': '1/32 фіналу',
  'R16': '1/16 фіналу',
  'QF': 'Чвертьфінал',
  'SF': 'Півфінал',
  'F': 'Фінал',
  // Upper Bracket (Winners)
  'WB-R64': 'WB 1/64',
  'WB-R32': 'WB 1/32',
  'WB-R16': 'WB 1/16',
  'WB-QF': 'WB Чвертьфінал',
  'WB-SF': 'WB Півфінал',
  'WB-F': 'WB Фінал',
  // Lower Bracket (Losers)
  'LB-R1': 'LB Раунд 1',
  'LB-R2': 'LB Раунд 2',
  'LB-R3': 'LB Раунд 3',
  'LB-R4': 'LB Раунд 4',
  'LB-R5': 'LB Раунд 5',
  'LB-R6': 'LB Раунд 6',
  'LB-QF': 'LB Чвертьфінал',
  'LB-SF': 'LB Півфінал',
  'LB-F': 'LB Фінал',
  // Grand Final
  'GF': 'Гранд Фінал',
  'GF-RESET': 'Гранд Фінал 2',
};

/**
 * Convert match status to library format
 */
function convertStatus(status: string): BracketMatch['state'] {
  switch (status) {
    case 'finished':
      return 'DONE';
    case 'in_progress':
      return 'SCORE_DONE';
    case 'wo':
      return 'WALK_OVER';
    default:
      return 'PENDING';
  }
}

/**
 * Create participant from match data
 */
function createParticipant(
  playerId: number | undefined | null,
  playerName: string | undefined | null,
  score: number,
  winnerId: number | undefined | null,
  isFinished: boolean
): BracketParticipant | null {
  if (!playerId) {
    return null;
  }

  const isWinner = isFinished && winnerId === playerId;

  return {
    id: String(playerId),
    name: playerName || 'TBD',
    isWinner,
    status: isFinished ? 'PLAYED' : null,
    resultText: isFinished ? String(score) : null,
  };
}

/**
 * Convert single match to library format
 */
function convertMatch(
  match: TournamentMatch,
  allMatches: TournamentMatch[]
): BracketMatch {
  const isFinished = match.status === 'finished';
  
  const participants: BracketParticipant[] = [];
  
  const p1 = createParticipant(
    match.player1Id,
    match.player1Name,
    match.player1Score,
    match.winnerId,
    isFinished
  );
  
  const p2 = createParticipant(
    match.player2Id,
    match.player2Name,
    match.player2Score,
    match.winnerId,
    isFinished
  );
  
  if (p1) participants.push(p1);
  if (p2) participants.push(p2);

  // Find next match for winners (for single elimination or upper bracket)
  const nextMatchId = match.nextMatchId || null;
  
  // For upper bracket matches, find where loser goes
  let nextLooserMatchId: number | string | null = null;
  if (match.round?.startsWith('WB-')) {
    // Find corresponding lower bracket match
    // This is based on bracket structure logic
    const lowerMatches = allMatches.filter(m => m.round?.startsWith('LB-'));
    // Logic to find loser's next match would go here
    // For now, we leave it null and let the library figure it out
  }

  return {
    id: match.id,
    name: `Match ${match.matchNumber}`,
    nextMatchId,
    nextLooserMatchId,
    tournamentRoundText: ROUND_LABELS[match.round] || match.round,
    startTime: match.date || match.createdAt || '',
    state: convertStatus(match.status),
    participants,
  };
}

/**
 * Convert matches for Single Elimination bracket
 */
export function convertToSingleElimination(matches: TournamentMatch[]): BracketMatch[] {
  return matches.map(match => convertMatch(match, matches));
}

/**
 * Convert matches for Double Elimination bracket
 */
export function convertToDoubleElimination(matches: TournamentMatch[]): DoubleEliminationMatches {
  // Separate upper and lower bracket matches
  const upperMatches = matches.filter(m => 
    m.round?.startsWith('WB-') || 
    m.round === 'GF' || 
    m.round === 'GF-RESET'
  );
  
  const lowerMatches = matches.filter(m => 
    m.round?.startsWith('LB-')
  );

  // Convert both brackets
  const upper = upperMatches.map(match => convertMatch(match, matches));
  const lower = lowerMatches.map(match => convertMatch(match, matches));

  // Add Grand Final to upper bracket
  const grandFinal = matches.filter(m => m.round === 'GF' || m.round === 'GF-RESET');
  
  return { upper, lower };
}

/**
 * Check if matches are for double elimination
 */
export function isDoubleElimination(matches: TournamentMatch[]): boolean {
  return matches.some(m => 
    m.round?.startsWith('WB-') || 
    m.round?.startsWith('LB-') ||
    m.round === 'GF'
  );
}

/**
 * Get bracket type from matches
 */
export function detectBracketType(matches: TournamentMatch[]): 'single' | 'double' | 'group' {
  if (matches.some(m => m.round?.startsWith('WB-') || m.round?.startsWith('LB-'))) {
    return 'double';
  }
  if (matches.some(m => m.round?.startsWith('GROUP'))) {
    return 'group';
  }
  return 'single';
}

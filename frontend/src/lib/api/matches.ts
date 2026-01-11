/**
 * Match Management API
 * PHASE 3: Tournament match operations
 */

import { TournamentMatch, StartMatchRequest, FinishMatchRequest, EditMatchRequest } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Get all matches for a tournament
 */
export async function getTournamentMatches(tournamentId: number): Promise<TournamentMatch[]> {
  const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/matches`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Помилка завантаження матчів');
  }

  const data = await response.json();
  
  // Backend returns array directly with snake_case, convert to camelCase
  if (!Array.isArray(data)) return [];
  
  return data.map((match: any) => ({
    id: match.id,
    tournamentId: match.tournament_id,
    matchNumber: match.match_number,
    round: match.round,
    player1Id: match.player1_id,
    player2Id: match.player2_id,
    player1Name: match.player1_name,
    player2Name: match.player2_name,
    winnerId: match.winner_id,
    player1Score: match.player1_score,
    player2Score: match.player2_score,
    maxScore: match.max_score,
    status: match.status,
    tableId: match.table_id,
    tableName: match.table_name,
    videoUrl: match.video_url,
    startedAt: match.started_at,
    finishedAt: match.finished_at,
    createdAt: match.created_at,
    date: match.date,
    roundName: match.round, // Use round as roundName
  }));
}

/**
 * Start a match (admin only)
 */
export async function startMatch(
  matchId: number,
  request: StartMatchRequest
): Promise<TournamentMatch> {
  // Convert camelCase to snake_case for backend
  const backendRequest = {
    table_id: request.tableId,
    video_url: request.videoUrl || null,
  };

  const response = await fetch(`${API_URL}/api/matches/${matchId}/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Помилка запуску матчу');
  }

  const data = await response.json();
  // Convert response to camelCase
  return {
    id: data.id,
    tournamentId: data.tournament_id,
    matchNumber: data.match_number,
    round: data.round,
    player1Id: data.player1_id,
    player2Id: data.player2_id,
    player1Name: data.player1_name,
    player2Name: data.player2_name,
    winnerId: data.winner_id,
    player1Score: data.player1_score,
    player2Score: data.player2_score,
    maxScore: data.max_score,
    status: data.status,
    tableId: data.table_id,
    tableName: data.table_name,
    videoUrl: data.video_url,
    startedAt: data.started_at,
    finishedAt: data.finished_at,
    createdAt: data.created_at,
    date: data.date,
    roundName: data.round,
  };
}

/**
 * Update live score during a match in progress (admin only)
 */
export async function updateLiveScore(
  matchId: number,
  request: { player1Score: number; player2Score: number }
): Promise<TournamentMatch> {
  // Convert camelCase to snake_case for backend
  const backendRequest = {
    score_player1: request.player1Score,
    score_player2: request.player2Score,
  };

  const response = await fetch(`${API_URL}/api/matches/${matchId}/live-score`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Помилка оновлення рахунку');
  }

  const data = await response.json();
  // Convert response to camelCase
  return {
    id: data.id,
    tournamentId: data.tournament_id,
    matchNumber: data.match_number,
    round: data.round,
    player1Id: data.player1_id,
    player2Id: data.player2_id,
    player1Name: data.player1_name,
    player2Name: data.player2_name,
    winnerId: data.winner_id,
    player1Score: data.player1_score,
    player2Score: data.player2_score,
    maxScore: data.max_score,
    status: data.status,
    tableId: data.table_id,
    tableName: data.table_name,
    videoUrl: data.video_url,
    startedAt: data.started_at,
    finishedAt: data.finished_at,
    createdAt: data.created_at,
    date: data.date,
    roundName: data.round,
  };
}

/**
 * Finish a match with result (admin only)
 */
export async function finishMatch(
  matchId: number,
  request: FinishMatchRequest
): Promise<TournamentMatch> {
  // Convert camelCase to snake_case for backend
  // Backend expects score_player1 and score_player2 (NOT player1_score)
  const backendRequest = {
    score_player1: request.player1Score,
    score_player2: request.player2Score,
  };

  const response = await fetch(`${API_URL}/api/matches/${matchId}/result`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Помилка завершення матчу');
  }

  const data = await response.json();
  // Convert response to camelCase
  return {
    id: data.id,
    tournamentId: data.tournament_id,
    matchNumber: data.match_number,
    round: data.round,
    player1Id: data.player1_id,
    player2Id: data.player2_id,
    player1Name: data.player1_name,
    player2Name: data.player2_name,
    winnerId: data.winner_id,
    player1Score: data.player1_score,
    player2Score: data.player2_score,
    maxScore: data.max_score,
    status: data.status,
    tableId: data.table_id,
    tableName: data.table_name,
    videoUrl: data.video_url,
    startedAt: data.started_at,
    finishedAt: data.finished_at,
    createdAt: data.created_at,
    date: data.date,
    roundName: data.round,
  };
}

/**
 * Edit match result (admin only, CRITICAL operation)
 */
export async function editMatchResult(
  matchId: number,
  request: EditMatchRequest
): Promise<TournamentMatch> {
  // Convert camelCase to snake_case for backend
  // Backend expects new_score_p1 and new_score_p2 (NOT player1_score)
  const backendRequest = {
    new_score_p1: request.player1Score,
    new_score_p2: request.player2Score,
  };

  const response = await fetch(`${API_URL}/api/matches/${matchId}/edit`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Помилка редагування результату');
  }

  const data = await response.json();
  // Convert response to camelCase
  return {
    id: data.id,
    tournamentId: data.tournament_id,
    matchNumber: data.match_number,
    round: data.round,
    player1Id: data.player1_id,
    player2Id: data.player2_id,
    player1Name: data.player1_name,
    player2Name: data.player2_name,
    winnerId: data.winner_id,
    player1Score: data.player1_score,
    player2Score: data.player2_score,
    maxScore: data.max_score,
    status: data.status,
    tableId: data.table_id,
    tableName: data.table_name,
    videoUrl: data.video_url,
    startedAt: data.started_at,
    finishedAt: data.finished_at,
    createdAt: data.created_at,
    date: data.date,
    roundName: data.round,
  };
}

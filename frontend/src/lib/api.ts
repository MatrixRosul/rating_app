/**
 * API client for backend communication
 * All data comes from FastAPI backend
 */

import type { Player, Match } from '@/types';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

/**
 * Fetch all players from backend
 */
export async function fetchPlayers(): Promise<Player[]> {
  try {
    const response = await fetch(`${API_URL}/api/players/`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.statusText}`);
    }
    const data = await response.json();
  
    // Convert snake_case to camelCase for frontend
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      firstName: p.first_name,
      lastName: p.last_name,
      city: p.city,
      yearOfBirth: p.year_of_birth,
      rating: p.rating,
      initialRating: p.initial_rating,
      peakRating: p.peak_rating,
      isCMS: p.is_cms,
      matches: [], // Will be populated from matches
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at || p.created_at),
      matchesCount: p.matches_count
    }));
  } catch (error: any) {
    throw new Error(`Failed to fetch players: ${error.message}`);
  }
}

/**
 * Fetch specific player by ID
 */
export async function fetchPlayer(id: string): Promise<Player> {
  const response = await fetch(`${API_URL}/api/players/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch player: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all matches (optionally filtered by player)
 */
export async function fetchMatches(playerId?: string): Promise<Match[]> {
  const url = playerId 
    ? `${API_URL}/api/matches/?player_id=${playerId}`
    : `${API_URL}/api/matches/`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.statusText}`);
  }
  const data = await response.json();
  
  // Convert snake_case to camelCase for frontend
  return data.map((m: any) => ({
    id: m.id,
    player1Id: m.player1_id,
    player2Id: m.player2_id,
    player1Name: m.player1_name,
    player2Name: m.player2_name,
    winnerId: m.winner_id,
    player1Score: m.player1_score,
    player2Score: m.player2_score,
    maxScore: m.max_score,
    player1RatingBefore: m.player1_rating_before,
    player2RatingBefore: m.player2_rating_before,
    player1RatingAfter: m.player1_rating_after,
    player2RatingAfter: m.player2_rating_after,
    player1RatingChange: m.player1_rating_change,
    player2RatingChange: m.player2_rating_change,
    date: new Date(m.date),
    createdAt: new Date(m.created_at),
    tournament: m.tournament,
    stage: m.stage
  }));
}

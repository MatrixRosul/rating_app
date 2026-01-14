'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Player, Match } from '@/types';
import PlayerSelector from '@/components/compare/PlayerSelector';
import PlayerComparisonCard from '@/components/compare/PlayerComparisonCard';
import ComparisonStats from '@/components/compare/ComparisonStats';
import RatingComparisonChart from '@/components/compare/RatingComparisonChart';
import HeadToHead from '@/components/compare/HeadToHead';
import SpiderChart from '@/components/compare/SpiderChart';
import DisciplineComparisonChart from '@/components/compare/DisciplineComparisonChart';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [player1Matches, setPlayer1Matches] = useState<Match[]>([]);
  const [player2Matches, setPlayer2Matches] = useState<Match[]>([]);
  const [h2hMatches, setH2hMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load all players
  useEffect(() => {
    loadPlayers();
  }, []);

  // Load players from URL params
  useEffect(() => {
    const id1 = searchParams.get('player1');
    const id2 = searchParams.get('player2');
    
    if (id1 && players.length > 0) {
      const p1 = players.find(p => p.id === id1);
      if (p1) {
        setPlayer1(p1);
        loadPlayerMatches(id1, setPlayer1Matches);
      }
    }
    
    if (id2 && players.length > 0) {
      const p2 = players.find(p => p.id === id2);
      if (p2) {
        setPlayer2(p2);
        loadPlayerMatches(id2, setPlayer2Matches);
      }
    }

    // Load H2H if both players selected
    if (id1 && id2) {
      loadH2HMatches(id1, id2);
    }
  }, [searchParams, players]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/players/`);
      if (!response.ok) throw new Error('Failed to load players');
      
      const data = await response.json();
      const playersData = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        firstName: p.first_name,
        lastName: p.last_name,
        city: p.city,
        yearOfBirth: p.year_of_birth,
        rating: p.rating,
        initialRating: p.initial_rating,
        peakRating: p.peak_rating,
        matchesCount: p.matches_played || 0,
        isCMS: p.is_cms,
        matches: [],
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at || p.created_at)
      }));
      
      setPlayers(playersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerMatches = async (playerId: string, setMatches: (matches: Match[]) => void) => {
    try {
      const response = await fetch(`${API_URL}/api/matches/?player_id=${playerId}`);
      if (!response.ok) return;
      
      const data = await response.json();
      const matches = data.map((m: any) => ({
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
        tournament: m.tournament,
        stage: m.stage,
        discipline: m.discipline
      }));
      
      setMatches(matches);
    } catch (err) {
      console.error('Failed to load matches:', err);
    }
  };

  const loadH2HMatches = async (player1Id: string, player2Id: string) => {
    try {
      // Завантажуємо всі матчі обох гравців і фільтруємо ті, де вони грали один з одним
      const [p1Response, p2Response] = await Promise.all([
        fetch(`${API_URL}/api/matches/?player_id=${player1Id}`),
        fetch(`${API_URL}/api/matches/?player_id=${player2Id}`)
      ]);
      
      if (!p1Response.ok || !p2Response.ok) return;
      
      const [p1Data, p2Data] = await Promise.all([
        p1Response.json(),
        p2Response.json()
      ]);
      
      // Фільтруємо матчі, де обидва гравці беруть участь
      const h2hData = p1Data.filter((m: any) => {
        const p1 = m.player1_id.toString();
        const p2 = m.player2_id.toString();
        const id1 = player1Id.toString();
        const id2 = player2Id.toString();
        return (p1 === id1 && p2 === id2) || (p1 === id2 && p2 === id1);
      });
      
      const matches = h2hData.map((m: any) => ({
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
        tournament: m.tournament,
        stage: m.stage,
        discipline: m.discipline
      }));
      
      setH2hMatches(matches);
    } catch (err) {
      console.error('Failed to load H2H matches:', err);
    }
  };

  const handleSelectPlayer1 = (player: Player) => {
    setPlayer1(player);
    loadPlayerMatches(player.id, setPlayer1Matches);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('player1', player.id);
    router.push(`/compare?${params.toString()}`);
    
    if (player2) {
      loadH2HMatches(player.id, player2.id);
    }
  };

  const handleSelectPlayer2 = (player: Player) => {
    setPlayer2(player);
    loadPlayerMatches(player.id, setPlayer2Matches);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('player2', player.id);
    router.push(`/compare?${params.toString()}`);
    
    if (player1) {
      loadH2HMatches(player1.id, player.id);
    }
  };

  const handleReset = () => {
    setPlayer1(null);
    setPlayer2(null);
    setPlayer1Matches([]);
    setPlayer2Matches([]);
    setH2hMatches([]);
    router.push('/compare');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Порівняння Гравців
              </h1>
              <p className="text-gray-600">
                Оберіть двох гравців для порівняння їх статистики та історії зустрічей
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад
            </button>
          </div>
        </div>

        {/* Player Selectors */}
        {(!player1 || !player2) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <PlayerSelector
              players={players}
              selectedPlayer={player1}
              onSelect={handleSelectPlayer1}
              label="Гравець 1"
              excludePlayerId={player2?.id}
            />
            <PlayerSelector
              players={players}
              selectedPlayer={player2}
              onSelect={handleSelectPlayer2}
              label="Гравець 2"
              excludePlayerId={player1?.id}
            />
          </div>
        )}

        {/* Comparison View */}
        {player1 && player2 && (
          <div className="space-y-8">
            {/* Reset Button */}
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Обрати інших гравців
              </button>
            </div>

            {/* Player Cards + Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
              <PlayerComparisonCard 
                player={player1} 
                matches={player1Matches}
                isLeft={true}
              />
              
              <ComparisonStats 
                player1={player1}
                player2={player2}
                player1Matches={player1Matches}
                player2Matches={player2Matches}
                h2hMatches={h2hMatches}
              />
              
              <PlayerComparisonCard 
                player={player2} 
                matches={player2Matches}
                isLeft={false}
              />
            </div>

            {/* Rating Chart */}
            <RatingComparisonChart
              player1={player1}
              player2={player2}
              player1Matches={player1Matches}
              player2Matches={player2Matches}
            />

            {/* Spider Charts - side by side */}
            <div className="grid lg:grid-cols-2 gap-6">
              <SpiderChart
                player1={player1}
                player2={player2}
                player1Matches={player1Matches}
                player2Matches={player2Matches}
              />
              
              <DisciplineComparisonChart
                player1={player1}
                player2={player2}
              />
            </div>

            {/* Head to Head */}
            <HeadToHead
              player1={player1}
              player2={player2}
              matches={h2hMatches}
            />
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

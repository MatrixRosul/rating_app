'use client';

import { getRatingBand } from '@/utils/rating';
import MatchHistory from '@/components/MatchHistory';
import RatingChart from '@/components/RatingChart';
import DisciplineRadarChart from '@/components/DisciplineRadarChart';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Match, Player } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function PlayerProfile() {
  const params = useParams();
  const playerId = parseInt(params.id as string, 10);
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'best' | 'awards'>('history');

  useEffect(() => {
    if (!isNaN(playerId)) {
      loadPlayerData();
    }
  }, [playerId]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setError('');

      // Завантажуємо дані гравця
      const playerResponse = await fetch(`${API_URL}/api/players/${playerId}`);
      if (!playerResponse.ok) {
        throw new Error('Гравця не знайдено');
      }
      const playerData = await playerResponse.json();

      // Конвертуємо дані
      const p = {
        id: playerData.id,
        name: playerData.name,
        firstName: playerData.first_name,
        lastName: playerData.last_name,
        city: playerData.city,
        yearOfBirth: playerData.year_of_birth,
        rating: playerData.rating,
        initialRating: playerData.initial_rating,
        peakRating: playerData.peak_rating,
        isCMS: playerData.is_cms,
        matches: [],
        createdAt: new Date(playerData.created_at),
        updatedAt: new Date(playerData.updated_at || playerData.created_at),
        matchesCount: playerData.matches_played || 0
      };
      setPlayer(p);

      // Завантажуємо всіх гравців для графіка
      const playersResponse = await fetch(`${API_URL}/api/players/`);
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        const players = playersData.map((pl: any) => ({
          id: pl.id,
          name: pl.name,
          rating: pl.rating,
          matchesCount: pl.matches_played || 0
        }));
        setAllPlayers(players);
      }

      // Завантажуємо матчі гравця
      const matchesResponse = await fetch(`${API_URL}/api/matches/?player_id=${playerId}`);
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        const matches = matchesData.map((m: any) => ({
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
        setPlayerMatches(matches); // Без reverse - в хронологічному порядку для графіка
      }
    } catch (err: any) {
      console.error('Error loading player:', err);
      setError(err.message || 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/rating"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Профіль гравця
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4 justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg">Завантаження...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Гравця не знайдено</h2>
          <p className="text-gray-600 mb-4">{error || 'Гравець з таким ID не існує'}</p>
          <Link 
            href="/rating"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Повернутися до рейтингу
          </Link>
        </div>
      </div>
    );
  }

  const ratingBand = getRatingBand(player.rating);

  // Обчислюємо статистику гравця
  const calculateStats = () => {
    if (playerMatches.length === 0) {
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        worstStreak: 0,
        averageRatingChange: 0,
        highestRating: player.rating,
        lowestRating: player.rating,
        ratingProgress: player.rating - (player.initialRating ?? 1200)
      };
    }

    let wins = 0;
    let losses = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let totalRatingChange = 0;
    let highestRating = player.rating;
    let lowestRating = player.rating;

    playerMatches.forEach((match, index) => {
      const isPlayer1 = Number(match.player1Id) === Number(player.id);
      const won = Number(match.winnerId) === Number(player.id);
      const ratingAfter = isPlayer1 ? match.player1RatingAfter : match.player2RatingAfter;
      const ratingChange = isPlayer1 ? match.player1RatingChange : match.player2RatingChange;

      if (won) {
        wins++;
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      } else {
        losses++;
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      }

      bestStreak = Math.max(bestStreak, currentStreak);
      worstStreak = Math.min(worstStreak, currentStreak);
      totalRatingChange += ratingChange;
      highestRating = Math.max(highestRating, ratingAfter);
      lowestRating = Math.min(lowestRating, ratingAfter);
    });

    return {
      totalMatches: playerMatches.length,
      wins,
      losses,
      winRate: wins / playerMatches.length,
      currentStreak,
      bestStreak,
      worstStreak,
      averageRatingChange: totalRatingChange / playerMatches.length,
      highestRating,
      lowestRating,
      ratingProgress: player.rating - (player.initialRating ?? 1200)
    };
  };

  const stats = calculateStats();

  // Сортуємо матчі за зміною рейтингу для вкладки "Найкращі матчі"
  const bestMatches = [...playerMatches].sort((a, b) => {
    const aChange = Number(a.player1Id) === Number(player.id)
      ? a.player1RatingChange
      : a.player2RatingChange;
    const bChange = Number(b.player1Id) === Number(player.id)
      ? b.player1RatingChange
      : b.player2RatingChange;
    return bChange - aChange;
  });

  // Розраховуємо нагороди гравця
  interface Award {
    tournament: string;
    place: number;
    placeText: string;
    date: Date;
    stage: string;
    isWinner: boolean;
  }

  const calculateAwards = (): Award[] => {
    const tournamentResults: Record<string, { bestStage: string; date: Date; isWinner: boolean }> = {};
    
    playerMatches.forEach(match => {
      if (!match.tournament || !match.stage) return;
      
      const isPlayer = Number(match.player1Id) === Number(player.id) || Number(match.player2Id) === Number(player.id);
      if (!isPlayer) return;
      
      const isWinner = Number(match.winnerId) === Number(player.id);
      const stage = match.stage.toLowerCase();
      
      // Визначаємо вагу стадії (більше = краще)
      const stageWeight: Record<string, number> = {
        'group': 0,
        'round16': 1,
        'quarterfinal': 2,
        'semifinal': 3,
        'final': 4
      };
      
      const currentWeight = stageWeight[stage] || 0;
      const existing = tournamentResults[match.tournament];
      const existingWeight = existing ? stageWeight[existing.bestStage] || 0 : -1;
      
      // Оновлюємо результат якщо це краща стадія для цього турніру
      if (currentWeight > existingWeight) {
        tournamentResults[match.tournament] = {
          bestStage: stage,
          date: new Date(match.date),
          isWinner: isWinner
        };
      }
    });
    
    // Перетворюємо результати в нагороди
    const awards: Award[] = Object.entries(tournamentResults).map(([tournament, result]) => {
      let place = 0;
      let placeText = '';
      
      switch (result.bestStage) {
        case 'final':
          place = result.isWinner ? 1 : 2;
          placeText = result.isWinner ? '1 місце' : '2 місце';
          break;
        case 'semifinal':
          place = 3;
          placeText = '3 місце';
          break;
        case 'quarterfinal':
          place = 5;
          placeText = '1/4 фіналу';
          break;
        case 'round16':
          place = 9;
          placeText = '1/8 фіналу';
          break;
        default:
          place = 17;
          placeText = 'Групова стадія';
      }
      
      return {
        tournament,
        place,
        placeText,
        date: result.date,
        stage: result.bestStage,
        isWinner: result.isWinner && result.bestStage === 'final'
      };
    });
    
    // Сортуємо: спочатку по місцю, потім по даті
    return awards.sort((a, b) => {
      if (a.place !== b.place) return a.place - b.place;
      return b.date.getTime() - a.date.getTime();
    });
  };

  const awards = calculateAwards();

  // Отримуємо звання для максимального рейтингу
  const highestRatingBand = getRatingBand(stats.highestRating);
  
  // Перевіряємо, чи змінилось звання порівняно з поточним
  const hasRankChanged = highestRatingBand.name !== ratingBand.name;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/rating"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Профіль гравця
              </h1>
            </div>
            
            <Link 
              href="/rating"
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              До рейтингу
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Player Info */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Player Photo */}
            <div className="flex justify-center sm:justify-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <svg 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>

            {/* Player Info and Rating */}
            <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold ${ratingBand.textColor}`}>
                    {player.name}
                  </h2>
                  {player.isCMS && (
                    <span 
                      className="text-amber-600 text-xs font-extrabold italic tracking-wide px-1.5 py-0.5 bg-amber-50 rounded border border-amber-300" 
                      title="Кандидат у Майстри Спорту України"
                      style={{ transform: 'skewX(-3deg)' }}
                    >
                      КМСУ
                    </span>
                  )}
                </div>
                <div className="mt-1 sm:mt-2 space-y-0.5">
                  <p className={`text-sm sm:text-base ${ratingBand.textColor} font-medium`}>
                    {ratingBand.name}
                  </p>
                  {(player.city || player.yearOfBirth) && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      {[player.city, player.yearOfBirth && `${player.yearOfBirth} р.н.`].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className={`text-4xl sm:text-5xl font-bold ${ratingBand.textColor}`}>
                  {player.rating}
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${ratingBand.color}`}></div>
                  <span className={`text-xs font-medium ${ratingBand.textColor}`}>
                    {ratingBand.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - More compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.totalMatches}</div>
              <div className="text-[10px] sm:text-xs text-gray-600">Матчів</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-green-600">{stats.wins}</div>
              <div className="text-[10px] sm:text-xs text-gray-600">Перемог</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-red-600">{stats.losses}</div>
              <div className="text-[10px] sm:text-xs text-gray-600">Поразок</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-purple-600">{(stats.winRate * 100).toFixed(0)}%</div>
              <div className="text-[10px] sm:text-xs text-gray-600">% Перемог</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className={`text-lg sm:text-xl font-bold ${highestRatingBand.textColor}`}>
                {stats.highestRating}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600">Макс рейтинг</div>
              <div className={`text-[9px] sm:text-xs font-medium mt-0.5 ${highestRatingBand.textColor}`}>
                {highestRatingBand.name}
              </div>
              {player && hasRankChanged && stats.highestRating > player.rating && (
                <div className="text-[9px] sm:text-xs text-amber-600 font-semibold mt-0.5">
                  Найкраще звання
                </div>
              )}
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg col-span-2 sm:col-span-1">
              <div className={`text-lg sm:text-xl font-bold ${stats.ratingProgress >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ratingProgress >= 0 ? '+' : ''}{stats.ratingProgress}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600">Зміна рейтингу</div>
            </div>
          </div>
        </div>

        {/* Rating Chart - Full width with padding */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <RatingChart 
            player={player}
            matches={playerMatches}
            players={allPlayers}
          />
        </div>

        {/* Discipline Radar Chart */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <DisciplineRadarChart playerId={player.id} />
        </div>

        {/* Match History */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 sm:space-x-4 sm:gap-0 mb-4 sm:mb-6 border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-4 py-2 font-semibold transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Історія матчів ({playerMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('best')}
              className={`px-3 sm:px-4 py-2 font-semibold transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'best'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Найкращі матчі
            </button>
            <button
              onClick={() => setActiveTab('awards')}
              className={`px-3 sm:px-4 py-2 font-semibold transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'awards'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Нагороди ({awards.length})
            </button>
          </div>
          
          {activeTab === 'awards' ? (
            awards.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {awards.map((award, index) => {
                  // Визначаємо колір та іконку медалі
                  const getMedalColor = (place: number) => {
                    if (place === 1) return 'bg-yellow-400 text-yellow-900';
                    if (place === 2) return 'bg-gray-300 text-gray-700';
                    if (place === 3) return 'bg-orange-400 text-orange-900';
                    return 'bg-blue-100 text-blue-700';
                  };
                  
                  const getMedalIcon = (place: number) => {
                    if (place === 1) return '🥇';
                    if (place === 2) return '🥈';
                    if (place === 3) return '🥉';
                    return '🏆';
                  };

                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getMedalColor(award.place)}`}>
                          <span className="text-xl sm:text-2xl">{getMedalIcon(award.place)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">
                            {award.tournament}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {award.placeText}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs sm:text-sm text-gray-500">
                        {new Date(award.date).toLocaleDateString('uk-UA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-base sm:text-lg">
                  Нагород поки немає
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Беріть участь у турнірах, щоб отримати нагороди
                </p>
              </div>
            )
          ) : playerMatches.length > 0 ? (
            <MatchHistory 
              matches={activeTab === 'history' ? [...playerMatches].reverse() : bestMatches}
              playerId={String(player.id)}
            />
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Матчів поки немає</h3>
              <p className="text-sm sm:text-base text-gray-600">Цей гравець ще не грав жодного матчу</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

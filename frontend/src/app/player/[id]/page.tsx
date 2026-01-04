'use client';

import { useApp } from '@/context/AppContext';
import { getRatingBand, calculatePlayerStats } from '@/utils/rating';
import MatchHistory from '@/components/MatchHistory';
import RatingChart from '@/components/RatingChart';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchMatches } from '@/lib/api';
import type { Match } from '@/types';

export default function PlayerProfile() {
  const { state } = useApp();
  const params = useParams();
  // Декодуємо URL-encoded параметр (кирилиця)
  const playerIdentifier = decodeURIComponent(params.id as string);
  
  // Знаходимо гравця за іменем або ID (для зворотної сумісності з UUID)
  const player = state.players.find(p => p.name === playerIdentifier || p.id === playerIdentifier);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'best'>('history');
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  // Завантажуємо матчі гравця з API
  useEffect(() => {
    const loadPlayerMatches = async () => {
      if (player) {
        setMatchesLoading(true);
        try {
          const matches = await fetchMatches(player.id);
          // Реверсуємо щоб показувати найновіші зверху
          setPlayerMatches(matches.reverse());
        } catch (error) {
          console.error('Error loading player matches:', error);
        } finally {
          setMatchesLoading(false);
        }
      }
    };
    loadPlayerMatches();
  }, [player?.id]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || state.loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/"
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

  
  // Якщо гравця немає в списку, але є в матчах — створюємо віртуального гравця
  let virtualPlayer = player;
  if (!player) {
    // Шукаємо гравця в матчах за іменем або ID
    const playerMatches = state.matches.filter(match => 
      match.player1Id === playerIdentifier || match.player2Id === playerIdentifier ||
      match.player1Name === playerIdentifier || match.player2Name === playerIdentifier
    );
    
    if (playerMatches.length > 0) {
      // Знаходимо останній матч для отримання актуального рейтингу
      const lastMatch = playerMatches[playerMatches.length - 1];
      const isPlayer1 = lastMatch.player1Id === playerIdentifier || lastMatch.player1Name === playerIdentifier;
      const currentRating = isPlayer1 ? lastMatch.player1RatingAfter : lastMatch.player2RatingAfter;
      const actualId = isPlayer1 ? lastMatch.player1Id : lastMatch.player2Id;
      
      // Отримуємо ім'я з матчу
      const playerName = isPlayer1 
        ? (lastMatch.player1Name || `Гравець ${playerIdentifier}`)
        : (lastMatch.player2Name || `Гравець ${playerIdentifier}`);
      
      virtualPlayer = {
        id: actualId,
        name: playerName,
        rating: currentRating,
        matches: playerMatches.map(m => m.id),
        createdAt: new Date(playerMatches[0].date),
        updatedAt: new Date(lastMatch.date)
      };
    }
  }

  if (!virtualPlayer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Гравця не знайдено</h2>
          <p className="text-gray-600 mb-4">Гравець з таким ID не існує</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Повернутися до рейтингу
          </Link>
        </div>
      </div>
    );
  }

  const ratingBand = getRatingBand(virtualPlayer.rating);
  const stats = calculatePlayerStats(virtualPlayer, playerMatches);

  // Сортуємо матчі за зміною рейтингу для вкладки "Найкращі матчі"
  // Використовуємо реальну зміну (не абсолютну), щоб найбільший приріст був зверху
  const bestMatches = [...playerMatches].sort((a, b) => {
    const aChange = a.player1Id === virtualPlayer.id
      ? a.player1RatingChange
      : a.player2RatingChange;
    const bChange = b.player1Id === virtualPlayer.id
      ? b.player1RatingChange
      : b.player2RatingChange;
    return bChange - aChange;
  });

  // Find player's rank
  const sortedPlayers = [...state.players].sort((a, b) => b.rating - a.rating);
  const playerRank = sortedPlayers.findIndex(p => p.id === virtualPlayer.id) + 1;

  // Отримуємо звання для максимального рейтингу
  const highestRatingBand = getRatingBand(stats.highestRating);
  
  // Перевіряємо, чи змінилось звання порівняно з поточним
  const hasRankChanged = highestRatingBand.name !== ratingBand.name;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
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
            
            <Link 
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              До рейтингу
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Player Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full text-xl font-bold text-gray-600">
                #{playerRank}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className={`text-3xl font-bold ${ratingBand.textColor}`}>{virtualPlayer.name}</h2>
                  {virtualPlayer.isCMS && (
                    <span 
                      className="text-amber-600 text-sm font-extrabold italic tracking-wide px-2 py-1 bg-amber-50 rounded border border-amber-300" 
                      title="Кандидат у Майстри Спорту України"
                      style={{ transform: 'skewX(-3deg)' }}
                    >
                      КМСУ
                    </span>
                  )}
                </div>
                <div className="text-lg text-gray-600 space-y-1">
                  <p>{ratingBand.name}</p>
                  {(virtualPlayer.city || virtualPlayer.yearOfBirth) && (
                    <p className="text-sm">
                      {[virtualPlayer.city, virtualPlayer.yearOfBirth && `${virtualPlayer.yearOfBirth} р.н.`].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-4xl font-bold ${ratingBand.textColor}`}>
                {virtualPlayer.rating}
              </div>
              <div className="flex items-center justify-end space-x-2 mt-2">
                <div 
                  className={`w-4 h-4 rounded-full ${ratingBand.color}`}
                ></div>
                <span className={`text-sm font-medium ${ratingBand.textColor}`}>
                  {ratingBand.name}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMatches}</div>
              <div className="text-sm text-gray-600">Матчів</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
              <div className="text-sm text-gray-600">Перемог</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
              <div className="text-sm text-gray-600">Поразок</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.winRate}%</div>
              <div className="text-sm text-gray-600">% Перемог</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${highestRatingBand.textColor}`}>
                {stats.highestRating}
              </div>
              <div className="text-sm text-gray-600">Макс рейтинг</div>
              <div className={`text-xs font-medium mt-1 ${highestRatingBand.textColor}`}>
                {highestRatingBand.name}
              </div>
              {player && hasRankChanged && stats.highestRating > player.rating && (
                <div className="text-xs text-amber-600 font-semibold mt-1">
                  Найкраще звання
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${stats.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ratingChange >= 0 ? '+' : ''}{stats.ratingChange}
              </div>
              <div className="text-sm text-gray-600">Зміна рейтингу</div>
            </div>
          </div>
        </div>

        {/* Rating Chart */}
        <div className="mb-8">
          <RatingChart 
            player={virtualPlayer}
            matches={state.matches}
            players={state.players}
          />
        </div>

        {/* Match History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Історія матчів ({playerMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('best')}
              className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'best'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Найкращі матчі
            </button>
          </div>
          
          {playerMatches.length > 0 ? (
            <MatchHistory 
              matches={activeTab === 'history' ? playerMatches : bestMatches}
              players={state.players}
              playerId={virtualPlayer.id}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Матчів поки немає</h3>
              <p className="text-gray-600">Цей гравець ще не грав жодного матчу</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

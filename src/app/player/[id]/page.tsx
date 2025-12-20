'use client';

import { useApp } from '@/context/AppContext';
import { getRatingBand, calculatePlayerStats } from '@/utils/rating';
import MatchHistory from '@/components/MatchHistory';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PlayerProfile() {
  const { state } = useApp();
  const params = useParams();
  const playerId = params.id as string;
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || state.loading || !state.isClient) {
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

  const player = state.players.find(p => p.id === playerId);

  if (!player) {
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

  const ratingBand = getRatingBand(player.rating);
  const stats = calculatePlayerStats(player, state.matches);
  const playerMatches = state.matches.filter(match => 
    match.player1Id === player.id || match.player2Id === player.id
  );

  // Find player's rank
  const sortedPlayers = [...state.players].sort((a, b) => b.rating - a.rating);
  const playerRank = sortedPlayers.findIndex(p => p.id === player.id) + 1;

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
                <h2 className={`text-3xl font-bold ${ratingBand.textColor}`}>{player.name}</h2>
                <p className="text-lg text-gray-600">{ratingBand.name}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-4xl font-bold ${ratingBand.textColor}`}>
                {player.rating}
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
              <div className="text-2xl font-bold text-orange-600">{stats.highestRating}</div>
              <div className="text-sm text-gray-600">Макс рейтинг</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${stats.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ratingChange >= 0 ? '+' : ''}{stats.ratingChange}
              </div>
              <div className="text-sm text-gray-600">Зміна рейтингу</div>
            </div>
          </div>
        </div>

        {/* Match History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Історія матчів ({playerMatches.length})
          </h3>
          
          {playerMatches.length > 0 ? (
            <MatchHistory 
              matches={playerMatches}
              players={state.players}
              playerId={player.id}
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

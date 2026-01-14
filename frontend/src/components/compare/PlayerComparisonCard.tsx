'use client';

import type { Player, Match } from '@/types';
import { getRatingBand } from '@/utils/rating';
import { useMemo } from 'react';

interface PlayerComparisonCardProps {
  player: Player;
  matches: Match[];
  isLeft: boolean;
}

export default function PlayerComparisonCard({ player, matches, isLeft }: PlayerComparisonCardProps) {
  const band = getRatingBand(player.rating);

  const stats = useMemo(() => {
    const wins = matches.filter(m => m.winnerId === player.id).length;
    const total = matches.length;
    const winRate = total > 0 ? (wins / total * 100).toFixed(1) : '0';
    
    // Recent form (last 5 matches)
    const recentMatches = [...matches].reverse().slice(0, 5);
    const recentWins = recentMatches.filter(m => m.winnerId === player.id).length;
    
    // Average rating change
    const totalRatingChange = matches.reduce((sum, m) => {
      const change = m.player1Id === player.id ? m.player1RatingChange : m.player2RatingChange;
      return sum + Math.abs(change);
    }, 0);
    const avgRatingChange = total > 0 ? (totalRatingChange / total).toFixed(1) : '0';

    return {
      wins,
      losses: total - wins,
      total,
      winRate,
      recentWins,
      recentTotal: recentMatches.length,
      avgRatingChange
    };
  }, [player, matches]);

  const currentAge = player.yearOfBirth ? new Date().getFullYear() - player.yearOfBirth : null;

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${band.color.replace('bg-', 'border-')} transform transition-all duration-300 hover:scale-105`}>
      {/* Header with gradient */}
      <div className={`${band.color} px-6 py-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/30">
              {player.name.charAt(0)}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center mb-2">
            {player.name}
          </h3>
          <div className="text-center">
            <div className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold">
              {band.name}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 space-y-4">
        {/* Rating */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Поточний рейтинг</div>
          <div className={`text-4xl font-bold ${band.textColor}`}>
            {player.rating}
          </div>
        </div>

        {/* Peak Rating */}
        {player.peakRating && (
          <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">Пік</span>
            </div>
            <span className="text-xl font-bold text-amber-600">
              {player.peakRating}
            </span>
          </div>
        )}

        {/* Win Rate */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 font-medium">Win Rate</span>
            <span className="text-2xl font-bold text-green-600">
              {stats.winRate}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-600 font-semibold">{stats.wins}W</span>
            <span>-</span>
            <span className="text-red-600 font-semibold">{stats.losses}L</span>
            <span className="ml-auto">({stats.total} матчів)</span>
          </div>
        </div>

        {/* Recent Form */}
        {stats.recentTotal > 0 && (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-700 font-medium">Остання форма</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.recentWins}/{stats.recentTotal}
              </span>
            </div>
            {/* Recent matches visualization */}
            <div className="flex gap-1 justify-center">
              {[...matches].reverse().slice(0, 5).reverse().map((match, idx) => {
                const isWin = match.winnerId === player.id;
                const opponentName = match.player1Id === player.id ? match.player2Name : match.player1Name;
                const score = match.player1Id === player.id 
                  ? `${match.player1Score}:${match.player2Score}`
                  : `${match.player2Score}:${match.player1Score}`;
                return (
                  <div
                    key={match.id}
                    className={`w-6 h-6 rounded ${
                      isWin ? 'bg-green-500' : 'bg-red-500'
                    } cursor-pointer hover:scale-125 transition-transform flex items-center justify-center text-white text-xs font-bold`}
                    title={`${isWin ? 'Перемога' : 'Поразка'} ${score} vs ${opponentName}`}
                  >
                    {isWin ? 'W' : 'L'}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          {player.city && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Місто</div>
              <div className="text-sm font-semibold text-gray-900">{player.city}</div>
            </div>
          )}
          {currentAge && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Вік</div>
              <div className="text-sm font-semibold text-gray-900">{currentAge} років</div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500 mb-1">Матчів</div>
            <div className="text-sm font-semibold text-gray-900">{stats.total}</div>
          </div>
          {player.isCMS && (
            <div className="col-span-2 bg-purple-50 rounded-lg p-2 text-center">
              <span className="text-xs font-semibold text-purple-700">
                🏆 Кандидат у майстри спорту
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

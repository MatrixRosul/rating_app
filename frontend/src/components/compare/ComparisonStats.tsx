'use client';

import type { Player, Match } from '@/types';
import { useMemo } from 'react';
import { getRatingBand } from '@/utils/rating';

interface ComparisonStatsProps {
  player1: Player;
  player2: Player;
  player1Matches: Match[];
  player2Matches: Match[];
  h2hMatches: Match[];
}

export default function ComparisonStats({
  player1,
  player2,
  player1Matches,
  player2Matches,
  h2hMatches
}: ComparisonStatsProps) {
  const band1 = getRatingBand(player1.rating);
  const band2 = getRatingBand(player2.rating);

  const stats = useMemo(() => {
    // Player 1 stats
    const p1Wins = player1Matches.filter(m => m.winnerId === player1.id).length;
    const p1Total = player1Matches.length;
    const p1WinRate = p1Total > 0 ? (p1Wins / p1Total * 100) : 0;

    // Player 2 stats
    const p2Wins = player2Matches.filter(m => m.winnerId === player2.id).length;
    const p2Total = player2Matches.length;
    const p2WinRate = p2Total > 0 ? (p2Wins / p2Total * 100) : 0;

    // H2H stats
    const p1H2HWins = h2hMatches.filter(m => m.winnerId === player1.id).length;
    const p2H2HWins = h2hMatches.filter(m => m.winnerId === player2.id).length;
    const h2hTotal = h2hMatches.length;
    const p1H2HWinRate = h2hTotal > 0 ? (p1H2HWins / h2hTotal * 100) : 50;

    return {
      p1WinRate,
      p2WinRate,
      p1H2HWins,
      p2H2HWins,
      h2hTotal,
      p1H2HWinRate,
      p2H2HWinRate: 100 - p1H2HWinRate
    };
  }, [player1, player2, player1Matches, player2Matches, h2hMatches]);

  const StatComparison = ({ 
    label, 
    value1, 
    value2, 
    format = 'number',
    higherIsBetter = true 
  }: { 
    label: string; 
    value1: number; 
    value2: number; 
    format?: 'number' | 'percent'; 
    higherIsBetter?: boolean;
  }) => {
    const formatted1 = format === 'percent' ? `${value1.toFixed(1)}%` : value1;
    const formatted2 = format === 'percent' ? `${value2.toFixed(1)}%` : value2;
    
    const isBetter1 = higherIsBetter ? value1 > value2 : value1 < value2;
    const isBetter2 = higherIsBetter ? value2 > value1 : value2 < value1;
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="text-center mb-3">
          <h4 className="text-sm font-medium text-gray-600">{label}</h4>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className={`flex-1 text-center py-3 rounded-lg transition-all ${
            isBetter1 ? `${band1.color} text-white font-bold shadow-md scale-105` : 'bg-gray-50 text-gray-700'
          }`}>
            {formatted1}
          </div>
          <div className="text-gray-400 font-bold">VS</div>
          <div className={`flex-1 text-center py-3 rounded-lg transition-all ${
            isBetter2 ? `${band2.color} text-white font-bold shadow-md scale-105` : 'bg-gray-50 text-gray-700'
          }`}>
            {formatted2}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* VS Badge */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white text-center">
        <div className="text-6xl font-bold mb-2">VS</div>
        <div className="text-sm opacity-90">Порівняння статистики</div>
      </div>

      {/* Rating Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Рейтинг</h3>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {player1.rating}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full ${band1.color} text-white text-xs font-semibold`}>
              {band1.name}
            </div>
          </div>
          <div className="text-gray-300 text-2xl font-bold">•</div>
          <div className="flex-1 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {player2.rating}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full ${band2.color} text-white text-xs font-semibold`}>
              {band2.name}
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600">
          Різниця: <span className="font-bold">{Math.abs(player1.rating - player2.rating)}</span> очок
        </div>
      </div>

      {/* Peak Rating */}
      {player1.peakRating && player2.peakRating && (
        <StatComparison
          label="Піковий рейтинг"
          value1={player1.peakRating}
          value2={player2.peakRating}
        />
      )}

      {/* Win Rate */}
      <StatComparison
        label="Win Rate (загальний)"
        value1={stats.p1WinRate}
        value2={stats.p2WinRate}
        format="percent"
      />

      {/* Total Matches */}
      <StatComparison
        label="Зіграно матчів"
        value1={player1Matches.length}
        value2={player2Matches.length}
      />

      {/* H2H Record */}
      {stats.h2hTotal > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
            Особисті зустрічі
          </h3>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.p1H2HWins}
              </div>
              <div className="text-xs text-gray-600 mt-1">{player1.name}</div>
            </div>
            <div className="text-2xl text-gray-400 font-bold">-</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">
                {stats.p2H2HWins}
              </div>
              <div className="text-xs text-gray-600 mt-1">{player2.name}</div>
            </div>
          </div>
          
          {/* Win Rate Bar */}
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${stats.p1H2HWinRate}%` }}
            />
            <div 
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-pink-500 to-pink-600 transition-all duration-500"
              style={{ width: `${stats.p2H2HWinRate}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold drop-shadow-lg">
                {stats.p1H2HWinRate.toFixed(0)}% - {stats.p2H2HWinRate.toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600 mt-2">
            Всього матчів: {stats.h2hTotal}
          </div>
        </div>
      )}

      {stats.h2hTotal === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-300">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">
            Гравці ще не зустрічались
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Історія особистих зустрічей поки що порожня
          </p>
        </div>
      )}
    </div>
  );
}

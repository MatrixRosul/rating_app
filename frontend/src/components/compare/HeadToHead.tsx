'use client';

import type { Player, Match } from '@/types';
import { useMemo, useState } from 'react';
import { getRatingBand } from '@/utils/rating';

interface HeadToHeadProps {
  player1: Player;
  player2: Player;
  matches: Match[];
}

export default function HeadToHead({ player1, player2, matches }: HeadToHeadProps) {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  
  const band1 = getRatingBand(player1.rating);
  const band2 = getRatingBand(player2.rating);

  const stats = useMemo(() => {
    const p1Wins = matches.filter(m => m.winnerId === player1.id).length;
    const p2Wins = matches.filter(m => m.winnerId === player2.id).length;
    
    // Calculate total points scored
    const p1TotalPoints = matches.reduce((sum, m) => {
      return sum + (m.player1Id === player1.id ? m.player1Score : m.player2Score);
    }, 0);
    
    const p2TotalPoints = matches.reduce((sum, m) => {
      return sum + (m.player1Id === player2.id ? m.player1Score : m.player2Score);
    }, 0);

    // Largest win
    let largestP1Win = 0;
    let largestP2Win = 0;
    
    matches.forEach(m => {
      const p1Score = m.player1Id === player1.id ? m.player1Score : m.player2Score;
      const p2Score = m.player1Id === player2.id ? m.player1Score : m.player2Score;
      const diff = Math.abs(p1Score - p2Score);
      
      if (m.winnerId === player1.id && diff > largestP1Win) {
        largestP1Win = diff;
      }
      if (m.winnerId === player2.id && diff > largestP2Win) {
        largestP2Win = diff;
      }
    });

    return {
      p1Wins,
      p2Wins,
      total: matches.length,
      p1TotalPoints,
      p2TotalPoints,
      largestP1Win,
      largestP2Win
    };
  }, [player1, player2, matches]);

  // Sort matches by date (most recent first)
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Особисті зустрічі (H2H)
        </h3>
        <p className="text-gray-600">
          Ці гравці ще не грали між собою
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-6 text-white">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Особисті зустрічі (H2H)
        </h2>
        <div className="text-center text-purple-100">
          Історія матчів між гравцями
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 text-center">Перемоги</div>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-2xl font-bold ${band1.textColor}`}>
              {stats.p1Wins}
            </span>
            <span className="text-gray-400">-</span>
            <span className={`text-2xl font-bold ${band2.textColor}`}>
              {stats.p2Wins}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 text-center">Всього очок</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {stats.p1TotalPoints}
            </span>
            <span className="text-gray-400">-</span>
            <span className="text-2xl font-bold text-blue-600">
              {stats.p2TotalPoints}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 text-center">Найбільша перемога</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-green-600">
              +{stats.largestP1Win}
            </span>
            <span className="text-gray-400">-</span>
            <span className="text-2xl font-bold text-green-600">
              +{stats.largestP2Win}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 text-center">Матчів зіграно</div>
          <div className="text-2xl font-bold text-purple-600 text-center">
            {stats.total}
          </div>
        </div>
      </div>

      {/* Match List */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Історія матчів
        </h3>
        <div className="space-y-3">
          {sortedMatches.map((match) => {
            const isPlayer1Left = match.player1Id === player1.id;
            const leftScore = isPlayer1Left ? match.player1Score : match.player2Score;
            const rightScore = isPlayer1Left ? match.player2Score : match.player1Score;
            const leftWon = match.winnerId === player1.id;
            const rightWon = match.winnerId === player2.id;
            const isExpanded = expandedMatchId === match.id;

            return (
              <div 
                key={match.id}
                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all border border-gray-200"
              >
                <button
                  onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                  className="w-full px-4 py-4 flex items-center gap-4"
                >
                  {/* Date */}
                  <div className="text-sm text-gray-600 w-32">
                    {match.date.toLocaleDateString('uk-UA', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Score */}
                  <div className="flex-1 flex items-center justify-center gap-4">
                    <div className={`text-right flex-1 ${leftWon ? 'font-bold' : ''}`}>
                      <span className={leftWon ? band1.textColor : 'text-gray-600'}>
                        {player1.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm min-w-[100px] justify-center">
                      <span className={`text-xl font-bold ${leftWon ? band1.textColor : 'text-gray-500'}`}>
                        {leftScore}
                      </span>
                      <span className="text-gray-400">:</span>
                      <span className={`text-xl font-bold ${rightWon ? band2.textColor : 'text-gray-500'}`}>
                        {rightScore}
                      </span>
                    </div>
                    <div className={`text-left flex-1 ${rightWon ? 'font-bold' : ''}`}>
                      <span className={rightWon ? band2.textColor : 'text-gray-600'}>
                        {player2.name}
                      </span>
                    </div>
                  </div>

                  {/* Tournament badge */}
                  {match.tournament && (
                    <div className="hidden md:block">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {match.tournament}
                      </span>
                    </div>
                  )}

                  {/* Expand icon */}
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-white">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Деталі матчу</h4>
                        <div className="space-y-2 text-sm">
                          {match.tournament && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Турнір:</span>
                              <span className="font-medium">{match.tournament}</span>
                            </div>
                          )}
                          {match.stage && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Стадія:</span>
                              <span className="font-medium">{match.stage}</span>
                            </div>
                          )}
                          {match.discipline && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Дисципліна:</span>
                              <span className="font-medium">{match.discipline}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">До:</span>
                            <span className="font-medium">{match.maxScore} очок</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Зміна рейтингу</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">{player1.name}:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">
                                {isPlayer1Left ? match.player1RatingBefore : match.player2RatingBefore}
                              </span>
                              <span className={`font-bold ${
                                (isPlayer1Left ? match.player1RatingChange : match.player2RatingChange) > 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {(isPlayer1Left ? match.player1RatingChange : match.player2RatingChange) > 0 ? '+' : ''}
                                {isPlayer1Left ? match.player1RatingChange : match.player2RatingChange}
                              </span>
                              <span className={`font-bold ${band1.textColor}`}>
                                {isPlayer1Left ? match.player1RatingAfter : match.player2RatingAfter}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">{player2.name}:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">
                                {isPlayer1Left ? match.player2RatingBefore : match.player1RatingBefore}
                              </span>
                              <span className={`font-bold ${
                                (isPlayer1Left ? match.player2RatingChange : match.player1RatingChange) > 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {(isPlayer1Left ? match.player2RatingChange : match.player1RatingChange) > 0 ? '+' : ''}
                                {isPlayer1Left ? match.player2RatingChange : match.player1RatingChange}
                              </span>
                              <span className={`font-bold ${band2.textColor}`}>
                                {isPlayer1Left ? match.player2RatingAfter : match.player1RatingAfter}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

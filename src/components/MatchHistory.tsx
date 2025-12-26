'use client';

import React from 'react';
import Link from 'next/link';
import { Match, Player } from '@/types';
import { getRatingBand } from '@/utils/rating';

interface MatchHistoryProps {
  matches: Match[];
  players: Player[];
  playerId?: string; // If provided, highlights matches for specific player
  limit?: number;
  disableSorting?: boolean; // If true, doesn't sort matches (uses provided order)
}

export default function MatchHistory({ matches, players, playerId, limit, disableSorting = false }: MatchHistoryProps) {
  const getPlayerById = (id: string) => players.find(p => p.id === id);
  
  // Sort matches by date (newest first), then by sequenceIndex descending (for matches on same date, newest processing first)
  const sortedMatches = disableSorting ? matches : [...matches].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    // If dates are the same, sort by sequenceIndex descending (so most recent processing appears first)
    return (b.sequenceIndex ?? -Infinity) - (a.sequenceIndex ?? -Infinity);
  });

  // Apply limit if provided
  const displayedMatches = limit ? sortedMatches.slice(0, limit) : sortedMatches;

  if (displayedMatches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Матчів поки немає</h3>
        <p className="mt-1 text-gray-500">Історія матчів з'явиться після першої гри</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedMatches.map((match) => {
        const player1 = getPlayerById(match.player1Id);
        const player2 = getPlayerById(match.player2Id);
        
        if (!player1 || !player2) return null;

        const winner = match.winnerId === player1.id ? player1 : player2;
        const loser = match.winnerId === player1.id ? player2 : player1;
        
        const player1IsTarget = playerId === player1.id;
        const player2IsTarget = playerId === player2.id;
        const isTargetPlayerMatch = player1IsTarget || player2IsTarget;

        return (
          <div 
            key={match.id}
            className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
              isTargetPlayerMatch 
                ? match.winnerId === playerId 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  {/* Player 1 */}
                  <div className={`flex-1 ${player1IsTarget ? 'font-semibold' : ''}`}>
                    <Link 
                      href={`/player/${player1.id}`}
                      className={`${getRatingBand(match.player1RatingBefore).textColor} hover:opacity-80 transition-colors`}
                    >
                      {player1.name}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={getRatingBand(match.player1RatingBefore).textColor}>
                        {match.player1RatingBefore}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={getRatingBand(match.player1RatingAfter).textColor}>
                        {match.player1RatingAfter}
                      </span>
                      <span className={`text-sm ${
                        match.player1RatingChange > 0 
                          ? 'text-green-600' 
                          : match.player1RatingChange < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        ({match.player1RatingChange > 0 ? '+' : ''}{match.player1RatingChange})
                      </span>
                      {/* Rank change notification for Player 1 */}
                      {getRatingBand(match.player1RatingBefore).name !== getRatingBand(match.player1RatingAfter).name && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getRatingBand(match.player1RatingAfter).color} text-white`}>
                          Нове звання: {getRatingBand(match.player1RatingAfter).name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {match.player1Score} : {match.player2Score}
                    </div>
                    <div className="text-xs text-gray-500">
                      до {match.maxScore}
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className={`flex-1 text-right ${player2IsTarget ? 'font-semibold' : ''}`}>
                    <Link 
                      href={`/player/${player2.id}`}
                      className={`${getRatingBand(match.player2RatingBefore).textColor} hover:opacity-80 transition-colors`}
                    >
                      {player2.name}
                    </Link>
                    <div className="flex items-center justify-end space-x-2 mt-1">
                      {/* Rank change notification for Player 2 */}
                      {getRatingBand(match.player2RatingBefore).name !== getRatingBand(match.player2RatingAfter).name && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getRatingBand(match.player2RatingAfter).color} text-white`}>
                          Нове звання: {getRatingBand(match.player2RatingAfter).name}
                        </span>
                      )}
                      <span className={`text-sm ${
                        match.player2RatingChange > 0 
                          ? 'text-green-600' 
                          : match.player2RatingChange < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        ({match.player2RatingChange > 0 ? '+' : ''}{match.player2RatingChange})
                      </span>
                      <span className={getRatingBand(match.player2RatingAfter).textColor}>
                        {match.player2RatingAfter}
                      </span>
                      <span className="text-gray-400">←</span>
                      <span className={getRatingBand(match.player2RatingBefore).textColor}>
                        {match.player2RatingBefore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Winner indicator and tournament/date/stage info */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Переможець:</span>
                      <Link 
                        href={`/player/${winner.id}`}
                        className={`${getRatingBand(match.winnerId === player1.id ? match.player1RatingAfter : match.player2RatingAfter).textColor} font-semibold hover:opacity-80 transition-colors`}
                      >
                        {winner.name}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                      {match.tournament && (
                        <div className="text-xs text-gray-600">
                          📌 {match.tournament}
                        </div>
                      )}
                      {match.stage && (
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          match.stage === 'final' ? 'bg-yellow-100 text-yellow-800' :
                          match.stage === 'semifinal' ? 'bg-orange-100 text-orange-800' :
                          match.stage === 'quarterfinal' ? 'bg-purple-100 text-purple-800' :
                          match.stage === 'round16' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {match.stage === 'final' ? '🏆 Фінал' :
                           match.stage === 'semifinal' ? '🥈 Півфінал' :
                           match.stage === 'quarterfinal' ? '🥉 Чвертьфінал' :
                           match.stage === 'round16' ? '⚔️ 1/8' :
                           `📍 ${match.stage}`}
                          {match.matchWeight && match.matchWeight > 1.0 && ` ×${match.matchWeight.toFixed(1)}`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {new Date(match.date).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

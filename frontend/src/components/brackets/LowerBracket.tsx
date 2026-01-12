/**
 * LowerBracket Component - PHASE 5
 * Displays Lower Bracket (Losers Bracket) for Double Elimination
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { TournamentMatch } from '@/types';

interface LowerBracketProps {
  matches: TournamentMatch[];
  tournamentId: number;
}

interface BracketRound {
  name: string;
  matches: TournamentMatch[];
}

export default function LowerBracket({ matches, tournamentId }: LowerBracketProps) {
  const rounds = groupMatchesByRound(matches);
  
  if (rounds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Немає матчів Lower Bracket
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-center mb-6 text-orange-600">
        🥉 Lower Bracket (Losers)
      </h2>
      
      <div className="text-sm text-gray-600 text-center mb-4">
        Друга жизнь для переможених в Upper Bracket
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {rounds.map((round) => (
            <div key={round.name} className="flex flex-col">
              <div className="text-center mb-4">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-semibold">
                  {round.name}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {round.matches.map((match) => (
                  <MatchCard key={match.id} match={match} tournamentId={tournamentId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, tournamentId }: { match: TournamentMatch; tournamentId: number }) {
  const isCompleted = match.status === 'finished';
  const winnerId = isCompleted && match.player1Score > match.player2Score 
    ? match.player1Id 
    : match.player2Id;
  
  return (
    <div className={`border rounded-lg p-3 min-w-[180px] ${
      isCompleted ? 'border-orange-300 bg-orange-50' : 'border-gray-300 bg-white'
    }`}>
      <div className="text-xs text-gray-500 mb-2 text-center">
        Матч #{match.matchNumber}
      </div>
      
      <div className={`flex justify-between items-center p-2 rounded mb-1 text-sm ${
        winnerId === match.player1Id ? 'bg-orange-100 border border-orange-300' : 'bg-gray-50'
      }`}>
        <div>
          {match.player1Id ? (
            <Link href={`/player/${match.player1Id}`} className="hover:underline">
              {match.player1Name}
            </Link>
          ) : (
            <span className="text-gray-400 italic text-xs">TBD</span>
          )}
        </div>
        <div className="font-bold text-sm">{isCompleted ? (match.player1Score || 0) : ''}</div>
      </div>
      
      <div className={`flex justify-between items-center p-2 rounded text-sm ${
        winnerId === match.player2Id ? 'bg-orange-100 border border-orange-300' : 'bg-gray-50'
      }`}>
        <div>
          {match.player2Id ? (
            <Link href={`/player/${match.player2Id}`} className="hover:underline">
              {match.player2Name}
            </Link>
          ) : (
            <span className="text-gray-400 italic text-xs">TBD</span>
          )}
        </div>
        <div className="font-bold text-sm">{isCompleted ? (match.player2Score || 0) : ''}</div>
      </div>
      
      <div className="text-xs text-center mt-2">
        {isCompleted ? (
          <span className="text-orange-600 font-medium">Завершено</span>
        ) : (
          <span className="text-gray-500">Очікує</span>
        )}
      </div>
      
      {!isCompleted && (
        <div className="text-xs text-red-600 text-center mt-1">
          Переможений вибуває
        </div>
      )}
    </div>
  );
}

function groupMatchesByRound(matches: TournamentMatch[]): BracketRound[] {
  const uniqueRounds = [...new Set(matches.map(m => m.round))].filter(r => r.startsWith('LB-'));
  
  uniqueRounds.sort((a, b) => {
    if (a === 'LB-F') return 1;
    if (b === 'LB-F') return -1;
    if (a === 'LB-SF') return 1;
    if (b === 'LB-SF') return -1;
    if (a === 'LB-QF') return 1;
    if (b === 'LB-QF') return -1;
    
    const aNum = parseInt(a.replace('LB-R', '')) || 0;
    const bNum = parseInt(b.replace('LB-R', '')) || 0;
    
    return aNum - bNum;
  });
  
  const rounds: BracketRound[] = [];
  
  for (const roundName of uniqueRounds) {
    const roundMatches = matches.filter(m => m.round === roundName);
    if (roundMatches.length > 0) {
      roundMatches.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
      rounds.push({ name: roundName, matches: roundMatches });
    }
  }
  
  return rounds;
}

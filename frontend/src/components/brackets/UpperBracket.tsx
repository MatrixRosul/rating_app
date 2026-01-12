/**
 * UpperBracket Component - PHASE 5
 * Displays Upper Bracket (Winners Bracket) for Double Elimination
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { TournamentMatch } from '@/types';

interface UpperBracketProps {
  matches: TournamentMatch[];
  tournamentId: number;
}

interface BracketRound {
  name: string;
  matches: TournamentMatch[];
}

export default function UpperBracket({ matches, tournamentId }: UpperBracketProps) {
  const rounds = groupMatchesByRound(matches);
  
  if (rounds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Немає матчів Upper Bracket
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-center mb-6 text-blue-600">
        🏆 Upper Bracket (Winners)
      </h2>
      
      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {rounds.map((round) => (
            <div key={round.name} className="flex flex-col">
              <div className="text-center mb-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold">
                  {round.name}
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
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
  const winnerId = match.winnerId;
  
  return (
    <div className={`border rounded-lg p-3 min-w-[200px] ${
      isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'
    }`}>
      <div className="text-xs text-gray-500 mb-2 text-center">
        Матч #{match.matchNumber}
      </div>
      
      <div className={`flex justify-between items-center p-2 rounded mb-1 ${
        winnerId === match.player1Id ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
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
        <div className="font-bold">{isCompleted ? (match.player1Score || 0) : ''}</div>
      </div>
      
      <div className={`flex justify-between items-center p-2 rounded ${
        winnerId === match.player2Id ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
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
        <div className="font-bold">{isCompleted ? (match.player2Score || 0) : ''}</div>
      </div>
      
      <div className="text-xs text-center mt-2">
        {isCompleted ? (
          <span className="text-green-600 font-medium">Завершено</span>
        ) : (
          <span className="text-gray-500">Очікує</span>
        )}
      </div>
    </div>
  );
}

function groupMatchesByRound(matches: TournamentMatch[]): BracketRound[] {
  const upperRounds = ['WB-R64', 'WB-R32', 'WB-R16', 'WB-QF', 'WB-SF', 'WB-F'];
  const rounds: BracketRound[] = [];
  
  for (const roundName of upperRounds) {
    const roundMatches = matches.filter(m => m.round === roundName);
    if (roundMatches.length > 0) {
      roundMatches.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
      rounds.push({ name: roundName, matches: roundMatches });
    }
  }
  
  return rounds;
}

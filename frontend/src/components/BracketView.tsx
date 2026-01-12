'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getRatingColor } from '@/utils/rating';
import { TournamentMatch } from '@/types';

// Import new bracket components
import UpperBracket from './brackets/UpperBracket';
import LowerBracket from './brackets/LowerBracket';
import GroupStage from './brackets/GroupStage';
import DrawNet from './brackets/DrawNet';

interface BracketMatch {
  match_id: number;
  match_number: number;
  player1: {
    id: number | null;
    name: string;
    rating: number | null;
  };
  player2: {
    id: number | null;
    name: string;
    rating: number | null;
  };
  winner: {
    id: number | null;
    name: string | null;
  } | null;
  score: string;
  status: string;
  is_wo: boolean;
  next_match_id: number | null;
}

interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

interface BracketData {
  rounds: BracketRound[];
  total_matches: number;
}

interface BracketViewProps {
  bracket?: BracketData;
  matches?: TournamentMatch[];
  tournamentId?: number;
  bracketType?: string;
}

const getRoundLabel = (roundName: string): string => {
  const labels: Record<string, string> = {
    'F': 'Фінал',
    'SF': 'Півфінали',
    'QF': 'Чвертьфінали',
    'R16': '1/16 фіналу',
    'R32': '1/32 фіналу',
    'R64': '1/64 фіналу',
  };
  return labels[roundName] || roundName;
};

const getStatusBadge = (status: string, isWO: boolean) => {
  if (isWO) {
    return <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">WO</span>;
  }
  
  const badges: Record<string, string> = {
    'pending': 'bg-gray-200 text-gray-700',
    'in_progress': 'bg-blue-500 text-white',
    'finished': 'bg-green-500 text-white',
    'wo': 'bg-gray-400 text-white',
  };
  
  const labels: Record<string, string> = {
    'pending': 'Очікує',
    'in_progress': 'Триває',
    'finished': 'Завершено',
    'wo': 'WO',
  };
  
  return (
    <span className={`px-2 py-1 text-xs rounded ${badges[status] || badges.pending}`}>
      {labels[status] || status}
    </span>
  );
};

export default function BracketView({ bracket, matches, tournamentId, bracketType }: BracketViewProps) {
  // PHASE 5: Detect bracket type and render appropriate component
  
  // If we have new matches data with bracket type, use new components
  if (matches && tournamentId && bracketType) {
    return (
      <div className="space-y-6">
        {renderBracketByType(matches, tournamentId, bracketType)}
      </div>
    );
  }
  
  // If we have matches but no explicit bracket type, try to detect
  if (matches && tournamentId) {
    const detectedType = detectBracketType(matches);
    return (
      <div className="space-y-6">
        {renderBracketByType(matches, tournamentId, detectedType)}
      </div>
    );
  }
  
  // Fallback to old bracket format (Single Elimination)
  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Сітка ще не згенерована</p>
        <p className="text-sm mt-2">Запустіть турнір щоб створити сітку</p>
      </div>
    );
  }

  return renderLegacySingleElimination(bracket);
}

function renderBracketByType(matches: TournamentMatch[], tournamentId: number, bracketType: string) {
  // Use DrawNet component (custom bracket display like GoGoSport)
  switch (bracketType) {
    case 'double_elimination':
      return <DrawNet matches={matches} tournamentId={tournamentId} bracketType="double_elimination" />;
    
    case 'group_stage':
      return renderGroupStage(matches, tournamentId);
    
    case 'single_elimination':
    default:
      return <DrawNet matches={matches} tournamentId={tournamentId} bracketType="single_elimination" />;
  }
}

function renderDoubleElimination(matches: TournamentMatch[], tournamentId: number) {
  // Separate Upper and Lower Bracket matches
  const upperMatches = matches.filter(m => 
    m.round.startsWith('WB-') || m.round === 'GF' || m.round === 'GF-RESET'
  );
  const lowerMatches = matches.filter(m => 
    m.round.startsWith('LB-')
  );
  
  return (
    <div className="space-y-6">
      {/* Upper Bracket */}
      <UpperBracket matches={upperMatches} tournamentId={tournamentId} />
      
      {/* Lower Bracket */}
      <LowerBracket matches={lowerMatches} tournamentId={tournamentId} />
      
      {/* Grand Final section */}
      {renderGrandFinal(matches, tournamentId)}
    </div>
  );
}

function renderGroupStage(matches: TournamentMatch[], tournamentId: number) {
  return <GroupStage matches={matches} tournamentId={tournamentId} />;
}

function renderSingleEliminationFromMatches(matches: TournamentMatch[], tournamentId: number) {
  // Convert matches to legacy bracket format for Single Elimination
  const rounds = groupMatchesByRounds(matches);
  
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <strong>🏆 Single Elimination</strong>
        </div>
        <div className="text-sm text-blue-800">
          <strong>Всього матчів:</strong> {matches.length}
        </div>
        <div className="text-sm text-blue-800">
          <strong>Раундів:</strong> {rounds.length}
        </div>
      </div>
      
      {rounds.map((round) => (
        <SingleEliminationRound key={round.name} round={round} tournamentId={tournamentId} />
      ))}
    </div>
  );
}

function renderGrandFinal(matches: TournamentMatch[], tournamentId: number) {
  const gfMatch = matches.find(m => m.round === 'GF');
  const gfResetMatch = matches.find(m => m.round === 'GF-RESET');
  
  if (!gfMatch) return null;
  
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-yellow-800">
        🏆 GRAND FINAL
      </h2>
      
      <div className="max-w-md mx-auto">
        <GrandFinalMatch match={gfMatch} tournamentId={tournamentId} />
        
        {gfResetMatch && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-center mb-4 text-red-800">
              🔥 GRAND FINAL RESET
            </h3>
            <GrandFinalMatch match={gfResetMatch} tournamentId={tournamentId} />
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-gray-600 mt-4">
        {gfResetMatch ? 
          "Переможець Lower Bracket переміг в першому GF. Грають знову 0-0!" :
          "WB переможець vs LB переможець"}
      </div>
    </div>
  );
}

function detectBracketType(matches: TournamentMatch[]): string {
  // Auto-detect bracket type from matches
  const roundNames = new Set(matches.map(m => m.round));
  
  if (Array.from(roundNames).some(name => name.startsWith('Group'))) {
    return 'group_stage';
  }
  
  if (Array.from(roundNames).some(name => name.startsWith('WB-')) && 
      Array.from(roundNames).some(name => name.startsWith('LB-'))) {
    return 'double_elimination';
  }
  
  return 'single_elimination';
}

function renderLegacySingleElimination(bracket: BracketData) {
  // Original Single Elimination rendering logic
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <strong>Всього матчів:</strong> {bracket.total_matches}
        </div>
        <div className="text-sm text-blue-800">
          <strong>Раундів:</strong> {bracket.rounds.length}
        </div>
      </div>

      {/* Rounds */}
      {bracket.rounds.map((round) => (
        <div key={round.name} className="border-t-4 border-gray-300 pt-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded">
              {round.name}
            </span>
            <span className="text-gray-600">{getRoundLabel(round.name)}</span>
            <span className="text-sm text-gray-500">({round.matches.length} матчів)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {round.matches.map((match) => (
              <div
                key={match.match_id}
                className={`border rounded-lg p-4 ${
                  match.winner
                    ? 'bg-green-50 border-green-300'
                    : match.is_wo
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Match header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Матч #{match.match_number}
                  </span>
                  {getStatusBadge(match.status, match.is_wo)}
                </div>

                {/* Players */}
                <div className="space-y-2">
                  {/* Player 1 */}
                  {match.player1.id ? (
                    <Link
                      href={`/player/${match.player1.id}`}
                      className={`block p-2 rounded ${
                        match.winner?.id === match.player1.id
                          ? 'bg-green-200 font-bold'
                          : 'bg-gray-100'
                      } hover:bg-gray-200 transition`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={getRatingColor(match.player1.rating || 0)}>
                          {match.player1.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {match.player1.rating?.toFixed(0)}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="p-2 rounded bg-gray-100">
                      <span className="text-gray-400 italic">BYE</span>
                    </div>
                  )}

                  {/* VS or Score */}
                  <div className="text-center text-sm font-bold text-gray-500">
                    {match.status === 'finished' || match.is_wo ? match.score : 'VS'}
                  </div>

                  {/* Player 2 */}
                  {match.player2.id ? (
                    <Link
                      href={`/player/${match.player2.id}`}
                      className={`block p-2 rounded ${
                        match.winner?.id === match.player2.id
                          ? 'bg-green-200 font-bold'
                          : 'bg-gray-100'
                      } hover:bg-gray-200 transition`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={getRatingColor(match.player2.rating || 0)}>
                          {match.player2.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {match.player2.rating?.toFixed(0)}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="p-2 rounded bg-gray-100">
                      <span className="text-gray-400 italic">BYE</span>
                    </div>
                  )}
                </div>

                {/* Winner */}
                {match.winner && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="text-xs text-gray-600">Переможець:</div>
                    <div className="font-bold text-green-700">{match.winner.name}</div>
                  </div>
                )}

                {/* WO notice */}
                {match.is_wo && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="text-xs text-gray-600 italic">
                      Технічна перемога (Walk Over)
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper components for new bracket types
function SingleEliminationRound({ round, tournamentId }: { round: any; tournamentId: number }) {
  return (
    <div className="border-t-4 border-blue-300 pt-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white px-3 py-1 rounded">
          {round.name}
        </span>
        <span className="text-gray-600">{getRoundLabel(round.name)}</span>
        <span className="text-sm text-gray-500">({round.matches.length} матчів)</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {round.matches.map((match: TournamentMatch) => (
          <SingleEliminationMatch key={match.id} match={match} tournamentId={tournamentId} />
        ))}
      </div>
    </div>
  );
}

function SingleEliminationMatch({ match, tournamentId }: { match: TournamentMatch; tournamentId: number }) {
  const isCompleted = match.status === 'finished';
  const isWO = (match.status as string) === 'wo';
  const winnerId = match.winnerId || null;

  return (
    <div className={`border rounded-lg p-4 ${
      winnerId ? 'bg-green-50 border-green-300' : isWO ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
    }`}>
      {/* Match header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-600">
          Матч #{match.matchNumber || match.id}
        </span>
        {getStatusBadge(match.status, isWO)}
      </div>

      {/* Players */}
      <div className="space-y-2">
        {/* Player 1 */}
        {match.player1Id ? (
          <Link
            href={`/player/${match.player1Id}`}
            className={`block p-2 rounded ${
              winnerId === match.player1Id ? 'bg-green-200 font-bold' : 'bg-gray-100'
            } hover:bg-gray-200 transition`}
          >
            <div className="flex justify-between items-center">
              <span className={getRatingColor(0)}>
                {match.player1Name}
              </span>
              <span className="text-sm text-gray-600">
                {/* Rating not available in TournamentMatch */}
              </span>
            </div>
          </Link>
        ) : (
          <div className="p-2 rounded bg-gray-100">
            <span className="text-gray-400 italic">BYE</span>
          </div>
        )}

        {/* VS or Score */}
        <div className="text-center text-sm font-bold text-gray-500">
          {isCompleted ? `${match.player1Score} : ${match.player2Score}` : 'VS'}
        </div>

        {/* Player 2 */}
        {match.player2Id ? (
          <Link
            href={`/player/${match.player2Id}`}
            className={`block p-2 rounded ${
              winnerId === match.player2Id ? 'bg-green-200 font-bold' : 'bg-gray-100'
            } hover:bg-gray-200 transition`}
          >
            <div className="flex justify-between items-center">
              <span className={getRatingColor(0)}>
                {match.player2Name}
              </span>
              <span className="text-sm text-gray-600">
                {/* Rating not available in TournamentMatch */}
              </span>
            </div>
          </Link>
        ) : (
          <div className="p-2 rounded bg-gray-100">
            <span className="text-gray-400 italic">BYE</span>
          </div>
        )}
      </div>

      {/* Winner */}
      {winnerId && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="text-xs text-gray-600">Переможець:</div>
          <div className="font-bold text-green-700">
            {winnerId === match.player1Id ? match.player1Name : match.player2Name}
          </div>
        </div>
      )}
    </div>
  );
}

function GrandFinalMatch({ match, tournamentId }: { match: TournamentMatch; tournamentId: number }) {
  return <SingleEliminationMatch match={match} tournamentId={tournamentId} />;
}

function groupMatchesByRounds(matches: TournamentMatch[]) {
  const roundMap = new Map<string, TournamentMatch[]>();
  
  matches.forEach(match => {
    const roundName = match.round;
    if (!roundMap.has(roundName)) {
      roundMap.set(roundName, []);
    }
    roundMap.get(roundName)!.push(match);
  });
  
  const rounds: { name: string; matches: TournamentMatch[] }[] = [];
  
  // Sort rounds by elimination order
  const sortedRounds = Array.from(roundMap.keys()).sort((a, b) => {
    const order = ['R64', 'R32', 'R16', 'QF', 'SF', 'F'];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    return a.localeCompare(b);
  });
  
  sortedRounds.forEach(roundName => {
    const roundMatches = roundMap.get(roundName)!;
    roundMatches.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
    rounds.push({
      name: roundName,
      matches: roundMatches
    });
  });
  
  return rounds;
}

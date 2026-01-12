/**
 * DrawNet Component - Tournament Bracket Display
 * Styled like GoGoSport's tournament draw
 * ID: draw_net
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { TournamentMatch } from '@/types';

interface DrawNetProps {
  matches: TournamentMatch[];
  tournamentId: number;
  bracketType?: 'single_elimination' | 'double_elimination' | 'group_stage';
}

// Round order for proper column display
// Billiard format: First Round → Upper (Olympic) → Lower (for losers from upper)
const UPPER_ROUNDS_ORDER = ['R1', 'QF', 'SF', 'F'];  // Перший тур → Олімпійка
const SINGLE_ROUNDS_ORDER = ['R64', 'R32', 'R16', 'QF', 'SF', 'F'];
const LOWER_ROUNDS_ORDER = ['LB-R1', 'LB-R2', 'LB-R3', 'LB-SF'];  // Нижня сітка

// Round name translations
const ROUND_LABELS: Record<string, string> = {
  // Single Elimination
  'R64': 'Round of 64',
  'R32': 'Round of 32',
  'R16': 'Last 16',
  'QF': '1/4 фіналу',
  'SF': 'Півфінал',
  'F': 'Фінал',
  // Billiard Double Elimination - First Round
  'R1': 'Перший тур',
  // Lower Bracket (Нижня сітка)
  'LB-R1': 'Нижня сітка, тур 1',
  'LB-R2': 'Нижня сітка, тур 2',
  'LB-R3': 'Нижня сітка, тур 3',
  'LB-SF': 'Нижня сітка, ПФ',
  // Old format (backward compatibility)
  'WB-R64': 'Верхня, R64',
  'WB-R32': 'Верхня, R32',
  'WB-R16': 'Верхня, R16',
  'WB-QF': 'Quarter-final',
  'WB-SF': 'Semi-final',
  'WB-F': 'Winners Final',
  'LB-R4': 'Losers, round 4',
  'LB-R5': 'Losers, round 5',
  'LB-R6': 'Losers, round 6',
  'LB-QF': 'Losers QF',
  'LB-F': 'Losers Final',
  'GF': 'Grand Final',
  'GF-RESET': 'Grand Final Reset',
};

export default function DrawNet({ matches, tournamentId, bracketType = 'single_elimination' }: DrawNetProps) {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Сітка ще не згенерована</p>
        <p className="text-sm mt-2">Запустіть турнір щоб створити сітку</p>
      </div>
    );
  }

  if (bracketType === 'double_elimination') {
    return <DoubleEliminationDraw matches={matches} tournamentId={tournamentId} />;
  }

  return <SingleEliminationDraw matches={matches} tournamentId={tournamentId} />;
}

// ============ SINGLE ELIMINATION ============
function SingleEliminationDraw({ matches, tournamentId }: { matches: TournamentMatch[]; tournamentId: number }) {
  const rounds = groupMatchesByRoundOrder(matches, SINGLE_ROUNDS_ORDER);

  return (
    <div id="draw_net" className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold">Tournament Bracket</h2>
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Bracket Grid */}
      <div className="overflow-x-auto p-4">
        <div className="flex gap-1 min-w-max">
          {rounds.map((round, roundIndex) => (
            <RoundColumn
              key={round.name}
              round={round}
              roundIndex={roundIndex}
              totalRounds={rounds.length}
              isLast={roundIndex === rounds.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ DOUBLE ELIMINATION (BILLIARD FORMAT) ============
function DoubleEliminationDraw({ matches, tournamentId }: { matches: TournamentMatch[]; tournamentId: number }) {
  // Billiard format: R1 (перший тур) → QF/SF/F (олімпійка) and LB-R1/R2/R3/SF (нижня сітка)
  
  // First round (everyone plays)
  const firstRoundMatches = matches.filter(m => m.round === 'R1');
  
  // Upper bracket (Olympic): QF, SF, F
  const upperMatches = matches.filter(m => 
    m.round === 'QF' || m.round === 'SF' || m.round === 'F' ||
    m.round?.startsWith('WB-')  // Backward compatibility
  );
  
  // Lower bracket: LB-R1, LB-R2, LB-R3, LB-SF
  const lowerMatches = matches.filter(m => m.round?.startsWith('LB-'));
  
  // Grand Final (old format compatibility)
  const grandFinalMatches = matches.filter(m => m.round === 'GF' || m.round === 'GF-RESET');

  const firstRounds = firstRoundMatches.length > 0 
    ? [{ name: 'R1', matches: firstRoundMatches }]
    : [];
  const upperRounds = groupMatchesByRoundOrder(upperMatches, UPPER_ROUNDS_ORDER);
  const lowerRounds = groupMatchesByRoundOrder(lowerMatches, LOWER_ROUNDS_ORDER);

  return (
    <div id="draw_net" className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold">Турнірна сітка (2 вибування)</h2>
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto p-4">
        {/* Перший тур (if exists) */}
        {firstRounds.length > 0 && (
          <div className="mb-8">
            <div className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Перший тур
            </div>
            <div className="flex gap-1 min-w-max">
              {firstRounds.map((round, roundIndex) => (
                <RoundColumn
                  key={round.name}
                  round={round}
                  roundIndex={roundIndex}
                  totalRounds={firstRounds.length}
                  isLast={roundIndex === firstRounds.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Олімпійка (Upper Bracket) */}
        {upperRounds.length > 0 && (
          <div className="mb-8">
            <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Олімпійка (Верхня сітка)
            </div>
            <div className="flex gap-1 min-w-max">
              {upperRounds.map((round, roundIndex) => (
                <RoundColumn
                  key={round.name}
                  round={round}
                  roundIndex={roundIndex}
                  totalRounds={upperRounds.length}
                  isLast={roundIndex === upperRounds.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grand Final (old format) */}
        {grandFinalMatches.length > 0 && (
          <div className="mb-8">
            <div className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Grand Final
            </div>
            <div className="flex gap-4">
              {grandFinalMatches.map(match => (
                <MatchCard key={match.id} match={match} showRoundLabel />
              ))}
            </div>
          </div>
        )}

        {/* Нижня сітка (Lower Bracket) */}
        {lowerRounds.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              Нижня сітка
            </div>
            <div className="flex gap-1 min-w-max">
              {lowerRounds.map((round, roundIndex) => (
                <RoundColumn
                  key={round.name}
                  round={round}
                  roundIndex={roundIndex}
                  totalRounds={lowerRounds.length}
                  isLast={roundIndex === lowerRounds.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ COMPONENTS ============

interface RoundColumnProps {
  round: { name: string; matches: TournamentMatch[] };
  roundIndex: number;
  totalRounds: number;
  isLast: boolean;
}

function RoundColumn({ round, roundIndex, totalRounds, isLast }: RoundColumnProps) {
  const matchHeight = 80; // Height of each match card
  const connectorWidth = 30; // Width of connector lines
  
  // Calculate vertical spacing based on round - each round doubles the spacing
  const baseGap = 16;
  const verticalGap = baseGap * Math.pow(2, roundIndex);
  const topMargin = roundIndex > 0 ? (verticalGap / 2 + matchHeight / 2) : 0;

  return (
    <div className="relative flex flex-col" style={{ minWidth: '240px', marginRight: isLast ? 0 : connectorWidth }}>
      {/* Round Header */}
      <div className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2 mb-4 sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
        {ROUND_LABELS[round.name] || round.name}
      </div>

      {/* Matches with spacing */}
      <div 
        className="relative flex flex-col"
        style={{ 
          gap: `${verticalGap}px`,
          marginTop: `${topMargin}px`
        }}
      >
        {round.matches.map((match, matchIndex) => (
          <div key={match.id} className="relative" style={{ height: `${matchHeight}px` }}>
            <MatchCard match={match} />
            
            {/* Bracket connector lines */}
            {!isLast && (
              <>
                {/* Horizontal line extending to the right */}
                <div 
                  className="absolute bg-gray-600"
                  style={{
                    top: `${matchHeight / 2}px`,
                    left: '100%',
                    width: `${connectorWidth / 2}px`,
                    height: '2px',
                  }}
                />
                
                {/* Vertical line connecting pairs of matches */}
                {matchIndex % 2 === 0 && matchIndex + 1 < round.matches.length && (
                  <>
                    <div 
                      className="absolute bg-gray-600"
                      style={{
                        top: `${matchHeight / 2}px`,
                        left: `calc(100% + ${connectorWidth / 2}px)`,
                        width: '2px',
                        height: `${verticalGap + matchHeight}px`,
                      }}
                    />
                    {/* Horizontal line to next round */}
                    <div 
                      className="absolute bg-gray-600"
                      style={{
                        top: `${matchHeight / 2 + (verticalGap + matchHeight) / 2}px`,
                        left: `calc(100% + ${connectorWidth / 2}px)`,
                        width: `${connectorWidth / 2}px`,
                        height: '2px',
                      }}
                    />
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: TournamentMatch;
  showRoundLabel?: boolean;
}

function MatchCard({ match, showRoundLabel = false }: MatchCardProps) {
  const isFinished = match.status === 'finished';
  const isInProgress = match.status === 'in_progress';
  const isWO = (match.status as string) === 'wo';
  const winnerId = match.winnerId;

  // Determine score display
  const score1 = match.player1Score ?? 0;
  const score2 = match.player2Score ?? 0;

  return (
    <div className={`
      h-full rounded border transition-all duration-200
      ${isInProgress ? 'border-blue-500 bg-blue-900/20' : 
        isFinished ? 'border-gray-600 bg-gray-800/50' : 
        'border-gray-700 bg-gray-800/30'}
      hover:border-gray-500
    `}>
      {showRoundLabel && (
        <div className="text-[10px] text-gray-400 px-2 py-0.5 border-b border-gray-700 text-center">
          {ROUND_LABELS[match.round || ''] || match.round}
        </div>
      )}
      
      {/* Match Number and Status */}
      <div className="text-[10px] text-gray-500 px-2 pt-1 pb-0.5 flex justify-between items-center border-b border-gray-700/50">
        <span className="font-mono">M{match.matchNumber}</span>
        {isInProgress && <span className="text-blue-400 animate-pulse text-[9px]">●LIVE</span>}
      </div>

      {/* Player 1 */}
      <PlayerRow
        playerId={match.player1Id ?? null}
        playerName={match.player1Name ?? null}
        score={score1}
        isWinner={winnerId === match.player1Id}
        isFinished={isFinished || isWO}
      />

      {/* Divider */}
      <div className="border-t border-gray-700/30 mx-2" />

      {/* Player 2 */}
      <PlayerRow
        playerId={match.player2Id ?? null}
        playerName={match.player2Name ?? null}
        score={score2}
        isWinner={winnerId === match.player2Id}
        isFinished={isFinished || isWO}
      />
    </div>
  );
}

interface PlayerRowProps {
  playerId: number | null;
  playerName: string | null;
  score: number;
  isWinner: boolean;
  isFinished: boolean;
}

function PlayerRow({ playerId, playerName, score, isWinner, isFinished }: PlayerRowProps) {
  const displayName = playerName || 'TBD';
  const isEmpty = !playerId;

  return (
    <div className={`
      flex items-center justify-between px-2 py-1
      ${isWinner ? 'bg-green-900/30' : ''}
      ${isEmpty ? 'opacity-50' : ''}
    `}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {isWinner && (
          <span className="text-green-400 text-[10px]">▶</span>
        )}
        {playerId ? (
          <Link 
            href={`/player/${playerId}`}
            className={`
              text-xs truncate hover:underline
              ${isWinner ? 'text-green-300 font-semibold' : 'text-gray-300'}
            `}
            title={displayName}
          >
            {displayName}
          </Link>
        ) : (
          <span className="text-xs text-gray-500 italic">{displayName}</span>
        )}
      </div>
      
      {isFinished && (
        <span className={`
          text-xs font-mono ml-1.5 min-w-[20px] text-right
          ${isWinner ? 'text-green-300 font-bold' : 'text-gray-500'}
        `}>
          {score}
        </span>
      )}
    </div>
  );
}

// ============ HELPERS ============

function groupMatchesByRoundOrder(
  matches: TournamentMatch[], 
  roundOrder: string[]
): { name: string; matches: TournamentMatch[] }[] {
  const rounds: { name: string; matches: TournamentMatch[] }[] = [];

  for (const roundName of roundOrder) {
    const roundMatches = matches.filter(m => m.round === roundName);
    if (roundMatches.length > 0) {
      // Sort by match number
      roundMatches.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
      rounds.push({ name: roundName, matches: roundMatches });
    }
  }

  return rounds;
}

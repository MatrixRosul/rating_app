/**
 * BracketSVG Component
 * Uses react-tournament-brackets library for bracket visualization
 * Styled with dark theme like GoGoSport
 */
'use client';

import React, { useEffect, useState } from 'react';
import {
  SingleEliminationBracket,
  DoubleEliminationBracket,
  Match,
  SVGViewer,
  createTheme,
} from 'react-tournament-brackets';
import { TournamentMatch } from '@/types';

interface BracketSVGProps {
  matches: TournamentMatch[];
  bracketType: 'single_elimination' | 'double_elimination';
  tournamentId: number;
}

// Round name translations for display
const ROUND_LABELS: Record<string, string> = {
  'R64': '1/64 фіналу',
  'R32': '1/32 фіналу',
  'R16': '1/16 фіналу',
  'QF': 'Чвертьфінал',
  'SF': 'Півфінал',
  'F': 'Фінал',
  'WB-R64': 'WB 1/64',
  'WB-R32': 'WB 1/32',
  'WB-R16': 'WB 1/16',
  'WB-QF': 'WB Чвертьфінал',
  'WB-SF': 'WB Півфінал',
  'WB-F': 'WB Фінал',
  'LB-R1': 'LB Раунд 1',
  'LB-R2': 'LB Раунд 2',
  'LB-R3': 'LB Раунд 3',
  'LB-R4': 'LB Раунд 4',
  'LB-R5': 'LB Раунд 5',
  'LB-R6': 'LB Раунд 6',
  'LB-QF': 'LB Чвертьфінал',
  'LB-SF': 'LB Півфінал',
  'LB-F': 'LB Фінал',
  'GF': 'Гранд Фінал',
  'GF-RESET': 'Гранд Фінал 2',
};

// Dark theme similar to GoGoSport
const GlootTheme = createTheme({
  textColor: { main: '#FFFFFF', highlighted: '#10B981', dark: '#9CA3AF' },
  matchBackground: { wonColor: '#1F2937', lostColor: '#111827' },
  score: {
    background: { wonColor: '#10B981', lostColor: '#374151' },
    text: { highlightedWonColor: '#FFFFFF', highlightedLostColor: '#9CA3AF' },
  },
  border: {
    color: '#374151',
    highlightedColor: '#10B981',
  },
  roundHeaders: { background: '#1F2937', fontColor: '#FFFFFF' },
  connectorColor: '#4B5563',
  connectorColorHighlight: '#10B981',
  svgBackground: '#111827',
});

// Style options
const styleOptions = {
  style: {
    roundHeader: {
      backgroundColor: '#1F2937',
      fontColor: '#FFFFFF',
    },
    connectorColor: '#4B5563',
    connectorColorHighlight: '#10B981',
  },
};

// Convert match to library format
function convertMatch(match: TournamentMatch, allMatches: TournamentMatch[]) {
  const isFinished = match.status === 'finished';
  
  const participants = [];
  
  if (match.player1Id || match.player1Name) {
    participants.push({
      id: match.player1Id ? String(match.player1Id) : 'tbd1',
      name: match.player1Name || 'TBD',
      isWinner: isFinished && match.winnerId === match.player1Id,
      status: isFinished ? 'PLAYED' as const : null,
      resultText: isFinished ? String(match.player1Score) : null,
    });
  }
  
  if (match.player2Id || match.player2Name) {
    participants.push({
      id: match.player2Id ? String(match.player2Id) : 'tbd2',
      name: match.player2Name || 'TBD',
      isWinner: isFinished && match.winnerId === match.player2Id,
      status: isFinished ? 'PLAYED' as const : null,
      resultText: isFinished ? String(match.player2Score) : null,
    });
  }

  // Ensure we always have 2 participants
  while (participants.length < 2) {
    participants.push({
      id: `empty-${participants.length}`,
      name: 'TBD',
      isWinner: false,
      status: null,
      resultText: null,
    });
  }

  return {
    id: match.id,
    name: `Match ${match.matchNumber}`,
    nextMatchId: match.nextMatchId ?? null,
    tournamentRoundText: ROUND_LABELS[match.round] || match.round,
    startTime: match.date || '',
    state: match.status === 'finished' ? 'DONE' : 'PENDING',
    participants,
  };
}

// Convert matches to single elimination format
function convertToSingleElimination(matches: TournamentMatch[]) {
  return matches.map(m => convertMatch(m, matches));
}

// Convert matches to double elimination format
function convertToDoubleElimination(matches: TournamentMatch[]) {
  const upperMatches = matches.filter(m => 
    m.round?.startsWith('WB-') || 
    m.round === 'GF' || 
    m.round === 'GF-RESET'
  );
  
  const lowerMatches = matches.filter(m => 
    m.round?.startsWith('LB-')
  );

  return {
    upper: upperMatches.map(m => convertMatch(m, matches)),
    lower: lowerMatches.map(m => convertMatch(m, matches)),
  };
}

// Hook for window size
function useWindowSize() {
  const [size, setSize] = useState([1200, 600]);

  useEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

// Custom Match component with links to players
const CustomMatch = ({
  match,
  onMatchClick,
  onPartyClick,
  onMouseEnter,
  onMouseLeave,
  topParty,
  bottomParty,
  topWon,
  bottomWon,
  topHovered,
  bottomHovered,
  topText,
  bottomText,
  connectorColor,
  computedStyles,
  teamNameFallback,
  resultFallback,
}: any) => {
  const getPlayerStyle = (isWinner: boolean, isHovered: boolean) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: isHovered ? '#374151' : isWinner ? '#1F2937' : '#111827',
    borderLeft: isWinner ? '3px solid #10B981' : '3px solid transparent',
    transition: 'all 0.2s ease',
    cursor: topParty?.id && !topParty.id.startsWith('empty') && !topParty.id.startsWith('tbd') ? 'pointer' : 'default',
  });

  const getNameStyle = (isWinner: boolean) => ({
    color: isWinner ? '#10B981' : '#FFFFFF',
    fontWeight: isWinner ? 600 : 400,
    fontSize: '13px',
    maxWidth: '130px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    textDecoration: 'none',
  });

  const getScoreStyle = (isWinner: boolean) => ({
    color: isWinner ? '#10B981' : '#9CA3AF',
    fontWeight: 700,
    fontSize: '13px',
    minWidth: '20px',
    textAlign: 'right' as const,
  });

  const isValidPlayer = (party: any) => 
    party?.id && 
    !party.id.startsWith('empty') && 
    !party.id.startsWith('tbd') &&
    party.name !== 'TBD';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #374151',
        backgroundColor: '#111827',
      }}
    >
      {/* Top Player */}
      <div
        onMouseEnter={() => onMouseEnter(topParty?.id)}
        onMouseLeave={onMouseLeave}
        style={getPlayerStyle(topWon, topHovered)}
      >
        {isValidPlayer(topParty) ? (
          <a
            href={`/player/${topParty.id}`}
            style={getNameStyle(topWon)}
          >
            {topParty.name}
          </a>
        ) : (
          <span style={{ color: '#6B7280', fontStyle: 'italic', fontSize: '13px' }}>
            {topParty?.name || 'TBD'}
          </span>
        )}
        <span style={getScoreStyle(topWon)}>
          {topParty?.resultText ?? ''}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#374151' }} />

      {/* Bottom Player */}
      <div
        onMouseEnter={() => onMouseEnter(bottomParty?.id)}
        onMouseLeave={onMouseLeave}
        style={getPlayerStyle(bottomWon, bottomHovered)}
      >
        {isValidPlayer(bottomParty) ? (
          <a
            href={`/player/${bottomParty.id}`}
            style={getNameStyle(bottomWon)}
          >
            {bottomParty.name}
          </a>
        ) : (
          <span style={{ color: '#6B7280', fontStyle: 'italic', fontSize: '13px' }}>
            {bottomParty?.name || 'TBD'}
          </span>
        )}
        <span style={getScoreStyle(bottomWon)}>
          {bottomParty?.resultText ?? ''}
        </span>
      </div>
    </div>
  );
};

export default function BracketSVG({ matches, bracketType, tournamentId }: BracketSVGProps) {
  const [width, height] = useWindowSize();
  
  // Calculate SVG dimensions
  const svgWidth = Math.max(width - 100, 800);
  const svgHeight = Math.max(height - 200, 500);

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 text-center">
        <p className="text-gray-400 text-lg">Сітка ще не згенерована</p>
        <p className="text-gray-500 text-sm mt-2">Запустіть турнір щоб створити сітку</p>
      </div>
    );
  }

  // Convert matches to library format
  if (bracketType === 'double_elimination') {
    const bracketData = convertToDoubleElimination(matches);
    
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Double Elimination Bracket</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-400">Winners Bracket</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-400">Losers Bracket</span>
            </span>
          </div>
        </div>
        
        {/* Bracket */}
        <div className="p-4">
          <DoubleEliminationBracket
            matches={bracketData}
            matchComponent={CustomMatch}
            theme={GlootTheme}
            options={styleOptions}
            svgWrapper={({ children, ...props }) => (
              <SVGViewer
                width={svgWidth}
                height={svgHeight}
                background="#111827"
                SVGBackground="#111827"
                {...props}
              >
                {children}
              </SVGViewer>
            )}
          />
        </div>
      </div>
    );
  }

  // Single Elimination
  const bracketData = convertToSingleElimination(matches);
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <h2 className="text-white text-lg font-semibold">Tournament Bracket</h2>
      </div>
      
      {/* Bracket */}
      <div className="p-4">
        <SingleEliminationBracket
          matches={bracketData}
          matchComponent={CustomMatch}
          theme={GlootTheme}
          options={styleOptions}
          svgWrapper={({ children, ...props }) => (
            <SVGViewer
              width={svgWidth}
              height={svgHeight}
              background="#111827"
              SVGBackground="#111827"
              {...props}
            >
              {children}
            </SVGViewer>
          )}
        />
      </div>
    </div>
  );
}

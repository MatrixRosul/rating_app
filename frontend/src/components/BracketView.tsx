'use client';

import Link from 'next/link';
import { getRatingColor } from '@/utils/rating';

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
  bracket: BracketData;
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

export default function BracketView({ bracket }: BracketViewProps) {
  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Сітка ще не згенерована</p>
        <p className="text-sm mt-2">Запустіть турнір щоб створити сітку</p>
      </div>
    );
  }

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

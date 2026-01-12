'use client';

import { useState, useMemo } from 'react';
import { TournamentMatch, Table } from '@/types';

interface MatchListProps {
  matches: TournamentMatch[];
  tables: Table[];
  isAdmin: boolean;
  onStartMatch: (match: TournamentMatch) => void;
  onFinishMatch: (match: TournamentMatch) => void;
  onEditMatch: (match: TournamentMatch) => void;
  onViewDetails: (match: TournamentMatch) => void;
  onUpdateLiveScore: (match: TournamentMatch) => void;
}

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'finished';
type SortBy = 'match_number' | 'round' | 'status';

export default function MatchList({
  matches,
  tables,
  isAdmin,
  onStartMatch,
  onFinishMatch,
  onEditMatch,
  onViewDetails,
  onUpdateLiveScore,
}: MatchListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('match_number');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered and sorted matches
  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(m => m.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.player1Name?.toLowerCase().includes(query) ||
        m.player2Name?.toLowerCase().includes(query) ||
        m.round.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'match_number') {
        return a.matchNumber - b.matchNumber;
      } else if (sortBy === 'round') {
        return a.round.localeCompare(b.round);
      } else {
        return a.status.localeCompare(b.status);
      }
    });

    return result;
  }, [matches, filterStatus, sortBy, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Очікує</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 animate-pulse">В процесі</span>;
      case 'finished':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Завершено</span>;
      default:
        return null;
    }
  };

  const getRoundName = (round: string) => {
    const roundNames: Record<string, string> = {
      'final': 'Фінал',
      'semifinal': 'Півфінал',
      'quarterfinal': 'Чвертьфінал',
      'round_16': '1/8 фіналу',
      'round_32': '1/16 фіналу',
      'round_64': '1/32 фіналу',
    };
    return roundNames[round] || round;
  };

  const getTableName = (tableId?: number) => {
    if (!tableId) return '-';
    const table = tables.find(t => t.id === tableId);
    return table?.name || `Стіл ${tableId}`;
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Пошук по гравцям або раунду..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">Всі статуси</option>
          <option value="pending">Очікують</option>
          <option value="in_progress">В процесі</option>
          <option value="finished">Завершені</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="match_number">По номеру</option>
          <option value="round">По раунду</option>
          <option value="status">По статусу</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Всього</p>
          <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-700">Очікують</p>
          <p className="text-2xl font-bold text-yellow-900">
            {matches.filter(m => m.status === 'pending').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">В процесі</p>
          <p className="text-2xl font-bold text-blue-900">
            {matches.filter(m => m.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">Завершені</p>
          <p className="text-2xl font-bold text-green-900">
            {matches.filter(m => m.status === 'finished').length}
          </p>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-2">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Матчів не знайдено</p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Status Icon */}
                <div className="flex-shrink-0 mr-4">
                  {match.status === 'pending' && (
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  )}
                  {match.status === 'in_progress' && (
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                  )}
                  {match.status === 'finished' && (
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  )}
                </div>

                {/* Match Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Матч #{match.matchNumber}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {getRoundName(match.round)}
                    </span>
                    {getStatusBadge(match.status)}
                  </div>

                  {/* Players */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${match.winnerId === match.player1Id ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {match.player1Name || 'TBD'}
                      </span>
                      {(match.status === 'finished' || match.status === 'in_progress') && (
                        <span className={`text-lg font-bold ${
                          match.status === 'in_progress' ? 'text-orange-600' : 'text-gray-700'
                        }`}>{match.player1Score || 0}</span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">vs</div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${match.winnerId === match.player2Id ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {match.player2Name || 'TBD'}
                      </span>
                      {(match.status === 'finished' || match.status === 'in_progress') && (
                        <span className={`text-lg font-bold ${
                          match.status === 'in_progress' ? 'text-orange-600' : 'text-gray-700'
                        }`}>{match.player2Score || 0}</span>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    {match.tableId && (
                      <span>📍 {getTableName(match.tableId)}</span>
                    )}
                    {match.videoUrl && (
                      <a
                        href={match.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:underline"
                      >
                        🎥 Відео
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    {match.status === 'pending' && match.player1Id && match.player2Id && (
                      <button
                        onClick={() => onStartMatch(match)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      >
                        Запустити
                      </button>
                    )}
                    
                    {match.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => onUpdateLiveScore(match)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          Рахунок
                        </button>
                        <button
                          onClick={() => onFinishMatch(match)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Завершити
                        </button>
                      </>
                    )}
                    
                    {match.status === 'finished' && (
                      <>
                        <button
                          onClick={() => onViewDetails(match)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Деталі
                        </button>
                        <button
                          onClick={() => onEditMatch(match)}
                          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                        >
                          Редагувати
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

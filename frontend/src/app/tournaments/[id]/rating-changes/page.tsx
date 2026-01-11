'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface RatingChangeItem {
  player_id: number;
  player_name: string;
  rating_before: number;
  rating_after: number | null;
  rating_change: number | null;
  place: number | null;
}

interface TournamentRatingChanges {
  tournament_id: number;
  tournament_name: string;
  status: string;
  changes: RatingChangeItem[];
}

export default function RatingChangesPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [data, setData] = useState<TournamentRatingChanges | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRatingChanges();
  }, [tournamentId]);

  const fetchRatingChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/rating-changes`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rating changes');
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err: any) {
      setError(err.message || 'Failed to load rating changes');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-600 font-bold';
    if (rating >= 2300) return 'text-orange-600 font-bold';
    if (rating >= 2100) return 'text-orange-500 font-bold';
    if (rating >= 1900) return 'text-purple-600 font-semibold';
    if (rating >= 1600) return 'text-blue-600 font-semibold';
    if (rating >= 1400) return 'text-cyan-600';
    if (rating >= 1200) return 'text-green-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Завантаження змін рейтингу...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      </div>
    );
  }

  if (!data || data.changes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          Зміни рейтингу ще не доступні
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalPlayers = data.changes.length;
  const gainers = data.changes.filter(c => c.rating_change && c.rating_change > 0).length;
  const losers = data.changes.filter(c => c.rating_change && c.rating_change < 0).length;
  const biggestGain = Math.max(...data.changes.map(c => c.rating_change || 0));
  const biggestLoss = Math.min(...data.changes.map(c => c.rating_change || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Зміни рейтингу</h2>
        <p className="text-gray-600 mt-1">{data.tournament_name}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-900">Всього гравців</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{totalPlayers}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="text-sm font-medium text-green-900">Рейтинг виріс</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{gainers}</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
          <div className="text-sm font-medium text-red-900">Рейтинг впав</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{losers}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-900">Найбільша зміна</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {biggestGain > Math.abs(biggestLoss) ? `+${biggestGain}` : biggestLoss}
          </div>
        </div>
      </div>

      {/* Rating Changes Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Гравець
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Місце
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Рейтинг до
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Рейтинг після
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Зміна
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.changes.map((item, index) => {
              const changePercent = item.rating_change && item.rating_before > 0
                ? ((item.rating_change / item.rating_before) * 100).toFixed(1)
                : null;

              return (
                <tr 
                  key={item.player_id}
                  className={`hover:bg-blue-50/50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {/* Player Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/player/${item.player_id}`}
                      className={`text-sm font-medium hover:underline transition ${getRatingColor(item.rating_after || item.rating_before)}`}
                    >
                      {item.player_name}
                    </Link>
                  </td>

                  {/* Place */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-600">
                      {item.place ? `${item.place} місце` : '-'}
                    </span>
                  </td>

                  {/* Rating Before */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm ${getRatingColor(item.rating_before)}`}>
                      {item.rating_before}
                    </span>
                  </td>

                  {/* Rating After */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.rating_after !== null ? (
                      <span className={`text-sm ${getRatingColor(item.rating_after)}`}>
                        {item.rating_after}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Rating Change */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.rating_change !== null ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        item.rating_change > 0 
                          ? 'bg-green-100 text-green-800' 
                          : item.rating_change < 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.rating_change > 0 ? '+' : ''}{item.rating_change}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Percent Change */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {changePercent ? (
                      <span className={`text-xs font-medium ${
                        item.rating_change && item.rating_change > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {item.rating_change && item.rating_change > 0 ? '+' : ''}{changePercent}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Легенда кольорів рейтингу:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">0-1199:</span>
            <span className="text-gray-600 font-medium">Новачок</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">1200-1399:</span>
            <span className="text-green-600 font-medium">Учень</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-600">1400-1599:</span>
            <span className="text-cyan-600 font-medium">Спеціаліст</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">1600-1899:</span>
            <span className="text-blue-600 font-semibold">Експерт</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">1900-2099:</span>
            <span className="text-purple-600 font-semibold">Кандидат у майстри</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500">2100-2299:</span>
            <span className="text-orange-500 font-bold">Майстер</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-600">2300-2399:</span>
            <span className="text-orange-600 font-bold">Міжнародний майстер</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600">2400+:</span>
            <span className="text-red-600 font-bold">Гросмейстер</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface ResultItem {
  player_id: number;
  player_name: string;
  place: number | null;
  rating_before: number;
  rating_after: number | null;
  rating_change: number | null;
  seed: number;
}

interface TournamentResults {
  tournament_id: number;
  tournament_name: string;
  status: string;
  results: ResultItem[];
}

export default function ResultsPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [results, setResults] = useState<TournamentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchResults();
  }, [tournamentId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/results`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (place: number | null) => {
    if (!place) return '';
    if (place === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (place === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    if (place === 3 || place === 4) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  const getMedalIcon = (place: number | null) => {
    if (!place) return null;
    if (place === 1) return '🥇';
    if (place === 2) return '🥈';
    if (place === 3 || place === 4) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Завантаження результатів...</span>
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

  if (!results || results.results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          Результати ще не доступні
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Результати турніру</h2>
        <p className="text-gray-600 mt-1">{results.tournament_name}</p>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Місце
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Гравець
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Посів
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.results.map((result, index) => (
              <tr 
                key={result.player_id}
                className={`hover:bg-blue-50/50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                {/* Place */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold shadow-md ${getMedalColor(result.place)}`}>
                      {getMedalIcon(result.place) || result.place || '-'}
                    </span>
                  </div>
                </td>

                {/* Player Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    href={`/player/${result.player_id}`}
                    className={`text-sm font-medium hover:underline transition ${getRatingColor(result.rating_after || result.rating_before)}`}
                  >
                    {result.player_name}
                  </Link>
                </td>

                {/* Seed */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-gray-600">#{result.seed}</span>
                </td>

                {/* Rating Before */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-medium text-gray-900">{result.rating_before}</span>
                </td>

                {/* Rating After */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {result.rating_after !== null ? result.rating_after : '-'}
                  </span>
                </td>

                {/* Rating Change */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.rating_change !== null ? (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${
                      result.rating_change > 0 
                        ? 'bg-green-100 text-green-800' 
                        : result.rating_change < 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {result.rating_change > 0 ? '+' : ''}{result.rating_change}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-900">Всього учасників</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{results.results.length}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="text-sm font-medium text-green-900">Переможець</div>
          <div className="text-lg font-bold mt-1">
            {results.results.find(r => r.place === 1)?.player_id ? (
              <Link 
                href={`/player/${results.results.find(r => r.place === 1)?.player_id}`}
                className={`hover:underline ${getRatingColor(results.results.find(r => r.place === 1)?.rating_after || results.results.find(r => r.place === 1)?.rating_before || 0)}`}
              >
                {results.results.find(r => r.place === 1)?.player_name}
              </Link>
            ) : '-'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-900">Статус</div>
          <div className="text-lg font-bold text-purple-600 mt-1 capitalize">{results.status}</div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Leaderboard from '@/components/Leaderboard';
import { useState, useEffect } from 'react';
import { Player } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function RatingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/players/`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert snake_case to camelCase for frontend
      const playersData = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        firstName: p.first_name,
        lastName: p.last_name,
        city: p.city,
        yearOfBirth: p.year_of_birth,
        rating: p.rating,
        initialRating: p.initial_rating,
        peakRating: p.peak_rating,
        isCMS: p.is_cms,
        matches: [], // Not needed for leaderboard
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at || p.created_at),
        matchesCount: p.matches_played || 0
      }));
      
      setPlayers(playersData);
    } catch (err: any) {
      console.error('Error fetching players:', err);
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('Failed to fetch');
      const errorMessage = isNetworkError 
        ? 'Backend API недоступний. Запустіть backend сервер на порту 8000.'
        : err.message || 'Помилка завантаження даних';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100/50 p-8 flex items-center space-x-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Завантаження рейтингу...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-100/50 p-8 text-center max-w-md">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full animate-pulse"></div>
            </div>
            <svg className="relative mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">Помилка завантаження</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPlayers}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">Спробувати знову</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Leaderboard players={players} />
      </main>

      <footer className="relative bg-white/50 backdrop-blur-sm border-t border-blue-100/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">© 2026 Рейтингова система для гравців у більярд</p>
            <p className="text-xs mt-2 text-gray-600">
              Система базується на алгоритмі ELO з кольоровою схемою Codeforces
            </p>
            <p className="text-xs mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
              Розробник: Максим Росул
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

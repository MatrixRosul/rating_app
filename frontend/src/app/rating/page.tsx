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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Помилка завантаження</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPlayers}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Leaderboard players={players} />
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2025 Рейтингова система для гравців у більярд</p>
            <p className="text-xs mt-1">
              Рейтингова система базується на алгоритмі ELO з кольоровою схемою як у Codeforces. Росул Максим.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

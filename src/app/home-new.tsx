'use client';

import { useApp } from '@/context/AppContext';
import Leaderboard from '@/components/Leaderboard';
import MatchSimulator from '@/components/MatchSimulator';
import { useState } from 'react';

export default function Home() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'simulator'>('leaderboard');

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Помилка завантаження</h2>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
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
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              🎱 Рейтинг Більярду
            </h1>
            
            {/* Navigation tabs */}
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Рейтинг
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'simulator'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Матчі
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'leaderboard' && <Leaderboard players={state.players} />}
        {activeTab === 'simulator' && <MatchSimulator />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>© 2024 Рейтингова система для гравців у більярд</p>
            <p className="text-sm mt-2">
              Рейтингова система базується на алгоритмі ELO з кольоровою схемою як у Codeforces
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

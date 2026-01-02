'use client';

import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import Leaderboard from '@/components/Leaderboard';
import MatchSimulator from '@/components/MatchSimulator';
import LoginModal from '@/components/LoginModal';
import { useState, useEffect } from 'react';

export default function Home() {
  const { state } = useApp();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'simulator' | 'tournaments'>('leaderboard');
  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || state.loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-bold text-gray-900">
                Рейтинг Більярду
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4 justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg">Завантаження...</span>
          </div>
        </main>
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
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">
              🎱 Рейтинг Більярду
            </h1>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-2 sm:space-x-4">
                <button
                  onClick={() => setActiveTab('tournaments')}
                  className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'tournaments'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Турніри
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'leaderboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Рейтинг
                </button>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'simulator'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Матчі
                </button>
              </nav>
              
              {/* Auth Section */}
              <div className="border-l border-gray-300 pl-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{user?.username}</div>
                      <div className="text-xs text-gray-500">
                        {isAdmin() ? '👑 Admin' : '👤 User'}
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                    >
                      Вийти
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  >
                    Увійти
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'leaderboard' && <Leaderboard players={state.players} matches={state.matches} />}
        {activeTab === 'simulator' && <MatchSimulator />}
        {activeTab === 'tournaments' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4">
              <span className="text-6xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Турніри</h2>
            <p className="text-lg text-gray-600">
              Проведення турнірів ще в розробці
            </p>
          </div>
        )}
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
      
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

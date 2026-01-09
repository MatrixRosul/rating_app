'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import LoginModal from './LoginModal';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition"
              onClick={() => router.push('/')}
            >
              Рейтинг Більярду
            </h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-2 sm:space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                    pathname === '/'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Головна
                </button>
                <button
                  onClick={() => router.push('/rating')}
                  className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                    pathname === '/rating'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Рейтинг
                </button>
                <button
                  onClick={() => router.push('/tournaments')}
                  className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                    pathname?.startsWith('/tournaments')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Турніри
                </button>
              </nav>
              
              {/* Auth Section */}
              <div className="border-l border-gray-300 pl-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{user?.username}</div>
                      <div className="text-xs text-gray-500">
                        {isAdmin() ? 'Admin' : 'User'}
                      </div>
                    </div>
                    {user?.playerId && (
                      <button
                        onClick={() => router.push(`/player/${user.playerId}`)}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        Профіль
                      </button>
                    )}
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Відкрити меню"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  router.push('/');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Головна
              </button>
              <button
                onClick={() => {
                  router.push('/rating');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
                  pathname === '/rating'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Рейтинг
              </button>
              <button
                onClick={() => {
                  router.push('/tournaments');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
                  pathname?.startsWith('/tournaments')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Турніри
              </button>
              
              {/* Mobile Auth Section */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-gray-50 rounded-md">
                      <div className="font-medium text-gray-900">{user?.username}</div>
                      <div className="text-xs text-gray-500">
                        {isAdmin() ? 'Admin' : 'User'}
                      </div>
                    </div>
                    {user?.playerId && (
                      <button
                        onClick={() => {
                          router.push(`/player/${user.playerId}`);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                      >
                        Профіль
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors"
                    >
                      Вийти
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  >
                    Увійти
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

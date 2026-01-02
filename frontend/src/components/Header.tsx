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
              🎱 Рейтинг Більярду
            </h1>
            
            <div className="flex items-center space-x-4">
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

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

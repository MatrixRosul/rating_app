'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎱 Рейтингова Система Більярду
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Професійна система відстеження рейтингу та статистики гравців у більярд
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/rating')}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              Переглянути Рейтинг
            </button>
            <button
              onClick={() => router.push('/tournaments')}
              className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
            >
              Турніри
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Рейтингова Система</h3>
            <p className="text-gray-600">
              Система базується на алгоритмі ELO з кольоровою схемою як у Codeforces. 
              Від Newbie до Grandmaster - кожен рівень має свій колір та престиж.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Турніри</h3>
            <p className="text-gray-600">
              Організація та участь у турнірах. Адміністратори можуть створювати турніри, 
              а гравці - реєструватися та змагатися за перше місце.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">Статистика</h3>
            <p className="text-gray-600">
              Детальна статистика кожного гравця: win rate, історія матчів, 
              графік зміни рейтингу, найкращі та найгірші результати.
            </p>
          </div>
        </div>

        {/* Rating Bands */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Рейтингові Ранги</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-500 text-white rounded font-medium">Newbie</span>
                <span className="text-gray-700">0 - 1199</span>
              </div>
              <span className="text-sm text-gray-500">Початківець</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-medium">Pupil</span>
                <span className="text-gray-700">1200 - 1399</span>
              </div>
              <span className="text-sm text-gray-500">Учень</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-cyan-500 text-white rounded font-medium">Specialist</span>
                <span className="text-gray-700">1400 - 1599</span>
              </div>
              <span className="text-sm text-gray-500">Спеціаліст</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500 text-white rounded font-medium">Expert</span>
                <span className="text-gray-700">1600 - 1799</span>
              </div>
              <span className="text-sm text-gray-500">Експерт</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-500 text-white rounded font-medium">Candidate Master</span>
                <span className="text-gray-700">1800 - 2299</span>
              </div>
              <span className="text-sm text-gray-500">Кандидат у Майстри</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-500 text-white rounded font-medium">Master</span>
                <span className="text-gray-700">2300 - 2499</span>
              </div>
              <span className="text-sm text-gray-500">Майстер</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-red-500 text-white rounded font-medium">Grandmaster</span>
                <span className="text-gray-700">2500+</span>
              </div>
              <span className="text-sm text-gray-500">Гросмейстер</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6">Про Проект</h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Рейтингова система для гравців у більярд - це сучасний веб-додаток для відстеження 
              результатів матчів та автоматичного розрахунку рейтингу гравців.
            </p>
            <p className="mb-4">
              <strong>Технології:</strong> Next.js 15, React, TypeScript, Python FastAPI, PostgreSQL
            </p>
            <p className="mb-4">
              <strong>Алгоритм рейтингу:</strong> Адаптована ELO-система з врахуванням рівня гравців, 
              формату матчу та етапу турніру. Кольорова схема рангів взята з платформи Codeforces.
            </p>
            <p>
              <strong>Автор:</strong> Росул Максим © 2025
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2025 Рейтингова система для гравців у більярд</p>
            <p className="text-xs mt-1">
              Рейтингова система базується на алгоритмі ELO з кольоровою схемою як у Codeforces
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

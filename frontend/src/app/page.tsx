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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-full border border-blue-200/50">
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Професійна рейтингова платформа
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Рейтингова Система
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Більярду
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Відстежуйте рейтинг, змагайтеся у турнірах та досягайте нових висот у більярдному спорті
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <button
              onClick={() => router.push('/rating')}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Переглянути Рейтинг</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button
              onClick={() => router.push('/tournaments')}
              className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-blue-600 font-semibold rounded-2xl hover:bg-white transition-all duration-300 border-2 border-blue-600/30 hover:border-blue-600 hover:shadow-xl hover:scale-105"
            >
              Турніри
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-blue-600">Рейтингова Система</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Система базується на алгоритмі ELO. 
              Від Newbie до Grandmaster - кожен рівень має свій колір та престиж.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-blue-600">Турніри</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Організація та участь у турнірах. Адміністратори можуть створювати турніри, 
              а гравці - реєструватися та змагатися за перше місце.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 sm:col-span-2 md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-blue-600">Статистика</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Детальна статистика кожного гравця: win rate, історія матчів, 
              графік зміни рейтингу, найкращі та найгірші результати.
            </p>
          </div>
        </div>

        {/* Rating Bands */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Рейтингові Ранги</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-gray-500 text-white rounded font-medium text-sm sm:text-base">Новачок</span>
                <span className="text-gray-700 text-sm sm:text-base">0 - 1199</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Початківець</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded font-medium text-sm sm:text-base">Учень</span>
                <span className="text-gray-700 text-sm sm:text-base">1200 - 1399</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Базовий рівень</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-cyan-500 text-white rounded font-medium text-sm sm:text-base">Спеціаліст</span>
                <span className="text-gray-700 text-sm sm:text-base">1400 - 1599</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Середній рівень</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded font-medium text-sm sm:text-base">Експерт</span>
                <span className="text-gray-700 text-sm sm:text-base">1600 - 1799</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Просунутий рівень</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-purple-500 text-white rounded font-medium text-sm sm:text-base whitespace-nowrap">Кандидат у Майстри</span>
                <span className="text-gray-700 text-sm sm:text-base">1800 - 2299</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Високий рівень</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-orange-500 text-white rounded font-medium text-sm sm:text-base">Майстер</span>
                <span className="text-gray-700 text-sm sm:text-base">2300 - 2499</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Майстерський рівень</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded font-medium text-sm sm:text-base">Гросмейстер</span>
                <span className="text-gray-700 text-sm sm:text-base">2500+</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Елітний рівень</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Як працює рейтингова система?</h2>
          <div className="prose max-w-none text-gray-700 text-sm sm:text-base">
            <p className="mb-3 sm:mb-4">
              Система автоматично розраховує рейтинг кожного гравця після матчу на основі адаптованого алгоритму ELO. 
              Чим вищий рейтинг суперника, тим більше балів ви отримаєте за перемогу.
            </p>
            <p className="mb-3 sm:mb-4">
              <strong>Початковий рейтинг:</strong> Нові гравці стартують з рейтингу 1300 балів. 
              Кандидати у Майстри Спорту (КМС) починають з рейтингу 1600 балів.
            </p>
            <p className="mb-3 sm:mb-4">
              <strong>Звання та досягнення:</strong> Залежно від набраного рейтингу гравець отримує звання 
              від Newbie (початківець) до Grandmaster (гросмейстер). Кожне звання відображається унікальним кольором.
            </p>
            <p className="mb-3 sm:mb-4">
              <strong>Турнірні матчі:</strong> Результати на різних етапах турніру (група, плей-оф, півфінал, фінал) 
              мають різну вагу при розрахунку рейтингу. Перемога у фіналі дає більше балів.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="text-xs sm:text-sm">Розробник: Максим Росул</p>
            <p className="text-xs mt-1">© 2026 Рейтингова система для гравців у більярд</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Рейтингова Система Більярду
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
            Професійна система відстеження рейтингу та статистики гравців у більярд
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <button
              onClick={() => router.push('/rating')}
              className="px-6 sm:px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              Переглянути Рейтинг
            </button>
            <button
              onClick={() => router.push('/tournaments')}
              className="px-6 sm:px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
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

'use client';

import React, { useState, useMemo } from 'react';
import { Player } from '@/types';
import { sortPlayersByRating, getRatingBand } from '@/utils/rating';
import PlayerCard from './PlayerCard';

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [showCMSOnly, setShowCMSOnly] = useState(false);
  const [showPeakRating, setShowPeakRating] = useState(false);
  const [sortDescending, setSortDescending] = useState(true);
  
  // Use peakRating from backend, no need to calculate
  const playersWithPeakRating = useMemo(() => {
    return players.map(player => ({
      ...player,
      peakRating: player.peakRating || player.rating
    }));
  }, [players]);
  
  // Sort players by current or peak rating
  const sortedPlayers = useMemo(() => {
    let filtered = playersWithPeakRating;
    
    // Фільтр по КМС
    if (showCMSOnly) {
      filtered = filtered.filter(p => p.isCMS);
    }
    
    // Сортування за піковим або поточним рейтингом
    if (showPeakRating) {
      return [...filtered].sort((a, b) => b.peakRating - a.peakRating);
    } else {
      return sortPlayersByRating(filtered);
    }
  }, [playersWithPeakRating, showCMSOnly, showPeakRating]);
  
  // Apply sort order based on toggle
  const orderedPlayers = sortDescending ? sortedPlayers : [...sortedPlayers].reverse();
  
  // Filter players based on search term and rating
  const filteredPlayers = orderedPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedRating === 'all') {
      return matchesSearch;
    }
    
    const ratingBand = getRatingBand(player.rating);
    return matchesSearch && ratingBand.name === selectedRating;
  });

  const ratingBands = [
    'all', 'Новачок', 'Учень', 'Спеціаліст', 'Експерт', 
    'Кандидат у Майстри', 'Майстер', 'Міжнародний Майстер', 'Гросмейстер'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-full border border-blue-200/50">
          <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Офіційний рейтинг
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">
          <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Рейтинг гравців
          </span>
        </h1>
        <p className="text-lg text-gray-600">
          Всього гравців: <span className="font-bold text-blue-600">{players.length}</span>
        </p>
      </div>

      {/* Filters */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 sm:p-6">
        {/* Decorative gradient */}
        <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
              Пошук гравця
            </label>
            <input
              type="text"
              id="search"
              placeholder="Введіть ім'я гравця..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-gray-300"
            />
          </div>

          {/* Filters (peak/cms) */}
          <div className="lg:w-64">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Фільтри
            </label>
            <div className="flex gap-2 h-12">
              <button
                onClick={() => setShowPeakRating(!showPeakRating)}
                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-300 ${
                  showPeakRating
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/50 scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
                title="Показати піковий рейтинг"
              >
                Пік
              </button>
              <button
                onClick={() => setShowCMSOnly(!showCMSOnly)}
                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-300 ${
                  showCMSOnly
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-transparent shadow-lg shadow-amber-500/50 scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                }`}
                title="Показати тільки КМС"
              >
                КМС
              </button>
            </div>
          </div>

          {/* Sort toggle */}
          <div className="lg:w-36">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Порядок
            </label>
            <button
              onClick={() => setSortDescending(!sortDescending)}
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 font-semibold"
            >
              {sortDescending ? '↓ Спадання' : '↑ Зростання'}
            </button>
          </div>

          {/* Rating filter */}
          <div className="lg:w-64">
            <label htmlFor="rating" className="block text-sm font-semibold text-gray-700 mb-2">
              Рейтинг
            </label>
            <select
              id="rating"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-700 transition-all duration-300 hover:border-gray-300"
            >
              {ratingBands.map(band => (
                <option key={band} value={band}>
                  {band === 'all' ? 'Всі рейтинги' : band}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">
              Знайдено: <span className="font-bold text-blue-600">{filteredPlayers.length}</span> з <span className="font-bold">{players.length}</span> гравців
            </div>
            {filteredPlayers.length !== players.length && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRating('all');
                  setShowCMSOnly(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Скинути фільтри
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Player list */}
      <div className="space-y-3">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              rank={sortedPlayers.findIndex(p => p.id === player.id) + 1}
              showRank={true}
              showPeakRating={showPeakRating}
            />
          ))
        ) : (
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 opacity-50 rounded-2xl"></div>
            <div className="relative">
              <div className="inline-block mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gray-200 rounded-full blur-xl animate-pulse"></div>
                  <svg className="relative h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Гравців не знайдено</h3>
              <p className="text-gray-600 mb-4">Спробуйте змінити критерії пошуку</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRating('all');
                  setShowCMSOnly(false);
                }}
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Скинути всі фільтри
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

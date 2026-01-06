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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Рейтинг гравців у більярд
        </h1>
        <p className="text-gray-600">
          Всього гравців: {players.length}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Пошук гравця
            </label>
            <input
              type="text"
              id="search"
              placeholder="Введіть ім'я гравця..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Filters (peak/cms) */}
          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фільтри
            </label>
            <div className="flex gap-2 h-10">
              <button
                onClick={() => setShowPeakRating(!showPeakRating)}
                className={`flex-1 px-2 py-2 text-xs sm:text-sm rounded-md border transition-colors ${
                  showPeakRating
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Показати піковий рейтинг"
              >
                Пік
              </button>
              <button
                onClick={() => setShowCMSOnly(!showCMSOnly)}
                className={`flex-1 px-2 py-2 text-xs sm:text-sm rounded-md border transition-colors ${
                  showCMSOnly
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Показати тільки КМС"
              >
                КМС
              </button>
            </div>
          </div>

          {/* Sort toggle */}
          <div className="md:w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Порядок
            </label>
            <button
              onClick={() => setSortDescending(!sortDescending)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <span className="text-sm font-medium">
                {sortDescending ? '↓ Спадання' : '↑ Зростання'}
              </span>
            </button>
          </div>

          {/* Rating filter */}
          <div className="md:w-64">
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Рейтинг
            </label>
            <select
              id="rating"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="mt-2 text-sm text-gray-600">
          Знайдено: {filteredPlayers.length} з {players.length} гравців
        </div>
      </div>

      {/* Player list */}
      <div className="space-y-2">
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
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium">Гравців не знайдено</h3>
              <p className="mt-1">Спробуйте змінити критерії пошуку</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

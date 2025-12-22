'use client';

import React, { useState } from 'react';
import { Player } from '@/types';
import { sortPlayersByRating, getRatingBand } from '@/utils/rating';
import PlayerCard from './PlayerCard';

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortDescending, setSortDescending] = useState(true); // true = високий→низький, false = низький→високий
  
  const sortedPlayers = sortPlayersByRating(players);
  
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
    'all', 'Newbie', 'Pupil', 'Specialist', 'Expert', 
    'Candidate Master', 'Master', 'International Master', 'Grandmaster'
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

          {/* Sort toggle */}
          <div className="md:w-16">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сортування
            </label>
            <button
              onClick={() => setSortDescending(!sortDescending)}
              className={`w-full h-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center ${
                sortDescending 
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
              title={sortDescending ? 'Сортування: від високого до низького' : 'Сортування: від низького до високого'}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {sortDescending ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                )}
              </svg>
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

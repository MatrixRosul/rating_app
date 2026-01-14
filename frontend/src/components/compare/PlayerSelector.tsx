'use client';

import { useState, useMemo } from 'react';
import type { Player } from '@/types';
import { getRatingBand } from '@/utils/rating';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayer: Player | null;
  onSelect: (player: Player) => void;
  label: string;
  excludePlayerId?: string;
}

export default function PlayerSelector({
  players,
  selectedPlayer,
  onSelect,
  label,
  excludePlayerId
}: PlayerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        if (excludePlayerId && p.id === excludePlayerId) return false;
        if (!searchQuery) return true;
        return p.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 50); // Show top 50 results
  }, [players, searchQuery, excludePlayerId]);

  const handleSelect = (player: Player) => {
    onSelect(player);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (selectedPlayer) {
    const band = getRatingBand(selectedPlayer.rating);
    return (
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${band.color.replace('bg-', 'border-')}`}>
        <div className={`${band.color} ${band.textColor} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{label}</h3>
            <button
              onClick={() => onSelect(null as any)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${band.color} text-white text-3xl font-bold mb-4`}>
              {selectedPlayer.name.charAt(0)}
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedPlayer.name}
            </h4>
            <div className={`inline-block px-4 py-1 rounded-full ${band.color} ${band.textColor} text-sm font-semibold mb-4`}>
              {band.name}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Рейтинг</div>
                <div className={`text-2xl font-bold ${band.textColor}`}>
                  {selectedPlayer.rating}
                </div>
              </div>
              {selectedPlayer.city && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Місто</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedPlayer.city}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
      
      <div className="relative">
        <input
          type="text"
          placeholder="Пошук гравця..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
        <svg 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {isOpen && searchQuery && (
          <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => {
                const band = getRatingBand(player.rating);
                return (
                  <button
                    key={player.id}
                    onClick={() => handleSelect(player)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className={`w-10 h-10 rounded-full ${band.color} text-white flex items-center justify-center font-bold`}>
                      {player.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{player.name}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`${band.textColor} font-medium`}>
                          {player.rating}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{band.name}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                Гравців не знайдено
              </div>
            )}
          </div>
        )}
      </div>

      {!searchQuery && (
        <div className="mt-6 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-gray-500">
            Почніть вводити ім'я гравця
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface Player {
  id: number;
  name: string;
  rating: number;
  matches_played: number;
}

interface AddParticipantModalProps {
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingPlayerIds?: number[]; // IDs гравців які вже в турнірі
}

export default function AddParticipantModal({
  tournamentId,
  isOpen,
  onClose,
  onSuccess,
  existingPlayerIds = [],
}: AddParticipantModalProps) {
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  
  // New player form state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRating, setNewPlayerRating] = useState('1200');
  const [newPlayerCity, setNewPlayerCity] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
      setSearchQuery('');
      setError('');
      setMode('search');
      setNewPlayerName('');
      setNewPlayerRating('1200');
      setNewPlayerCity('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Фільтрувати гравців які вже додані
      const available = players.filter(p => !existingPlayerIds.includes(p.id));
      setFilteredPlayers(available);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = players
        .filter(player => !existingPlayerIds.includes(player.id)) // Виключити доданих
        .filter(player =>
          player.name.toLowerCase().includes(query) ||
          player.id.toString().includes(query)
        );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players, existingPlayerIds]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/players/`, { headers });
      if (response.ok) {
        const data = await response.json();
        // Sort by rating descending
        const sorted = data.sort((a: Player, b: Player) => b.rating - a.rating);
        setPlayers(sorted);
        setFilteredPlayers(sorted);
      }
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Помилка завантаження гравців');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (playerId: number) => {
    try {
      setAdding(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ player_id: playerId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Помилка додавання гравця');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2500) return 'text-red-600 font-bold';
    if (rating >= 2300) return 'text-orange-600 font-bold';
    if (rating >= 1800) return 'text-purple-600 font-semibold';
    if (rating >= 1600) return 'text-blue-600 font-semibold';
    if (rating >= 1400) return 'text-cyan-600';
    if (rating >= 1200) return 'text-green-600';
    return 'text-gray-600';
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) {
      setError('Введіть ім\'я гравця');
      return;
    }

    const rating = parseInt(newPlayerRating);
    if (isNaN(rating) || rating < 0 || rating > 3000) {
      setError('Рейтинг має бути від 0 до 3000');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      
      // Create player
      const createResponse = await fetch(`${API_URL}/api/players/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPlayerName.trim(),
          rating: rating,
          city: newPlayerCity.trim() || undefined,
        }),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.detail || 'Помилка створення гравця');
      }

      const newPlayer = await createResponse.json();

      // Add player to tournament
      const addResponse = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ player_id: newPlayer.id }),
        }
      );

      if (!addResponse.ok) {
        const data = await addResponse.json();
        throw new Error(data.detail || 'Помилка додавання гравця до турніру');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {mode === 'search' ? 'Додати учасника' : 'Створити нового гравця'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('search')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                mode === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Пошук гравця
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                mode === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Створити нового
            </button>
          </div>

          {/* Search Input (only in search mode) */}
          {mode === 'search' && (
            <input
              type="text"
              placeholder="Пошук гравця за ім'ям або ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'search' ? (
            // Search Mode - Players List
            loading ? (
              <div className="text-center py-8 text-gray-500">Завантаження...</div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'Гравців не знайдено' : 'Немає доступних гравців'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-600">
                        <span className={getRatingColor(player.rating)}>
                          Рейтинг: {Math.round(player.rating)}
                        </span>
                        <span className="ml-3 text-gray-500">
                          Матчів: {player.matches_played}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddPlayer(player.id)}
                      disabled={adding}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adding ? 'Додавання...' : 'Додати'}
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Create Mode - New Player Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я гравця *
                </label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Введіть повне ім'я"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Початковий рейтинг *
                </label>
                <input
                  type="number"
                  value={newPlayerRating}
                  onChange={(e) => setNewPlayerRating(e.target.value)}
                  min="0"
                  max="3000"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium mb-1">Рекомендовані рейтинги:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewPlayerRating('1200')}
                      className="text-left px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      1200 - Новачок
                    </button>
                    <button
                      onClick={() => setNewPlayerRating('1400')}
                      className="text-left px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      1400 - Базовий рівень
                    </button>
                    <button
                      onClick={() => setNewPlayerRating('1600')}
                      className="text-left px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      1600 - Просунутий
                    </button>
                    <button
                      onClick={() => setNewPlayerRating('1800')}
                      className="text-left px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      1800 - КМС
                    </button>
                    <button
                      onClick={() => setNewPlayerRating('2300')}
                      className="text-left px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      2300 - Майстер
                    </button>
                    <button
                      onClick={() => setNewPlayerRating('2500')}
                      className="text-left px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      2500 - Гросмейстер
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Місто (необов'язково)
                </label>
                <input
                  type="text"
                  value={newPlayerCity}
                  onChange={(e) => setNewPlayerCity(e.target.value)}
                  placeholder="Наприклад: Київ"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleCreatePlayer}
                disabled={creating || !newPlayerName.trim()}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {creating ? 'Створення...' : 'Створити та додати до турніру'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          {mode === 'search' ? (
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Знайдено: {filteredPlayers.length} гравців</span>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                Закрити
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                Скасувати
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

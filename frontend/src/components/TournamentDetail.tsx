'use client';

import { useEffect, useState } from 'react';
import { Tournament, TournamentStatus, AvailablePlayer, RATING_BANDS } from '@/types';
import { useAuth } from '@/context/AuthContext';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface TournamentDetailProps {
  tournamentId: number;
  onClose: () => void;
  onUpdate: () => void;
}

// Helper функція для отримання кольору та звання по рейтингу
const getRatingInfo = (rating: number) => {
  const band = RATING_BANDS.find(b => rating >= b.minRating && rating <= b.maxRating);
  return band || RATING_BANDS[0];
};

export default function TournamentDetail({ tournamentId, onClose, onUpdate }: TournamentDetailProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'registration'>('registration');
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>([]);
  const [availablePlayersLoaded, setAvailablePlayersLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}`, { headers });
      const data = await response.json();

      // Convert snake_case to camelCase
      const formattedData: Tournament = {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status,
        registrationStart: data.registration_start,
        registrationEnd: data.registration_end,
        startDate: data.start_date,
        endDate: data.end_date,
        startedAt: data.started_at,
        finishedAt: data.finished_at,
        city: data.city,
        country: data.country,
        club: data.club,
        discipline: data.discipline,
        isRated: data.is_rated,
        createdByAdminId: data.created_by_admin_id,
        createdAt: data.created_at,
        registeredCount: data.registered_count,
        isRegistered: data.is_registered,
        registeredPlayers: data.registered_players?.map((p: any) => ({
          id: p.id,
          playerId: p.player_id,
          playerName: p.player_name,
          rating: p.rating,
          status: p.status,
          seed: p.seed,
          registeredAt: p.registered_at,
          confirmedAt: p.confirmed_at,
          registeredByAdmin: p.registered_by_admin,
        })),
      };

      setTournament(formattedData);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      setError('Помилка завантаження турніру');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const url = `${API_URL}/api/tournaments/players/available?tournament_id=${tournamentId}`;
      console.log('Fetching available players:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const players = await response.json();
        console.log('Available players received:', players.length);
        
        // Сортуємо по рейтингу (від більшого до меншого)
        const sortedPlayers = players
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            rating: p.rating,
            matchesPlayed: p.matches_played || 0
          }))
          .sort((a: AvailablePlayer, b: AvailablePlayer) => b.rating - a.rating);
        
        setAvailablePlayers(sortedPlayers);
        setAvailablePlayersLoaded(true);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch available players:', errorText);
        setError('Помилка завантаження списку гравців');
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Помилка завантаження списку гравців');
    }
  };

  useEffect(() => {
    if (activeTab === 'registration' && user?.role === 'admin' && !availablePlayersLoaded) {
      fetchAvailablePlayers();
    }
  }, [activeTab, user]);

  const handleRegister = async () => {
    if (!tournament || tournament.status !== 'registration') return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Необхідна авторизація');
        return;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/register-player`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : JSON.stringify(data.detail) || 'Помилка реєстрації';
        throw new Error(errorMsg);
      }

      await fetchTournament();
      onUpdate();
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Помилка';
      setError(errorMsg);
      console.error('Registration error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!tournament || tournament.status !== 'registration') return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/tournaments/${tournamentId}/unregister`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : JSON.stringify(data.detail) || 'Помилка скасування реєстрації';
        throw new Error(errorMsg);
      }

      await fetchTournament();
      onUpdate();
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Помилка';
      setError(errorMsg);
      console.error('Unregister error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPlayer = async (playerId: string) => {
    if (!tournament) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/tournaments/${tournamentId}/register-player`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ player_id: playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : JSON.stringify(data.detail) || 'Помилка додавання гравця';
        throw new Error(errorMsg);
      }

      setAvailablePlayers([]);
      setAvailablePlayersLoaded(false);
      setSearchQuery('');
      await fetchTournament();
      await fetchAvailablePlayers();
      onUpdate();
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Помилка';
      setError(errorMsg);
      console.error('Add player error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePlayer = async (playerId: number) => {
    if (!tournament || tournament.status !== 'registration') return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/tournaments/${tournamentId}/unregister-player/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : JSON.stringify(data.detail) || 'Помилка видалення гравця';
        throw new Error(errorMsg);
      }

      setAvailablePlayers([]);
      setAvailablePlayersLoaded(false);
      await fetchTournament();
      await fetchAvailablePlayers();
      onUpdate();
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Помилка';
      setError(errorMsg);
      console.error('Remove player error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: TournamentStatus) => {
    const badges: Record<TournamentStatus, string> = {
      registration: 'bg-yellow-500 text-white',
      in_progress: 'bg-green-500 text-white',
      finished: 'bg-black text-white',
    };

    const labels: Record<TournamentStatus, string> = {
      registration: 'Реєстрація',
      in_progress: 'Триває',
      finished: 'Закінчився',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{tournament.name}</h2>
            {getStatusBadge(tournament.status)}
          </div>
          <button
            onClick={onClose}
            className="hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Description */}
        {tournament.description && (
          <p className="mb-6">{tournament.description}</p>
        )}

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('registration')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'registration'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-black hover:text-blue-600'
              }`}
            >
              Учасники ({tournament.registeredCount})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-black hover:text-blue-600'
              }`}
            >
              Регламент
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white border rounded-lg">
          {tournament.startDate && (
            <div>
              <span className="font-medium">Дата початку:</span>{' '}
              {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
            </div>
          )}
          {tournament.endDate && (
            <div>
              <span className="font-medium">Дата закінчення:</span>{' '}
              {new Date(tournament.endDate).toLocaleDateString('uk-UA')}
            </div>
          )}
          <div>
            <span className="font-medium">Учасників:</span> {tournament.registeredCount}
          </div>
          <div>
            <span className="font-medium">Створено:</span>{' '}
            {new Date(tournament.createdAt).toLocaleDateString('uk-UA')}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 text-red-600 bg-red-50 p-3 rounded">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-xs underline"
            >
              Закрити
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Регламент турніру</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {tournament.description || 'Регламент турніру не вказано'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registration' && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4">Зареєстровані учасники</h3>
              {!tournament.registeredPlayers || tournament.registeredPlayers.length === 0 ? (
                <div className="text-center py-8 bg-white border rounded-lg">
                  Ще немає зареєстрованих учасників
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {[...tournament.registeredPlayers]
                    .sort((a, b) => b.rating - a.rating)
                    .map((player) => {
                      const ratingInfo = getRatingInfo(player.rating);
                      return (
                        <div
                          key={player.playerId}
                          onClick={() => window.location.href = `/player/${player.playerId}`}
                          className="flex justify-between items-center p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{player.playerName}</div>
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <span className={`font-bold ${ratingInfo.textColor}`}>
                                {Math.round(player.rating)}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs text-white ${ratingInfo.color}`}>
                                {ratingInfo.name}
                              </span>
                            </div>
                          </div>

                          {user?.role === 'admin' && tournament.status === 'registration' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePlayer(player.playerId);
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition ml-3"
                              disabled={actionLoading}
                            >
                              Видалити
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* User Actions */}
            {tournament.status === 'registration' && user && user.role !== 'guest' && (
              <div className="mb-6 flex gap-3">
                {!tournament.isRegistered ? (
                  <button
                    onClick={handleRegister}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    disabled={actionLoading}
                  >
                    Зареєструватись
                  </button>
                ) : (
                  <button
                    onClick={handleUnregister}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    disabled={actionLoading}
                  >
                    Скасувати реєстрацію
                  </button>
                )}
              </div>
            )}

            {/* Admin: Add Players */}
            {user?.role === 'admin' && tournament.status === 'registration' && (
              <div className="mt-6">
                <h4 className="text-lg font-bold mb-3">Додати гравців (Адмін)</h4>
                
                {!availablePlayersLoaded ? (
                  <div className="text-center py-4">Завантаження списку гравців...</div>
                ) : (
                  <>
                    {/* Search Input */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="🔍 Пошук гравця по імені..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {(() => {
                      // Фільтруємо гравців по пошуку
                      const filteredPlayers = availablePlayers.filter(player =>
                        player.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      if (filteredPlayers.length === 0) {
                        return (
                          <div className="text-center py-8 bg-blue-50 rounded-lg">
                            {searchQuery 
                              ? `Не знайдено гравців за запитом "${searchQuery}"`
                              : 'Всі гравці вже зареєстровані на цей турнір'
                            }
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredPlayers.map((player) => {
                            const ratingInfo = getRatingInfo(player.rating);
                            return (
                              <div
                                key={player.id}
                                onClick={() => window.location.href = `/player/${player.id}`}
                                className="flex justify-between items-center p-3 bg-white border rounded-lg hover:border-blue-500 hover:bg-gray-50 transition cursor-pointer"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{player.name}</div>
                                  <div className="flex items-center gap-2 text-sm mt-1">
                                    <span className={`font-bold ${ratingInfo.textColor}`}>
                                      {Math.round(player.rating)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs text-white ${ratingInfo.color}`}>
                                      {ratingInfo.name}
                                    </span>
                                    <span className="text-gray-600">
                                      | Матчів: {player.matchesPlayed}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddPlayer(player.id);
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                  disabled={actionLoading}
                                >
                                  Додати
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-blue-50 transition"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}

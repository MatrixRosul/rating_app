'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tournament, TournamentStatus, AvailablePlayer, RATING_BANDS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getDisciplineLabel } from '@/utils/discipline';

// Helper функція для отримання кольору та звання по рейтингу
const getRatingInfo = (rating: number) => {
  const band = RATING_BANDS.find(b => rating >= b.minRating && rating <= b.maxRating);
  return band || RATING_BANDS[0];
};

export default function TournamentPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = Number(params.id);
  
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

      const response = await fetch(`http://localhost:8000/api/tournaments/${tournamentId}`, { headers });
      const data = await response.json();

      const formattedData: Tournament = {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        createdByAdminId: data.created_by_admin_id,
        createdAt: data.created_at,
        registeredCount: data.registered_count,
        isRegistered: data.is_registered,
        city: data.city,
        country: data.country,
        club: data.club,
        discipline: data.discipline,
        registeredPlayers: data.registered_players?.map((p: any) => ({
          playerId: p.player_id,
          playerName: p.player_name,
          rating: p.rating,
          username: p.username,
          registeredAt: p.registered_at,
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

      const url = `http://localhost:8000/api/tournaments/players/available?tournament_id=${tournamentId}`;
      console.log('Fetching available players:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const players = await response.json();
        console.log('Available players received:', players.length);
        
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
    if (!tournament || tournament.status !== 'pending') return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Необхідна авторизація');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/tournaments/${tournamentId}/register`, {
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
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Помилка';
      setError(errorMsg);
      console.error('Registration error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!tournament || tournament.status !== 'pending') return;

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
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Помилка';
      setError(errorMsg);
      console.error('Add player error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!tournament || tournament.status !== 'pending') return;

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
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Помилка';
      setError(errorMsg);
      console.error('Remove player error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: TournamentStatus) => {
    const badges = {
      pending: 'bg-yellow-500 text-white',
      ongoing: 'bg-green-500 text-white',
      completed: 'bg-black text-white',
    };

    const labels = {
      pending: 'Реєстрація',
      ongoing: 'Триває',
      completed: 'Закінчився',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Турнір не знайдено</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Повернутись на головну
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/tournaments')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
          >
            ← Назад до турнірів
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
              {getStatusBadge(tournament.status)}
            </div>
          </div>

          {tournament.description && (
            <p className="mt-4 text-lg">{tournament.description}</p>
          )}

          {/* Location and Discipline */}
          <div className="mt-4 flex flex-wrap gap-3">
            {tournament.city && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                📍 {tournament.city}{tournament.country && tournament.country !== 'Україна' ? `, ${tournament.country}` : ''}
              </div>
            )}
            {tournament.club && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                🏢 {tournament.club}
              </div>
            )}
            {tournament.discipline && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🎱 {getDisciplineLabel(tournament.discipline)}
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-white border rounded-lg">
          {tournament.startDate && (
            <div>
              <div className="text-sm text-gray-600">Дата початку</div>
              <div className="font-medium">{new Date(tournament.startDate).toLocaleDateString('uk-UA')}</div>
            </div>
          )}
          {tournament.endDate && (
            <div>
              <div className="text-sm text-gray-600">Дата закінчення</div>
              <div className="font-medium">{new Date(tournament.endDate).toLocaleDateString('uk-UA')}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">Учасників</div>
            <div className="font-medium text-2xl">{tournament.registeredCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Створено</div>
            <div className="font-medium">{new Date(tournament.createdAt).toLocaleDateString('uk-UA')}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-8">
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-lg">
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
            <h2 className="text-2xl font-bold mb-4">Регламент турніру</h2>
            <div className="p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line text-lg">
                {tournament.description || 'Регламент турніру не вказано'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'registration' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Зареєстровані учасники</h2>
              {!tournament.registeredPlayers || tournament.registeredPlayers.length === 0 ? (
                <div className="text-center py-12 bg-white border rounded-lg">
                  Ще немає зареєстрованих учасників
                </div>
              ) : (
                <div className="space-y-3">
                  {[...tournament.registeredPlayers]
                    .sort((a, b) => b.rating - a.rating)
                    .map((player) => {
                      const ratingInfo = getRatingInfo(player.rating);
                      return (
                        <div
                          key={player.playerId}
                          className="flex justify-between items-center p-4 bg-white border rounded-lg hover:shadow-md transition"
                        >
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => router.push(`/player/${player.playerId}`)}
                          >
                            <div className={`font-medium text-lg ${ratingInfo.textColor} hover:underline`}>{player.playerName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`font-bold text-lg ${ratingInfo.textColor}`}>
                                {Math.round(player.rating)}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs text-white ${ratingInfo.color}`}>
                                {ratingInfo.name}
                              </span>
                            </div>
                          </div>

                        {user?.role === 'admin' && tournament.status === 'pending' && (
                          <button
                            onClick={() => handleRemovePlayer(player.playerId)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ml-4"
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
            {tournament.status === 'pending' && user && user.role !== 'guest' && (
              <div className="mb-8 flex gap-3">
                {!tournament.isRegistered ? (
                  <button
                    onClick={handleRegister}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium"
                    disabled={actionLoading}
                  >
                    Зареєструватись
                  </button>
                ) : (
                  <button
                    onClick={handleUnregister}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-lg font-medium"
                    disabled={actionLoading}
                  >
                    Скасувати реєстрацію
                  </button>
                )}
              </div>
            )}

            {/* Admin: Add Players */}
            {user?.role === 'admin' && tournament.status === 'pending' && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Додати гравців (Адмін)</h3>
                
                {!availablePlayersLoaded ? (
                  <div className="text-center py-8 bg-white border rounded-lg">Завантаження списку гравців...</div>
                ) : (
                  <>
                    {/* Search Input */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="🔍 Пошук гравця по імені..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      />
                    </div>

                    {(() => {
                      const filteredPlayers = availablePlayers.filter(player =>
                        player.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      if (filteredPlayers.length === 0) {
                        return (
                          <div className="text-center py-12 bg-blue-50 rounded-lg">
                            {searchQuery 
                              ? `Не знайдено гравців за запитом "${searchQuery}"`
                              : 'Всі гравці вже зареєстровані на цей турнір'
                            }
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                          {filteredPlayers.map((player) => {
                            const ratingInfo = getRatingInfo(player.rating);
                            return (
                              <div
                                key={player.id}
                                className="flex justify-between items-center p-4 bg-white border rounded-lg hover:border-blue-500 hover:shadow-md transition"
                              >
                                <div 
                                  className="flex-1 cursor-pointer"
                                  onClick={() => router.push(`/player/${player.id}`)}
                                >
                                  <div className={`font-medium text-lg ${ratingInfo.textColor} hover:underline`}>{player.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`font-bold text-lg ${ratingInfo.textColor}`}>
                                      {Math.round(player.rating)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs text-white ${ratingInfo.color}`}>
                                      {ratingInfo.name}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      | Матчів: {player.matchesPlayed}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddPlayer(player.id)}
                                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
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
      </div>
    </div>
  );
}

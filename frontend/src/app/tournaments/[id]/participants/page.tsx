'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tournament, TournamentParticipant, ParticipantStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getRatingColor } from '@/utils/rating';
import CountdownTimer from '@/components/CountdownTimer';
import AddParticipantModal from '@/components/AddParticipantModal';
import StartTournamentModal from '@/components/StartTournamentModal';
import SeedingEditor from '@/components/SeedingEditor';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function ParticipantsPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { user } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showSeedingEditor, setShowSeedingEditor] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTournament(), fetchParticipants()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournament = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}`, { headers });
      const data = await response.json();

      setTournament({
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
      });
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Завжди завантажувати всіх учасників без фільтрації
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        const mappedParticipants = data.map((p: any) => ({
          id: p.id,
          playerId: p.player_id,
          playerName: p.player_name,
          rating: p.rating,
          status: p.status,
          seed: p.seed,
          registeredAt: p.registered_at,
          confirmedAt: p.confirmed_at,
          registeredByAdmin: p.registered_by_admin,
        }));
        setParticipants(mappedParticipants);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchParticipants();
    }
  }, []); // Видалити activeTab з dependencies

  const handleRegister = async () => {
    if (!user) {
      setError('Необхідна авторизація');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/register`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Помилка реєстрації');
      }

      setSuccess('Заявка на реєстрацію подана! Очікуйте підтвердження адміна.');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (participantId: number) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/${participantId}/confirm`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Помилка підтвердження');
      }

      setSuccess('Учасника підтверджено!');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (participantId: number) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/${participantId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Помилка відхилення');
      }

      setSuccess('Учасника відхилено!');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (participantId: number) => {
    if (!confirm('Ви впевнені що хочете видалити учасника?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/${participantId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Помилка видалення');
      }

      setSuccess('Учасника видалено!');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm('Ви впевнені що хочете відреєструватись з турніру?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/unregister`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Помилка відреєстрації');
      }

      setSuccess('Ви успішно відреєструвалися з турніру!');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ParticipantStatus) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      eliminated: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      pending: 'Очікує',
      confirmed: 'Підтверджено',
      rejected: 'Відхилено',
      active: 'Активний',
      eliminated: 'Вибув',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredParticipants = participants.filter(p => {
    if (activeTab === 'confirmed') return p.status === 'confirmed';
    if (activeTab === 'pending') return p.status === 'pending';
    return true;
  });

  const confirmedCount = participants.filter(p => p.status === 'confirmed').length;
  const pendingCount = participants.filter(p => p.status === 'pending').length;

  if (loading) {
    return <div className="text-center py-8">Завантаження...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-8 text-red-600">Турнір не знайдено</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold">Учасники турніру</h2>
        
        <div className="flex gap-2">
          {/* Seeding Editor Button - only for admin and only if status is REGISTRATION and has confirmed participants */}
          {user?.role === 'admin' && tournament.status === 'registration' && confirmedCount >= 2 && (
            <button
              onClick={() => setShowSeedingEditor(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Редагувати сіяних
            </button>
          )}
          
          {/* Start Tournament Button - only for admin and only if status is REGISTRATION */}
          {user?.role === 'admin' && tournament.status === 'registration' && confirmedCount >= 2 && (
            <button
              onClick={() => setShowStartModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Запустити турнір
            </button>
          )}
          
          {/* Existing buttons */}
          {tournament.status === 'registration' && user && !tournament.isRegistered && (
            <button
              onClick={handleRegister}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Реєстрація...' : 'Зареєструватись'}
            </button>
          )}

          {tournament.status === 'registration' && user && tournament.isRegistered && (
            <button
              onClick={handleUnregister}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Скасування...' : 'Відреєструватись'}
            </button>
          )}
          
          {user?.role === 'admin' && tournament.status === 'registration' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + Додати учасника
            </button>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      {tournament.status === 'registration' && tournament.registrationEnd && (
        <CountdownTimer targetDate={tournament.registrationEnd} />
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Всі ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'confirmed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Підтверджені ({confirmedCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Очікують підтвердження ({pendingCount})
          </button>
        </nav>
      </div>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Учасників не знайдено
        </div>
      ) : (
        <div className="space-y-2">
          {filteredParticipants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {participant.status === 'confirmed' && participant.seed && (
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {participant.seed}
                  </div>
                )}
                {participant.status === 'confirmed' && !participant.seed && (
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {index + 1}
                  </div>
                )}
                <div>
                  <div className={`font-semibold ${getRatingColor(participant.rating)}`}>
                    {participant.playerName}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      Рейтинг: {Math.round(participant.rating)}
                    </span>
                    {getStatusBadge(participant.status)}
                  </div>
                </div>
              </div>

              {user?.role === 'admin' && tournament.status === 'registration' && (
                <div className="flex gap-2">
                  {participant.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirm(participant.id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Підтвердити
                      </button>
                      <button
                        onClick={() => handleReject(participant.id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Відхилити
                      </button>
                    </>
                  )}
                  {participant.status === 'rejected' && (
                    <>
                      <button
                        onClick={() => handleConfirm(participant.id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Прийняти
                      </button>
                      <button
                        onClick={() => handleRemove(participant.id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        Видалити
                      </button>
                    </>
                  )}
                  {(participant.status === 'confirmed' || participant.status === 'active' || participant.status === 'eliminated') && (
                    <button
                      onClick={() => handleRemove(participant.id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                      Видалити
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Participant Modal */}
      <AddParticipantModal
        tournamentId={tournamentId}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        existingPlayerIds={participants.map(p => p.playerId)}
        onSuccess={() => {
          setSuccess('Учасника успішно додано!');
          fetchData();
          setTimeout(() => setSuccess(''), 3000);
        }}
      />

      {/* Start Tournament Modal */}
      <StartTournamentModal
        tournamentId={tournamentId}
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        confirmedCount={confirmedCount}
        onSuccess={() => {
          setSuccess('Турнір успішно запущено! Перенаправлення на сітку...');
          // Перезавантажити дані і перенаправити на сітку
          fetchData().then(() => {
            setTimeout(() => {
              window.location.href = `/tournaments/${tournamentId}/bracket`;
            }, 1000);
          });
        }}
      />

      {/* Seeding Editor Modal */}
      <SeedingEditor
        tournamentId={tournamentId}
        isOpen={showSeedingEditor}
        onClose={() => setShowSeedingEditor(false)}
        participants={participants.map(p => ({
          ...p,
          seed: p.seed ?? null
        }))}
        onSuccess={() => {
          setSuccess('Сіяні номери оновлено!');
          fetchData();
          setTimeout(() => setSuccess(''), 3000);
        }}
      />
    </div>
  );
}

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
    return (
      <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="relative bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-8 text-center">
        <div className="text-red-600 text-lg font-semibold">Турнір не знайдено</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-6 overflow-hidden">
        {/* Animated background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Учасники турніру
            </h2>
          </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Seeding Editor Button */}
          {user?.role === 'admin' && tournament.status === 'registration' && confirmedCount >= 2 && (
            <button
              onClick={() => setShowSeedingEditor(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              Редагувати сіяних
            </button>
          )}
          
          {/* Start Tournament Button */}
          {user?.role === 'admin' && tournament.status === 'registration' && confirmedCount >= 2 && (
            <button
              onClick={() => setShowStartModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              Запустити турнір
            </button>
          )}
          
          {/* Register Button */}
          {tournament.status === 'registration' && user && !tournament.isRegistered && (
            <button
              onClick={handleRegister}
              disabled={actionLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:hover:scale-100"
            >
              {actionLoading ? 'Реєстрація...' : 'Зареєструватись'}
            </button>
          )}

          {/* Unregister Button */}
          {tournament.status === 'registration' && user && tournament.isRegistered && (
            <button
              onClick={handleUnregister}
              disabled={actionLoading}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:hover:scale-100"
            >
              {actionLoading ? 'Скасування...' : 'Відреєструватись'}
            </button>
          )}
          
          {/* Add Participant Button */}
          {user?.role === 'admin' && tournament.status === 'registration' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              + Додати учасника
            </button>
          )}
        </div>
      </div>
    </div>

      {/* Countdown Timer */}
      {tournament.status === 'registration' && tournament.registrationEnd && (
        <CountdownTimer targetDate={tournament.registrationEnd} />
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl shadow-lg border-2 border-green-300/50 p-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full blur-2xl"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="relative bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm rounded-xl shadow-lg border-2 border-red-300/50 p-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 rounded-full blur-2xl"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="relative border-b border-gray-200/50 backdrop-blur-sm">
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-6 py-3 rounded-t-xl font-medium text-sm transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            Всі ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`relative px-6 py-3 rounded-t-xl font-medium text-sm transition-all duration-300 ${
              activeTab === 'confirmed'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            Підтверджені ({confirmedCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`relative px-6 py-3 rounded-t-xl font-medium text-sm transition-all duration-300 ${
              activeTab === 'pending'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            Очікують підтвердження ({pendingCount})
          </button>
        </nav>
      </div>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">Учасників не знайдено</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredParticipants.map((participant, index) => (
            <div
              key={participant.id}
              className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {participant.status === 'confirmed' && participant.seed && (
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-lg font-bold shadow-md">
                      {participant.seed}
                    </div>
                  )}
                  {participant.status === 'confirmed' && !participant.seed && (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-lg flex items-center justify-center text-lg font-bold shadow-md">
                      {index + 1}
                    </div>
                  )}
                  <div>
                    <div className={`font-semibold text-lg ${getRatingColor(participant.rating)}`}>
                      {participant.playerName}
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg font-medium">
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
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Підтвердити
                      </button>
                      <button
                        onClick={() => handleReject(participant.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Прийняти
                      </button>
                      <button
                        onClick={() => handleRemove(participant.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Видалити
                      </button>
                    </>
                  )}
                  {(participant.status === 'confirmed' || participant.status === 'active' || participant.status === 'eliminated') && (
                    <button
                      onClick={() => handleRemove(participant.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Видалити
                    </button>
                  )}
                </div>
              )}
              </div>
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
          seed: p.seed ?? undefined
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

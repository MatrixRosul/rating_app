'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tournament, TournamentStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getDisciplineLabel } from '@/utils/discipline';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface TournamentListProps {
  onCreateClick: () => void;
}

export default function TournamentList({ onCreateClick }: TournamentListProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TournamentStatus>('registration');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const url = `${API_URL}/api/tournaments/?status=${filter}`;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();
      
      // Convert snake_case to camelCase
      let formattedData = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        status: t.status,
        registrationStart: t.registration_start,
        registrationEnd: t.registration_end,
        startDate: t.start_date,
        endDate: t.end_date,
        startedAt: t.started_at,
        finishedAt: t.finished_at,
        createdByAdminId: t.created_by_admin_id,
        createdAt: t.created_at,
        registeredCount: t.registered_count,
        isRegistered: t.is_registered,
        isRated: t.is_rated,
        city: t.city,
        country: t.country,
        club: t.club,
        discipline: t.discipline,
      }));

      // Додаткова клієнтська фільтрація для надійності
      formattedData = formattedData.filter((t: Tournament) => t.status === filter);

      setTournaments(formattedData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: TournamentStatus) => {
    const badges = {
      registration: 'bg-yellow-500 text-white',
      in_progress: 'bg-green-500 text-white',
      finished: 'bg-black text-white',
    };

    const labels = {
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
    return <div className="text-center py-8">Завантаження...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold">Турніри</h2>
        {user?.role === 'admin' && (
          <button
            onClick={onCreateClick}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            + Створити турнір
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['registration', 'in_progress', 'finished'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-lg transition whitespace-nowrap text-sm sm:text-base ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border hover:bg-blue-50'
            }`}
          >
            {status === 'registration' ? 'Реєстрація' : status === 'in_progress' ? 'Триває' : 'Минулі'}
          </button>
        ))}
      </div>

      {/* Tournament List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {tournaments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Турнірів не знайдено
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div
              key={tournament.id}
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-gray-300 hover:shadow-md transition cursor-pointer active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 leading-tight">
                  {tournament.name}
                </h3>
                <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium shrink-0 ${
                  tournament.status === 'registration' 
                    ? 'bg-gray-100 text-gray-700' 
                    : tournament.status === 'in_progress'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tournament.status === 'registration' ? 'Реєстрація' : tournament.status === 'in_progress' ? 'Триває' : 'Завершено'}
                </span>
              </div>

              {tournament.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                  {tournament.description}
                </p>
              )}

              {/* Location and Discipline */}
              <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                {tournament.city && (
                  <span className="text-gray-600">📍 {tournament.city}</span>
                )}
                {tournament.club && (
                  <span className="text-gray-600">• {tournament.club}</span>
                )}
                {tournament.discipline && (
                  <span className="text-gray-600 hidden sm:inline">• {getDisciplineLabel(tournament.discipline)}</span>
                )}
                {tournament.isRated && (
                  <span className="text-gray-600">• Рейтинговий</span>
                )}
              </div>

              {/* Discipline on mobile - separate line */}
              {tournament.discipline && (
                <div className="mb-3 text-[11px] text-gray-600 sm:hidden">
                  {getDisciplineLabel(tournament.discipline)}
                </div>
              )}

              <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-600">
                {tournament.registrationEnd && tournament.status === 'registration' && (
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-gray-500">Реєстрація до:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(tournament.registrationEnd).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )}
                {tournament.startDate && (
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-gray-500">Старт:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(tournament.startDate).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-gray-500">Учасників:</span>
                  <span className="font-medium text-gray-900">{tournament.registeredCount}</span>
                </div>
                {tournament.isRegistered && (
                  <div className="text-blue-600 font-medium text-[11px] sm:text-xs mt-1.5 sm:mt-2">
                    ✓ Ви зареєстровані
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

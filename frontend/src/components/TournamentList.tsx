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
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Завантаження турнірів...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-block mb-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-full border border-blue-200/50">
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Більярдні змагання
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Турніри
            </span>
          </h2>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={onCreateClick}
            className="group relative w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">+ Створити турнір</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['registration', 'in_progress', 'finished'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 sm:px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap text-sm sm:text-base font-semibold ${
              filter === status
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:scale-105'
            }`}
          >
            {status === 'registration' ? 'Реєстрація' : status === 'in_progress' ? 'Триває' : 'Минулі'}
          </button>
        ))}
      </div>

      {/* Tournament List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {tournaments.length === 0 ? (
          <div className="col-span-full">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 opacity-50 rounded-2xl"></div>
              <div className="relative">
                <div className="inline-block mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full blur-xl animate-pulse"></div>
                    <svg className="relative h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Турнірів не знайдено</h3>
                <p className="text-gray-600">Спробуйте вибрати інший фільтр</p>
              </div>
            </div>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div
              key={tournament.id}
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
              className="group relative bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Decorative gradient on hover */}
              <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex justify-between items-start mb-4 gap-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex-1 leading-tight group-hover:text-blue-600 transition-colors">
                  {tournament.name}
                </h3>
                <span className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  tournament.status === 'registration' 
                    ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border border-amber-200' 
                    : tournament.status === 'in_progress'
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200'
                }`}>
                  {tournament.status === 'registration' ? 'Реєстрація' : tournament.status === 'in_progress' ? 'Триває' : 'Завершено'}
                </span>
              </div>

              {tournament.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {tournament.description}
                </p>
              )}

              {/* Location and Discipline */}
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                {tournament.city && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">{tournament.city}</span>
                )}
                {tournament.club && (
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">{tournament.club}</span>
                )}
                {tournament.discipline && (
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-medium hidden sm:inline">
                    {getDisciplineLabel(tournament.discipline)}
                  </span>
                )}
                {tournament.isRated && (
                  <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-lg font-medium border border-amber-200">Рейтинговий</span>
                )}
              </div>

              {/* Discipline on mobile - separate line */}
              {tournament.discipline && (
                <div className="mb-3 text-xs sm:hidden">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                    {getDisciplineLabel(tournament.discipline)}
                  </span>
                </div>
              )}

              <div className="space-y-2 text-xs sm:text-sm">
                {tournament.registrationEnd && tournament.status === 'registration' && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Реєстрація до:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(tournament.registrationEnd).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )}
                {tournament.startDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Старт:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(tournament.startDate).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium">Учасників:</span>
                  <span className="font-bold text-blue-600">{tournament.registeredCount}</span>
                </div>
                {tournament.isRegistered && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold text-xs rounded-lg border border-green-200 mt-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Ви зареєстровані
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

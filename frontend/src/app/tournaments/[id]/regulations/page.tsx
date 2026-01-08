'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tournament } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function RegulationsPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

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
    } finally {
      setLoading(false);
    }
  };

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
      {/* Регламент Card */}
      <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-6 sm:p-8 overflow-hidden">
        {/* Animated background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Регламент турніру
            </h2>
          </div>
          
          {tournament.description ? (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                {tournament.description}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic bg-gray-50/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 text-center">
              Регламент не вказано
            </div>
          )}
        </div>
      </div>

      {/* Інформація Card */}
      <div className="relative bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-6 sm:p-8 overflow-hidden">
        {/* Animated background */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Інформація про турнір
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournament.registrationStart && (
              <div className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300">
                <div className="text-sm font-semibold text-gray-600 mb-1">Початок реєстрації</div>
                <div className="text-gray-900 font-medium">
                  {new Date(tournament.registrationStart).toLocaleString('uk-UA')}
                </div>
              </div>
            )}
            
            {tournament.registrationEnd && (
              <div className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300">
                <div className="text-sm font-semibold text-gray-600 mb-1">Кінець реєстрації</div>
                <div className="text-gray-900 font-medium">
                  {new Date(tournament.registrationEnd).toLocaleString('uk-UA')}
                </div>
              </div>
            )}

            {tournament.startDate && (
              <div className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300">
                <div className="text-sm font-semibold text-gray-600 mb-1">Дата початку турніру</div>
                <div className="text-gray-900 font-medium">
                  {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
                </div>
              </div>
            )}

            {tournament.endDate && (
              <div className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300">
                <div className="text-sm font-semibold text-gray-600 mb-1">Дата закінчення турніру</div>
                <div className="text-gray-900 font-medium">
                  {new Date(tournament.endDate).toLocaleDateString('uk-UA')}
                </div>
              </div>
            )}

            <div className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-semibold text-gray-600 mb-1">Тип турніру</div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${tournament.isRated ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}></div>
                <span className="text-gray-900 font-medium">
                  {tournament.isRated ? 'Рейтинговий' : 'Нерейтинговий'}
                </span>
              </div>
            </div>

            <div className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-semibold text-gray-600 mb-1">Учасників зареєстровано</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {tournament.registeredCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

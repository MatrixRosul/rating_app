'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Tournament } from '@/types';
import { getDisciplineLabel } from '@/utils/discipline';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function TournamentLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Визначаємо активну вкладку з URL
  const getActiveTab = () => {
    if (pathname.endsWith('/regulations')) return 'regulations';
    if (pathname.includes('/participants')) return 'participants';
    if (pathname.includes('/bracket')) return 'bracket';
    if (pathname.includes('/matches')) return 'matches';
    if (pathname.includes('/videos')) return 'videos';
    if (pathname.includes('/results')) return 'results';
    if (pathname.includes('/rating-changes')) return 'rating-changes';
    if (pathname.endsWith(tournamentId)) return 'regulations'; // Default
    return 'regulations';
  };

  const activeTab = getActiveTab();

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
      
      if (!response.ok) {
        throw new Error('Tournament not found');
      }

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
    } catch (err: any) {
      setError(err.message || 'Failed to load tournament');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      registration: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md',
      in_progress: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md',
      finished: 'bg-gradient-to-r from-gray-800 to-black text-white shadow-md',
    };

    const labels = {
      registration: 'Реєстрація',
      in_progress: 'Триває',
      finished: 'Закінчився',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const navigateToTab = (tab: string) => {
    router.push(`/tournaments/${tournamentId}/${tab}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Завантаження...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="relative bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-red-300/50 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-red-700 font-medium text-lg">{error || 'Турнір не знайдено'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Визначаємо доступні вкладки залежно від статусу
  const tabs = [
    { id: 'regulations', label: 'Регламент', available: true },
    { id: 'participants', label: 'Учасники', available: true },
  ];

  // Додаткові вкладки для турнірів що розпочались або закінчились
  if (tournament.status === 'in_progress' || tournament.status === 'finished') {
    tabs.push(
      { id: 'bracket', label: 'Сітка', available: true },
      { id: 'matches', label: 'Матчі', available: true },
      { id: 'videos', label: 'Відео', available: false }
    );
  }

  if (tournament.status === 'finished') {
    tabs.push(
      { id: 'results', label: 'Результати', available: true }
    );
    
    if (tournament.isRated) {
      tabs.push(
        { id: 'rating-changes', label: 'Зміна рейтингу', available: true }
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl"></div>
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              {tournament.name}
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {getStatusBadge(tournament.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-md ${
                tournament.isRated 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
              }`}>
                {tournament.isRated ? 'Рейтинговий' : 'Нерейтинговий'}
              </span>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-lg p-3">
              <span className="font-semibold text-blue-900 block mb-1">Місце:</span>
              <div className="text-gray-700">{tournament.club}, {tournament.city}, {tournament.country}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-lg p-3">
              <span className="font-semibold text-purple-900 block mb-1">Дисципліна:</span>
              <div className="text-gray-700">{getDisciplineLabel(tournament.discipline)}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50/50 rounded-lg p-3">
              <span className="font-semibold text-teal-900 block mb-1">Учасників:</span>
              <div className="text-gray-700">{tournament.registeredCount}</div>
            </div>
          </div>

          {tournament.registrationEnd && tournament.status === 'registration' && (
            <div className="relative mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300/50 rounded-xl overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/10 rounded-full blur-2xl"></div>
              <div className="relative text-sm font-medium text-orange-900">
                Реєстрація до: {new Date(tournament.registrationEnd).toLocaleString('uk-UA')}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-6 border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <nav className="flex space-x-2 px-6 py-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => tab.available && navigateToTab(tab.id)}
                  disabled={!tab.available}
                  className={`
                    relative whitespace-nowrap px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                      : tab.available
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 hover:scale-105'
                      : 'text-gray-300 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {tab.label}
                  {!tab.available && ' (скоро)'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
          {children}
        </div>
      </div>
    </div>
  );
}

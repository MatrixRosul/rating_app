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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Турнір не знайдено'}
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
      { id: 'matches', label: 'Матчі', available: false },
      { id: 'videos', label: 'Відео', available: false }
    );
  }

  if (tournament.status === 'finished') {
    tabs.push(
      { id: 'results', label: 'Результати', available: false }
    );
    
    if (tournament.isRated) {
      tabs.push(
        { id: 'rating-changes', label: 'Зміна рейтингу', available: false }
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {getStatusBadge(tournament.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tournament.isRated 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}>
                {tournament.isRated ? 'Рейтинговий' : 'Нерейтинговий'}
              </span>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Місце:</span>
              <div>{tournament.club}, {tournament.city}, {tournament.country}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Дисципліна:</span>
              <div>{getDisciplineLabel(tournament.discipline)}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Учасників:</span>
              <div>{tournament.registeredCount}</div>
            </div>
          </div>

          {tournament.registrationEnd && tournament.status === 'registration' && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-sm font-medium text-orange-800">
                Реєстрація до: {new Date(tournament.registrationEnd).toLocaleString('uk-UA')}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b overflow-x-auto">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => tab.available && navigateToTab(tab.id)}
                  disabled={!tab.available}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : tab.available
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
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
        <div className="bg-white rounded-lg shadow p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tournament, TournamentStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface TournamentListProps {
  onCreateClick: () => void;
}

export default function TournamentList({ onCreateClick }: TournamentListProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TournamentStatus | 'all'>('all');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const url = filter === 'all' 
        ? 'http://localhost:8000/api/tournaments/'
        : `http://localhost:8000/api/tournaments/?status=${filter}`;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();
      
      // Convert snake_case to camelCase
      const formattedData = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        status: t.status,
        startDate: t.start_date,
        endDate: t.end_date,
        createdByAdminId: t.created_by_admin_id,
        createdAt: t.created_at,
        registeredCount: t.registered_count,
        isRegistered: t.is_registered,
      }));

      setTournaments(formattedData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
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
    return <div className="text-center py-8">Завантаження...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Турніри</h2>
        {user?.role === 'admin' && (
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Створити турнір
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'ongoing', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border hover:bg-blue-50'
            }`}
          >
            {status === 'all' ? 'Всі' : status === 'pending' ? 'Реєстрація' : status === 'ongoing' ? 'Триває' : 'Закінчені'}
          </button>
        ))}
      </div>

      {/* Tournament List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournaments.length === 0 ? (
          <div className="col-span-full text-center py-8">
            Турнірів не знайдено
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div
              key={tournament.id}
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
              className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{tournament.name}</h3>
                {getStatusBadge(tournament.status)}
              </div>

              {tournament.description && (
                <p className="mb-4 line-clamp-2">{tournament.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {tournament.startDate && (
                  <div>
                    <span className="font-medium">Початок:</span>{' '}
                    {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
                  </div>
                )}
                {tournament.endDate && (
                  <div>
                    <span className="font-medium">Кінець:</span>{' '}
                    {new Date(tournament.endDate).toLocaleDateString('uk-UA')}
                  </div>
                )}
                <div>
                  <span className="font-medium">Учасників:</span> {tournament.registeredCount}
                </div>
                {tournament.isRegistered && (
                  <div className="text-green-600 font-medium">✓ Ви зареєстровані</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

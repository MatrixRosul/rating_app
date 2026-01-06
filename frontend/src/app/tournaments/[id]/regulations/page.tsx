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
    return <div className="text-center py-8">Завантаження...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-8 text-red-600">Турнір не знайдено</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Регламент турніру</h2>
        
        {tournament.description ? (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {tournament.description}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Регламент не вказано
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Інформація про турнір</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournament.registrationStart && (
            <div>
              <div className="text-sm font-medium text-gray-600">Початок реєстрації</div>
              <div className="text-gray-900">
                {new Date(tournament.registrationStart).toLocaleString('uk-UA')}
              </div>
            </div>
          )}
          
          {tournament.registrationEnd && (
            <div>
              <div className="text-sm font-medium text-gray-600">Кінець реєстрації</div>
              <div className="text-gray-900">
                {new Date(tournament.registrationEnd).toLocaleString('uk-UA')}
              </div>
            </div>
          )}

          {tournament.startDate && (
            <div>
              <div className="text-sm font-medium text-gray-600">Дата початку турніру</div>
              <div className="text-gray-900">
                {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
              </div>
            </div>
          )}

          {tournament.endDate && (
            <div>
              <div className="text-sm font-medium text-gray-600">Дата закінчення турніру</div>
              <div className="text-gray-900">
                {new Date(tournament.endDate).toLocaleDateString('uk-UA')}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-gray-600">Тип турніру</div>
            <div className="text-gray-900">
              {tournament.isRated ? 'Рейтинговий' : 'Нерейтинговий'}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600">Учасників зареєстровано</div>
            <div className="text-gray-900">{tournament.registeredCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

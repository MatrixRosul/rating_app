'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BracketView from '@/components/BracketView';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function BracketPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [bracket, setBracket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBracket();
  }, [tournamentId]);

  const fetchBracket = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/bracket`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 400) {
          setError('Турнір ще не стартував. Сітка буде доступна після запуску турніру.');
        } else {
          setError('Помилка завантаження сітки');
        }
        return;
      }

      const data = await response.json();
      setBracket(data.bracket);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження сітки');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Завантаження сітки...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Турнірна сітка</h2>
      <BracketView bracket={bracket} />
    </div>
  );
}

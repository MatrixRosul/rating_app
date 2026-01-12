'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BracketView from '@/components/BracketView';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function BracketPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [bracket, setBracket] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
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

      // Fetch tournament info to get bracket type
      const tournamentResponse = await fetch(`${API_URL}/api/tournaments/${tournamentId}`, {
        headers,
      });

      if (tournamentResponse.ok) {
        const tournamentData = await tournamentResponse.json();
        setTournament(tournamentData);
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
      console.log('Bracket API response:', data); // Додати для діагностики
      
      // Get bracket_type from response
      const bracketType = data.bracket_type || 'single_elimination';
      
      // Конвертуємо snake_case в camelCase для matches
      const convertMatchData = (match: any) => {
        const converted = {
          id: match.id,
          tournamentId: match.tournament_id,
          matchNumber: match.match_number,
          round: match.round,
          player1Id: match.player1_id,
          player2Id: match.player2_id,
          player1Name: match.player1_name,
          player2Name: match.player2_name,
          winnerId: match.winner_id,
          player1Score: match.player1_score,
          player2Score: match.player2_score,
          status: match.status,
          createdAt: match.created_at,
          date: match.date
        };
        console.log('Converted match:', converted); // Debug log
        return converted;
      };
      
      const bracketData = data.bracket || data;
      if (bracketData.matches) {
        bracketData.matches = bracketData.matches.map(convertMatchData);
      }
      
      // Add bracket_type to bracket data for component
      bracketData.bracket_type = bracketType;
      
      setBracket(bracketData);
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
      <BracketView 
        bracket={bracket} 
        matches={bracket?.matches}
        tournamentId={parseInt(tournamentId)}
        bracketType={bracket?.bracket_type || 'single_elimination'}
      />
    </div>
  );
}

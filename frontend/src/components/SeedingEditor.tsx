'use client';

import { useState, useEffect } from 'react';
import { getRatingColor } from '@/utils/rating';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface Participant {
  playerId: number;
  playerName: string;
  seed?: number;
  rating: number;
  status: string;
}

interface SeedingEditorProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  participants: Participant[];
  onSuccess: () => void;
}

export default function SeedingEditor({
  isOpen,
  onClose,
  tournamentId,
  participants,
  onSuccess,
}: SeedingEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editedSeeds, setEditedSeeds] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (isOpen) {
      // Ініціалізувати editedSeeds з поточних значень
      const initialSeeds: { [key: number]: number } = {};
      participants
        .filter(p => p.status === 'confirmed' && p.seed)
        .forEach(p => {
          initialSeeds[p.playerId] = p.seed!;
        });
      setEditedSeeds(initialSeeds);
      setError('');
    }
  }, [isOpen, participants]);

  const handleSeedChange = (playerId: number, newSeed: string) => {
    if (newSeed === '') {
      // Дозволити очистити поле
      setEditedSeeds(prev => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
      return;
    }
    
    const seedNumber = parseInt(newSeed, 10);
    if (!isNaN(seedNumber) && seedNumber > 0) {
      setEditedSeeds(prev => ({
        ...prev,
        [playerId]: seedNumber
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Перевірка на дублікати
      const seedValues = Object.values(editedSeeds);
      const uniqueSeeds = new Set(seedValues);
      if (seedValues.length !== uniqueSeeds.size) {
        setError('Сіяні номери не можуть повторюватися!');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Потрібна авторизація');
        return;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/seeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          seeds: editedSeeds
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Помилка оновлення сіяних');
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Помилка оновлення сіяних');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const confirmedParticipants = participants
    .filter(p => p.status === 'confirmed')
    .sort((a, b) => (editedSeeds[a.playerId] || 999) - (editedSeeds[b.playerId] || 999));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Редагування сіяних номерів</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Відредагуйте сіяні номери учасників. Вони визначають розташування в турнірній сітці.
            </p>

            <div className="space-y-3">
              {confirmedParticipants.map((participant) => (
                <div
                  key={participant.playerId}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-base">{participant.playerName}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">Сіяний номер:</label>
                    <input
                      type="number"
                      min="1"
                  value={editedSeeds[participant.playerId] || ''}
                  onChange={(e) => handleSeedChange(participant.playerId, e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Скасувати
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

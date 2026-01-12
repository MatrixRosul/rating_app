'use client';

import { useState, useEffect } from 'react';
import { TournamentMatch, Table } from '@/types';
import { startMatch } from '@/lib/api/matches';

interface StartMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: TournamentMatch;
  tables: Table[];
  onSuccess: () => void;
}

export default function StartMatchModal({
  isOpen,
  onClose,
  match,
  tables,
  onSuccess,
}: StartMatchModalProps) {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTableId(null);
      setVideoUrl('');
      setError('');
    }
  }, [isOpen]);

  // Auto-select first available table
  useEffect(() => {
    if (isOpen && !selectedTableId) {
      const availableTable = tables.find(t => t.isActive && !t.isOccupied);
      if (availableTable) {
        setSelectedTableId(availableTable.id);
      }
    }
  }, [isOpen, tables, selectedTableId]);

  const availableTables = tables.filter(t => t.isActive && !t.isOccupied);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTableId) {
      setError('Оберіть стіл для гри');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await startMatch(match.id, {
        tableId: selectedTableId,
        videoUrl: videoUrl || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка запуску матчу');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Запуск матчу</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Match Info */}
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-emerald-700 mb-2">Матч #{match.matchNumber}</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{match.player1Name}</span>
                <span className="text-sm text-gray-500">гравець 1</span>
              </div>
              <div className="text-center text-gray-400 text-sm font-medium">VS</div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{match.player2Name}</span>
                <span className="text-sm text-gray-500">гравець 2</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              До {match.maxScore} очок
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Table Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Виберіть стіл *
              </label>
              {availableTables.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    😕 Немає вільних столів
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTables.map((table) => (
                    <label
                      key={table.id}
                      className={`
                        flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${selectedTableId === table.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="table"
                        value={table.id}
                        checked={selectedTableId === table.id}
                        onChange={() => setSelectedTableId(table.id)}
                        className="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-900">{table.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Посилання на трансляцію (опційно)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                YouTube, Twitch або інша платформа
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={loading || availableTables.length === 0 || !selectedTableId}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Запуск...
                  </span>
                ) : (
                  '🎮 Запустити матч'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

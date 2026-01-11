'use client';

import { useState, useEffect } from 'react';
import { TournamentMatch } from '@/types';

interface UpdateLiveScoreModalProps {
  match: TournamentMatch | null;
  onClose: () => void;
  onUpdate: (matchId: number, player1Score: number, player2Score: number) => void;
}

export default function UpdateLiveScoreModal({ match, onClose, onUpdate }: UpdateLiveScoreModalProps) {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (match) {
      setPlayer1Score(match.player1Score || 0);
      setPlayer2Score(match.player2Score || 0);
    }
  }, [match]);

  if (!match) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onUpdate(match.id, player1Score, player2Score);
      onClose();
    } catch (error) {
      console.error('Error updating score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const increment = (player: 1 | 2) => {
    if (player === 1) {
      setPlayer1Score(prev => Math.min(prev + 1, match.maxScore));
    } else {
      setPlayer2Score(prev => Math.min(prev + 1, match.maxScore));
    }
  };

  const decrement = (player: 1 | 2) => {
    if (player === 1) {
      setPlayer1Score(prev => Math.max(prev - 1, 0));
    } else {
      setPlayer2Score(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Оновити рахунок</h2>
        
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            🔴 Матч в процесі - оновлюється поточний рахунок
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player 1 Score */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {match.player1Name}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => decrement(1)}
                className="w-10 h-10 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xl font-bold"
                disabled={player1Score === 0}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max={match.maxScore}
                value={player1Score}
                onChange={(e) => setPlayer1Score(Math.max(0, Math.min(match.maxScore, parseInt(e.target.value) || 0)))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => increment(1)}
                className="w-10 h-10 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xl font-bold"
                disabled={player1Score === match.maxScore}
              >
                +
              </button>
            </div>
          </div>

          {/* Player 2 Score */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {match.player2Name}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => decrement(2)}
                className="w-10 h-10 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xl font-bold"
                disabled={player2Score === 0}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max={match.maxScore}
                value={player2Score}
                onChange={(e) => setPlayer2Score(Math.max(0, Math.min(match.maxScore, parseInt(e.target.value) || 0)))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => increment(2)}
                className="w-10 h-10 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xl font-bold"
                disabled={player2Score === match.maxScore}
              >
                +
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600 text-center">
            Максимальний рахунок: {match.maxScore}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оновлення...' : 'Оновити рахунок'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

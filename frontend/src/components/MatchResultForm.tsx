'use client';

import { useState, useEffect } from 'react';
import { TournamentMatch } from '@/types';
import { finishMatch, editMatchResult } from '@/lib/api/matches';

interface MatchResultFormProps {
  isOpen: boolean;
  onClose: () => void;
  match: TournamentMatch;
  onSuccess: () => void;
  mode: 'finish' | 'edit';
}

export default function MatchResultForm({
  isOpen,
  onClose,
  match,
  onSuccess,
  mode,
}: MatchResultFormProps) {
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize scores
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit') {
        setScoreP1(match.player1Score);
        setScoreP2(match.player2Score);
      } else {
        setScoreP1(0);
        setScoreP2(0);
      }
      setError('');
      setShowConfirmation(false);
    }
  }, [isOpen, mode, match]);

  // Default maxScore if not set
  const effectiveMaxScore = match.maxScore ?? 7;

  const handleScoreChange = (player: 1 | 2, value: number) => {
    const newValue = Math.max(0, Math.min(effectiveMaxScore, value));
    if (player === 1) {
      setScoreP1(newValue);
    } else {
      setScoreP2(newValue);
    }
  };

  const quickSetWinner = (player: 1 | 2) => {
    if (player === 1) {
      setScoreP1(effectiveMaxScore);
      setScoreP2(Math.max(0, effectiveMaxScore - 1));
    } else {
      setScoreP2(effectiveMaxScore);
      setScoreP1(Math.max(0, effectiveMaxScore - 1));
    }
  };

  const isValidResult = () => {
    if (scoreP1 === scoreP2) return false;
    // If maxScore is not set, just require one player to win
    if (match.maxScore !== null) {
      if (scoreP1 !== effectiveMaxScore && scoreP2 !== effectiveMaxScore) return false;
    } else {
      // Without maxScore, just require different scores
      if (scoreP1 === scoreP2) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidResult()) {
      setError(match.maxScore !== null 
        ? 'Один гравець має набрати максимальну кількість очок' 
        : 'Рахунок не може бути рівним');
      return;
    }

    // For edit mode, show confirmation if needed
    if (mode === 'edit' && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (mode === 'finish') {
        await finishMatch(match.id, {
          player1Score: scoreP1,
          player2Score: scoreP2,
        });
      } else {
        await editMatchResult(match.id, {
          player1Score: scoreP1,
          player2Score: scoreP2,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження результату');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const winner = scoreP1 > scoreP2 ? 1 : scoreP2 > scoreP1 ? 2 : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'finish' ? 'Завершити матч' : 'Редагувати результат'}
            </h2>
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

          {/* Warning for edit mode */}
          {mode === 'edit' && !showConfirmation && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-orange-800">Увага!</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Редагування результату скине всі наступні матчі в сітці
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Confirmation */}
          {showConfirmation ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Ви впевнені?
                </h3>
                <p className="text-sm text-gray-700">
                  Зміна результату <span className="font-bold">скине всі залежні матчі</span> у турнірній сітці.
                  Ця операція може вплинути на кілька матчів.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                >
                  Відміна
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors font-medium"
                >
                  {loading ? 'Збереження...' : 'Так, підтверджую'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Match Info */}
              <div className="text-center text-sm text-gray-600 mb-4">
                Матч #{match.matchNumber} • До {match.maxScore} очок
              </div>

              {/* Score Input */}
              <div className="space-y-4">
                {/* Player 1 */}
                <div className={`p-4 rounded-lg border-2 transition-all ${winner === 1 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{match.player1Name}</div>
                      <div className="text-xs text-gray-500">Гравець 1</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickSetWinner(1)}
                      className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                    >
                      Переміг
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScoreChange(1, scoreP1 - 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-gray-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={scoreP1}
                      onChange={(e) => handleScoreChange(1, parseInt(e.target.value) || 0)}
                      min="0"
                      max={match.maxScore ?? undefined}
                      className="flex-1 text-center text-3xl font-bold py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => handleScoreChange(1, scoreP1 + 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="text-center text-gray-400 font-bold">VS</div>

                {/* Player 2 */}
                <div className={`p-4 rounded-lg border-2 transition-all ${winner === 2 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{match.player2Name}</div>
                      <div className="text-xs text-gray-500">Гравець 2</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickSetWinner(2)}
                      className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                    >
                      Переміг
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScoreChange(2, scoreP2 - 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-gray-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={scoreP2}
                      onChange={(e) => handleScoreChange(2, parseInt(e.target.value) || 0)}
                      min="0"
                      max={match.maxScore ?? undefined}
                      className="flex-1 text-center text-3xl font-bold py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => handleScoreChange(2, scoreP2 + 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Message */}
              {!isValidResult() && (scoreP1 > 0 || scoreP2 > 0) && (
                <div className="text-center text-sm text-orange-600">
                  Один гравець має набрати {match.maxScore} очок
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={loading || !isValidResult()}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Збереження...' : mode === 'finish' ? '✓ Завершити' : '✓ Зберегти'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

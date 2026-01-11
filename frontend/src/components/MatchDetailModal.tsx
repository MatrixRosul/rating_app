'use client';

import { TournamentMatch } from '@/types';

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: TournamentMatch;
  onEdit?: () => void;
}

export default function MatchDetailModal({
  isOpen,
  onClose,
  match,
  onEdit,
}: MatchDetailModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    const badges = {
      pending: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: 'Очікує',
        emoji: '⏳',
      },
      in_progress: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'В процесі',
        emoji: '🎮',
      },
      finished: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        label: 'Завершено',
        emoji: '✅',
      },
    };

    const badge = badges[match.status];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <span>{badge.emoji}</span>
        {badge.label}
      </span>
    );
  };

  const winner = match.player1Score > match.player2Score ? 1 : match.player2Score > match.player1Score ? 2 : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Деталі матчу #{match.matchNumber}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{match.roundName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Статус:</span>
            {getStatusBadge()}
          </div>

          {/* Players & Score */}
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Player 1 */}
              <div className={`text-center p-4 rounded-lg ${winner === 1 ? 'bg-white shadow-md ring-2 ring-emerald-500' : 'bg-white/50'}`}>
                <div className="mb-2">
                  {winner === 1 && <span className="text-3xl">👑</span>}
                </div>
                <div className="font-bold text-lg text-gray-900 mb-1">
                  {match.player1Name}
                </div>
                <div className="text-sm text-gray-600 mb-3">Гравець 1</div>
                <div className={`text-4xl font-bold ${winner === 1 ? 'text-emerald-600' : 'text-gray-700'}`}>
                  {match.player1Score}
                </div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="text-xs text-gray-500 mt-2">До {match.maxScore} очок</div>
              </div>

              {/* Player 2 */}
              <div className={`text-center p-4 rounded-lg ${winner === 2 ? 'bg-white shadow-md ring-2 ring-emerald-500' : 'bg-white/50'}`}>
                <div className="mb-2">
                  {winner === 2 && <span className="text-3xl">👑</span>}
                </div>
                <div className="font-bold text-lg text-gray-900 mb-1">
                  {match.player2Name}
                </div>
                <div className="text-sm text-gray-600 mb-3">Гравець 2</div>
                <div className={`text-4xl font-bold ${winner === 2 ? 'text-emerald-600' : 'text-gray-700'}`}>
                  {match.player2Score}
                </div>
              </div>
            </div>
          </div>

          {/* Match Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table */}
            {match.tableName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎱</span>
                  <span className="text-sm font-medium text-gray-600">Стіл:</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">{match.tableName}</div>
              </div>
            )}

            {/* Video URL */}
            {match.videoUrl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📹</span>
                  <span className="text-sm font-medium text-gray-600">Відео:</span>
                </div>
                <a
                  href={match.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium truncate block"
                >
                  {match.videoUrl}
                </a>
              </div>
            )}

            {/* Started At */}
            {match.startedAt && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🚀</span>
                  <span className="text-sm font-medium text-gray-600">Початок:</span>
                </div>
                <div className="text-sm text-gray-900">{formatDate(match.startedAt)}</div>
              </div>
            )}

            {/* Finished At */}
            {match.finishedAt && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🏁</span>
                  <span className="text-sm font-medium text-gray-600">Завершення:</span>
                </div>
                <div className="text-sm text-gray-900">{formatDate(match.finishedAt)}</div>
              </div>
            )}

            {/* Created At */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📅</span>
                <span className="text-sm font-medium text-gray-600">Створено:</span>
              </div>
              <div className="text-sm text-gray-900">{formatDate(match.createdAt)}</div>
            </div>

            {/* Updated At */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🔄</span>
                <span className="text-sm font-medium text-gray-600">Оновлено:</span>
              </div>
              <div className="text-sm text-gray-900">{formatDate(match.updatedAt)}</div>
            </div>
          </div>

          {/* Duration (if finished) */}
          {match.startedAt && match.finishedAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <div>
                  <div className="text-sm font-medium text-blue-900">Тривалість матчу</div>
                  <div className="text-lg font-bold text-blue-700">
                    {(() => {
                      const start = new Date(match.startedAt);
                      const end = new Date(match.finishedAt);
                      const diff = end.getTime() - start.getTime();
                      const minutes = Math.floor(diff / 60000);
                      const hours = Math.floor(minutes / 60);
                      const mins = minutes % 60;
                      return hours > 0 ? `${hours}год ${mins}хв` : `${mins}хв`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Закрити
            </button>
            {onEdit && match.status === 'finished' && (
              <button
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                ✏️ Редагувати результат
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

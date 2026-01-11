'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TournamentMatch, Table } from '@/types';
import { getTournamentMatches, updateLiveScore } from '@/lib/api/matches';
import { getTables } from '@/lib/api/tables';
import MatchList from '@/components/MatchList';
import StartMatchModal from '@/components/StartMatchModal';
import MatchResultForm from '@/components/MatchResultForm';
import MatchDetailModal from '@/components/MatchDetailModal';
import UpdateLiveScoreModal from '@/components/UpdateLiveScoreModal';
import TableManager from '@/components/TableManager';
import { useAuth } from '@/context/AuthContext';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

type ModalState = {
  type: 'start' | 'finish' | 'edit' | 'detail' | 'update_score' | null;
  match: TournamentMatch | null;
};

export default function MatchesPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = parseInt(params.id as string);
  const { isAdmin } = useAuth();

  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'matches' | 'tables'>('matches');
  const [modalState, setModalState] = useState<ModalState>({ type: null, match: null });
  const [finishingTournament, setFinishingTournament] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [matchesData, tablesData] = await Promise.all([
        getTournamentMatches(tournamentId),
        getTables(tournamentId),
      ]);

      setMatches(matchesData);
      setTables(tablesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: 'start' | 'finish' | 'edit' | 'detail', match: TournamentMatch) => {
    setModalState({ type, match });
  };

  const handleCloseModal = () => {
    setModalState({ type: null, match: null });
  };

  const handleModalSuccess = () => {
    loadData();
    handleCloseModal();
  };

  const handleUpdateLiveScore = async (matchId: number, player1Score: number, player2Score: number) => {
    try {
      await updateLiveScore(matchId, { player1Score, player2Score });
      await loadData();
    } catch (err) {
      console.error('Error updating live score:', err);
      throw err;
    }
  };

  const handleFinishTournament = async () => {
    try {
      setFinishingTournament(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Помилка завершення турніру');
      }

      const result = await response.json();
      
      // Success - redirect to results
      router.push(`/tournaments/${tournamentId}/results`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завершення турніру');
    } finally {
      setFinishingTournament(false);
      setShowFinishConfirm(false);
    }
  };

  const hasIncompleteMatches = matches.some(m => m.status === 'pending' || m.status === 'in_progress');

  const adminAccess = isAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎱</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Finish Tournament Button */}
      {adminAccess && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveSection('matches')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeSection === 'matches'
                  ? 'bg-white text-emerald-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎮 Матчі
            </button>
            <button
              onClick={() => setActiveSection('tables')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeSection === 'tables'
                  ? 'bg-white text-emerald-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎱 Столи
            </button>
          </div>

          {/* Finish Tournament Button */}
          <button
            onClick={() => setShowFinishConfirm(true)}
            disabled={hasIncompleteMatches || finishingTournament}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
              hasIncompleteMatches || finishingTournament
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:scale-105'
            }`}
            title={hasIncompleteMatches ? 'Завершіть всі матчі перед завершенням турніру' : 'Завершити турнір'}
          >
            {finishingTournament ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Завершення...
              </span>
            ) : (
              '🏆 Завершити турнір'
            )}
          </button>
        </div>
      )}

      {/* Section Tabs (for non-admin) */}
      {!adminAccess && (
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveSection('matches')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'matches'
                ? 'bg-white text-emerald-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎮 Матчі
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {activeSection === 'matches' ? (
        <MatchList
          matches={matches}
          tables={tables}
          isAdmin={adminAccess}
          onStartMatch={(match) => handleOpenModal('start', match)}
          onFinishMatch={(match) => handleOpenModal('finish', match)}
          onEditMatch={(match) => handleOpenModal('edit', match)}
          onViewDetails={(match) => handleOpenModal('detail', match)}
          onUpdateLiveScore={(match) => handleOpenModal('update_score', match)}
        />
      ) : (
        <TableManager tournamentId={tournamentId} />
      )}

      {/* Modals */}
      {modalState.match && (
        <>
          <StartMatchModal
            isOpen={modalState.type === 'start'}
            onClose={handleCloseModal}
            match={modalState.match}
            tables={tables}
            onSuccess={handleModalSuccess}
          />

          <UpdateLiveScoreModal
            match={modalState.type === 'update_score' ? modalState.match : null}
            onClose={handleCloseModal}
            onUpdate={handleUpdateLiveScore}
          />

          <MatchResultForm
            isOpen={modalState.type === 'finish' || modalState.type === 'edit'}
            onClose={handleCloseModal}
            match={modalState.match}
            onSuccess={handleModalSuccess}
            mode={modalState.type === 'edit' ? 'edit' : 'finish'}
          />

          <MatchDetailModal
            isOpen={modalState.type === 'detail'}
            onClose={handleCloseModal}
            match={modalState.match}
            onEdit={adminAccess ? () => handleOpenModal('edit', modalState.match!) : undefined}
          />
        </>
      )}

      {/* Finish Tournament Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Завершити турнір?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Ця дія розрахує фінальні місця та зміни рейтингу для всіх учасників. 
              Після завершення неможливо буде додати або змінити результати матчів.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-900 font-medium">
                ✓ Всі матчі завершені<br />
                ✓ Рейтинг буде перераховано автоматично<br />
                ✓ Місця будуть визначені за сіткою
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                disabled={finishingTournament}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                onClick={handleFinishTournament}
                disabled={finishingTournament}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {finishingTournament ? 'Завершення...' : 'Завершити'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

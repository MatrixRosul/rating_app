'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

type ModalState = {
  type: 'start' | 'finish' | 'edit' | 'detail' | 'update_score' | null;
  match: TournamentMatch | null;
};

export default function MatchesPage() {
  const params = useParams();
  const tournamentId = parseInt(params.id as string);
  const { isAdmin } = useAuth();

  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'matches' | 'tables'>('matches');
  const [modalState, setModalState] = useState<ModalState>({ type: null, match: null });

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
      {/* Section Tabs (only for admin) */}
      {adminAccess && (
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
    </div>
  );
}

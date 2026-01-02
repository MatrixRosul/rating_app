'use client';

import React, { useState } from 'react';
import TournamentList from './TournamentList';
import CreateTournamentModal from './CreateTournamentModal';

export default function TournamentView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <TournamentList
        key={refreshKey}
        onCreateClick={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreateTournamentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

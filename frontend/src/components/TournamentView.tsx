'use client';

import React from 'react';
import type { Player, Match } from '@/types';

interface TournamentViewProps {
  matches: Match[];
  players: Player[];
}

export default function TournamentView({ matches, players }: TournamentViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-4">
          <span className="text-6xl">🚧</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Турніри поки в розробці
        </h2>
        <p className="text-gray-600">
          Незабаром буде доступно
        </p>
      </div>
    </div>
  );
}

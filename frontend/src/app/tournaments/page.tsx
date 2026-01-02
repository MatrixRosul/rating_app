'use client';

import TournamentView from '@/components/TournamentView';

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TournamentView />
      </main>
    </div>
  );
}

'use client';

import TournamentView from '@/components/TournamentView';

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <TournamentView />
      </main>
    </div>
  );
}

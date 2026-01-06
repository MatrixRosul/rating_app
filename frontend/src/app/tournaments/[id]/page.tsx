'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TournamentPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  useEffect(() => {
    // Редірект на вкладку regulations за замовчуванням
    router.replace(`/tournaments/${tournamentId}/regulations`);
  }, [tournamentId, router]);

  return (
    <div className="p-6 text-center text-gray-500">
      Завантаження...
    </div>
  );
}

/**
 * GroupStage Component - PHASE 5
 * Displays Group Stage + Playoff bracket
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TournamentMatch } from '@/types';

interface GroupStageProps {
  matches: TournamentMatch[];
  tournamentId: number;
}

export default function GroupStage({ matches, tournamentId }: GroupStageProps) {
  const [activeTab, setActiveTab] = useState<'groups' | 'playoff'>('groups');
  
  const groupMatches = matches.filter(m => m.round.startsWith('Group'));
  const playoffMatches = matches.filter(m => m.round.startsWith('Playoff'));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-4">
          🏃‍♂️ Group Stage + Playoff
        </h2>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'groups' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Групи ({groupMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('playoff')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'playoff' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Плейоф ({playoffMatches.length})
          </button>
        </div>
      </div>
      
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {groupMatches.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Немає групових матчів</div>
          ) : (
            groupMatches.map((match) => (
              <div key={match.id} className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">{match.round}</div>
                <div className="flex justify-between items-center">
                  <Link href={`/player/${match.player1Id}`} className="hover:underline">
                    {match.player1Name}
                  </Link>
                  <div className="font-bold">{match.player1Score} : {match.player2Score}</div>
                  <Link href={`/player/${match.player2Id}`} className="hover:underline">
                    {match.player2Name}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {activeTab === 'playoff' && (
        <div className="space-y-4">
          {playoffMatches.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Плейоф ще не розпочався</div>
          ) : (
            playoffMatches.map((match) => (
              <div key={match.id} className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">{match.round}</div>
                <div className="flex justify-between items-center">
                  <div>{match.player1Name || 'TBD'}</div>
                  <div className="font-bold">{match.player1Score} : {match.player2Score}</div>
                  <div>{match.player2Name || 'TBD'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

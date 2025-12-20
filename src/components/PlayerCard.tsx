'use client';

import React from 'react';
import Link from 'next/link';
import { Player } from '@/types';
import { getRatingBand } from '@/utils/rating';

interface PlayerCardProps {
  player: Player;
  rank?: number;
  showRank?: boolean;
}

export default function PlayerCard({ player, rank, showRank = false }: PlayerCardProps) {
  const ratingBand = getRatingBand(player.rating);
  
  // Convert Tailwind color class to actual color value
  const getBorderColor = (colorClass: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-gray-500': '#6B7280',
      'bg-green-500': '#10B981', 
      'bg-cyan-500': '#06B6D4',
      'bg-blue-500': '#3B82F6',
      'bg-purple-500': '#8B5CF6',
      'bg-orange-500': '#F97316',
      'bg-orange-600': '#EA580C',
      'bg-red-500': '#EF4444'
    };
    return colorMap[colorClass] || '#6B7280';
  };

  return (
    <Link 
      href={`/player/${player.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border-l-4"
      style={{ borderLeftColor: getBorderColor(ratingBand.color) }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showRank && rank && (
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
              {rank}
            </div>
          )}
          
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${ratingBand.textColor} hover:opacity-80 transition-colors`}>
              {player.name}
            </h3>
            <p className="text-sm text-gray-500">
              {ratingBand.name}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xl font-bold ${ratingBand.textColor}`}>
            {player.rating}
          </div>
          <div className="text-sm text-gray-500">
            {player.matches.length} матчів
          </div>
        </div>
      </div>

      {/* Rating band indicator */}
      <div className="mt-3 flex items-center space-x-2">
        <div 
          className={`w-3 h-3 rounded-full ${ratingBand.color}`}
          title={ratingBand.name}
        ></div>
        <span className={`text-sm font-medium ${ratingBand.textColor}`}>
          {ratingBand.name}
        </span>
      </div>
    </Link>
  );
}

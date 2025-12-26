'use client';

import React from 'react';
import Link from 'next/link';
import { Player } from '@/types';
import { getRatingBand } from '@/utils/rating';

interface PlayerCardProps {
  player: Player & { peakRating?: number };
  rank?: number;
  showRank?: boolean;
  showPeakRating?: boolean; // Показувати пік рейтингу замість поточного
}

export default function PlayerCard({ player, rank, showRank = false, showPeakRating = false }: PlayerCardProps) {
  // Визначаємо який рейтинг показувати для кольору
  const displayRating = showPeakRating && player.peakRating ? player.peakRating : player.rating;
  const ratingBand = getRatingBand(displayRating);
  const peakRatingBand = player.peakRating ? getRatingBand(player.peakRating) : null;
  
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
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-3 border-l-4"
      style={{ borderLeftColor: getBorderColor(ratingBand.color) }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showRank && rank && (
            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
              {rank}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className={`font-semibold text-base ${ratingBand.textColor} hover:opacity-80 transition-colors`}>
                {player.name}
              </h3>
              {player.isCMS && (
                <span className="text-amber-600 text-sm font-bold" title="Кандидат у Майстри Спорту">
                  🏆
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {[
                ratingBand.name,
                player.city,
                player.yearOfBirth && `${player.yearOfBirth} р.н.`
              ].filter(Boolean).join(' • ')}
            </p>
          </div>
        </div>

        <div className="text-right">
          {showPeakRating && player.peakRating ? (
            <>
              <div className={`text-lg font-bold ${ratingBand.textColor}`}>
                {player.peakRating}
              </div>
              <div className="text-xs text-gray-500">
                пік рейтингу
              </div>
              {player.peakRating !== player.rating && (
                <div className="text-xs text-gray-400 mt-0.5">
                  зараз: {player.rating}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={`text-lg font-bold ${ratingBand.textColor}`}>
                {player.rating}
              </div>
              <div className="text-xs text-gray-500">
                {player.matches.length} матчів
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rating band indicator */}
      <div className="mt-2 flex items-center space-x-2">
        <div 
          className={`w-2 h-2 rounded-full ${ratingBand.color}`}
          title={ratingBand.name}
        ></div>
        <span className={`text-xs font-medium ${ratingBand.textColor}`}>
          {ratingBand.name}
        </span>
      </div>
    </Link>
  );
}

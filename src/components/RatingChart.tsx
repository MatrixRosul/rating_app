'use client';

import React from 'react';
import { Player, Match } from '@/types';
import { getRatingBand } from '@/utils/rating';

interface RatingPoint {
  date: Date;
  rating: number;
  matchId?: string;
  tournamentId?: string; // Додано для майбутньої підтримки турнірів
  reason: 'match' | 'tournament' | 'initial';
}

interface RatingChartProps {
  player: Player;
  matches: Match[];
  className?: string;
}

// Кольорові зони рейтингу (як в Codeforces)
const RATING_BANDS = [
  { min: 0, max: 1199, color: '#808080', name: 'Newbie' },
  { min: 1200, max: 1399, color: '#008000', name: 'Pupil' },
  { min: 1400, max: 1599, color: '#03a89e', name: 'Specialist' },
  { min: 1600, max: 1899, color: '#0000ff', name: 'Expert' },
  { min: 1900, max: 2099, color: '#a0a', name: 'Candidate Master' },
  { min: 2100, max: 2299, color: '#ff8c00', name: 'Master' },
  { min: 2300, max: 2399, color: '#ff8c00', name: 'International Master' },
  { min: 2400, max: 4000, color: '#ff0000', name: 'Grandmaster' },
];

export default function RatingChart({ player, matches, className = '' }: RatingChartProps) {
  // Створюємо історію рейтингу
  const createRatingHistory = (): RatingPoint[] => {
    const history: RatingPoint[] = [];
    
    // Початковий рейтинг
    history.push({
      date: player.createdAt || new Date(),
      rating: 1100, // Початковий рейтинг для всіх гравців
      reason: 'initial'
    });

    // Отримуємо матчі гравця і сортуємо по даті
    const playerMatches = matches
      .filter(match => match.player1Id === player.id || match.player2Id === player.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentRating = 1100;

    playerMatches.forEach(match => {
      // Знаходимо зміну рейтингу для цього гравця
      const ratingChange = match.player1Id === player.id ? match.player1RatingChange : match.player2RatingChange;
      currentRating += ratingChange;
      
      history.push({
        date: new Date(match.date),
        rating: currentRating,
        matchId: match.id,
        reason: 'match'
      });
    });

    // TODO: Додати підтримку турнірів
    // В майбутньому тут можна буде додати:
    // history.push({
    //   date: tournament.date,
    //   rating: newRating,
    //   tournamentId: tournament.id,
    //   reason: 'tournament'
    // });

    return history;
  };

  const ratingHistory = createRatingHistory();
  
  if (ratingHistory.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Графік рейтингу</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Недостатньо даних для побудови графіка</p>
          <p className="text-sm mt-1">Зіграйте кілька матчів, щоб побачити графік</p>
        </div>
      </div>
    );
  }

  // Знаходимо мінімальний і максимальний рейтинг для масштабування
  const minRating = Math.min(...ratingHistory.map(p => p.rating));
  const maxRating = Math.max(...ratingHistory.map(p => p.rating));
  const ratingRange = maxRating - minRating;
  const padding = Math.max(50, ratingRange * 0.1); // Додаємо відступи

  const chartMinRating = Math.max(0, minRating - padding);
  const chartMaxRating = maxRating + padding;
  const chartRatingRange = chartMaxRating - chartMinRating;

  // Створюємо SVG координати
  const svgWidth = 800;
  const svgHeight = 400;
  const chartWidth = svgWidth - 100; // Відступи для осей
  const chartHeight = svgHeight - 80;
  const chartLeft = 60;
  const chartTop = 20;

  // Функції для конвертації координат
  const xScale = (index: number) => chartLeft + (index / (ratingHistory.length - 1)) * chartWidth;
  const yScale = (rating: number) => chartTop + chartHeight - ((rating - chartMinRating) / chartRatingRange) * chartHeight;

  // Створюємо шлях для лінії графіка
  const linePath = ratingHistory
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(index)} ${yScale(point.rating)}`)
    .join(' ');

  // Створюємо горизонтальні лінії для рівнів рейтингу
  const ratingLevels = RATING_BANDS.filter(band => 
    band.min < chartMaxRating && band.max > chartMinRating
  );

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Графік рейтингу</h3>
      
      <div className="relative overflow-x-auto">
        <svg 
          width={svgWidth} 
          height={svgHeight} 
          className="border border-gray-200 rounded min-w-full md:min-w-0"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Фонові зони рейтингу */}
          {ratingLevels.map((band, index) => {
            const bandTop = Math.max(band.min, chartMinRating);
            const bandBottom = Math.min(band.max, chartMaxRating);
            
            return (
              <rect
                key={index}
                x={chartLeft}
                y={yScale(bandBottom)}
                width={chartWidth}
                height={yScale(bandTop) - yScale(bandBottom)}
                fill={band.color}
                fillOpacity={0.1}
                stroke={band.color}
                strokeOpacity={0.3}
                strokeWidth={0.5}
              />
            );
          })}

          {/* Горизонтальні лінії сітки */}
          {ratingLevels.map((band, index) => (
            <g key={`grid-${index}`}>
              {[band.min, band.max].filter(rating => rating > chartMinRating && rating < chartMaxRating).map(rating => (
                <line
                  key={rating}
                  x1={chartLeft}
                  y1={yScale(rating)}
                  x2={chartLeft + chartWidth}
                  y2={yScale(rating)}
                  stroke={band.color}
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              ))}
            </g>
          ))}

          {/* Лінія графіка */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Точки на графіку */}
          {ratingHistory.map((point, index) => {
            const ratingBand = getRatingBand(point.rating);
            return (
              <circle
                key={index}
                cx={xScale(index)}
                cy={yScale(point.rating)}
                r={point.reason === 'tournament' ? 6 : 4} // Турніри будуть більшими точками
                fill={ratingBand.color}
                stroke="#fff"
                strokeWidth={2}
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{`${point.date.toLocaleDateString('uk-UA')}: ${point.rating} (${point.reason === 'match' ? 'Матч' : point.reason === 'tournament' ? 'Турнір' : 'Початок'})`}</title>
              </circle>
            );
          })}

          {/* Вісь Y (рейтинг) */}
          <line
            x1={chartLeft}
            y1={chartTop}
            x2={chartLeft}
            y2={chartTop + chartHeight}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Вісь X (час) */}
          <line
            x1={chartLeft}
            y1={chartTop + chartHeight}
            x2={chartLeft + chartWidth}
            y2={chartTop + chartHeight}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Підписи рейтингу */}
          {ratingLevels.map((band, index) => (
            <text
              key={`label-${index}`}
              x={chartLeft - 10}
              y={yScale(band.min) + 4}
              textAnchor="end"
              fontSize="12"
              fill={band.color}
              fontWeight="600"
            >
              {band.min}
            </text>
          ))}

          {/* Поточний рейтинг */}
          <text
            x={chartLeft - 10}
            y={yScale(player.rating) + 4}
            textAnchor="end"
            fontSize="14"
            fill="#1f2937"
            fontWeight="bold"
          >
            {player.rating}
          </text>
        </svg>

        {/* Легенда рівнів */}
        <div className="mt-4 flex flex-wrap gap-3">
          {RATING_BANDS.map((band, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: band.color }}
              />
              <span className="text-sm text-gray-600">
                {band.name} ({band.min}-{band.max === 4000 ? '∞' : band.max})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

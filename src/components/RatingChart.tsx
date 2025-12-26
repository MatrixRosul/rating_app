'use client';

import React, { useState } from 'react';
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
  players?: Player[]; // потрібні для виводу імен суперників у тултипі
  className?: string;
}

// Кольорові зони рейтингу (як в Codeforces)
const RATING_BANDS = [
  { min: 0, max: 1199, color: '#808080', name: 'Newbie' },
  { min: 1200, max: 1399, color: '#008000', name: 'Pupil' },
  { min: 1400, max: 1599, color: '#03A89E', name: 'Specialist' },
  { min: 1600, max: 1799, color: '#0000FF', name: 'Expert' },
  { min: 1800, max: 2299, color: '#AA00AA', name: 'Candidate Master' },
  { min: 2300, max: 2499, color: '#FF8C00', name: 'Master' },
  { min: 2500, max: 9999, color: '#FF0000', name: 'Grandmaster' },
];

export default function RatingChart({ player, matches, players = [], className = '' }: RatingChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Створюємо історію рейтингу
  const createRatingHistory = (): RatingPoint[] => {
    const history: RatingPoint[] = [];
    
    // Отримуємо матчі гравця і сортуємо по даті
    const playerMatches = matches
      .filter(match => match.player1Id === player.id || match.player2Id === player.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Початковий рейтинг прив'язуємо до першої дати, щоб уникнути фальшивого поточного року
    const createdAtDate = player.createdAt ? new Date(player.createdAt) : null;
    const firstMatchDate = playerMatches[0] ? new Date(playerMatches[0].date) : null;
    const initialDate = createdAtDate && firstMatchDate
      ? (createdAtDate <= firstMatchDate ? createdAtDate : firstMatchDate)
      : (createdAtDate || firstMatchDate || new Date());

    // 🔥 Використовуємо калібрований рейтинг якщо є, інакше 1300
    const startingRating = player.initialRating ?? 1300;

    history.push({
      date: initialDate,
      rating: startingRating, // Початковий рейтинг (калібрований або 1300)
      reason: 'initial'
    });

    playerMatches.forEach(match => {
      // Беремо рейтинг після матчу напряму з даних матчу (не накопичуємо зміни)
      const ratingAfter = match.player1Id === player.id ? match.player1RatingAfter : match.player2RatingAfter;
      
      history.push({
        date: new Date(match.date),
        rating: ratingAfter,
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

  // Знаходимо наступний рівень (band) для поточного рейтингу
  const currentBand = getRatingBand(player.rating);
  const nextBand = RATING_BANDS.find(band => band.min > player.rating);
  
  // Розширюємо діапазон графіка, щоб показати наступний рівень
  const chartMinRating = Math.max(0, minRating - padding);
  const chartMaxRating = nextBand 
    ? Math.max(maxRating + padding, nextBand.min + 100) // Додаємо 100 вище наступного порогу
    : maxRating + padding;
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

  // Роки на осі X: використовуємо перший матч кожного року
  const years = Array.from(new Set(ratingHistory.map(p => new Date(p.date).getFullYear()))).sort((a, b) => a - b);
  const yearPositions = years
    .map(year => {
      const firstPointIdx = ratingHistory.findIndex(p => new Date(p.date).getFullYear() === year);
      if (firstPointIdx === -1) return null;
      return { year, x: xScale(firstPointIdx) };
    })
    .filter((p): p is { year: number; x: number } => p !== null);

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

          {/* Точки на графіку з тултипом */}
          {ratingHistory.map((point, index) => {
            const ratingBand = getRatingBand(point.rating);
            return (
              <circle
                key={index}
                cx={xScale(index)}
                cy={yScale(point.rating)}
                r={hoveredIndex === index ? 7 : point.reason === 'tournament' ? 6 : 4}
                fill={ratingBand.color}
                stroke="#fff"
                strokeWidth={2}
                className="transition-all cursor-pointer hover:opacity-80"
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                  const rect = (e.target as SVGCircleElement).getBoundingClientRect();
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              />
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

          {/* Вертикальні мітки років */}
          {yearPositions.map((pos, idx) => (
            <g key={`year-${idx}`}>
              <line
                x1={pos.x}
                y1={chartTop + chartHeight}
                x2={pos.x}
                y2={chartTop + chartHeight + 6}
                stroke="#9ca3af"
                strokeWidth={1}
              />
              <text
                x={pos.x}
                y={chartTop + chartHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
                fontWeight="500"
              >
                {pos.year}
              </text>
            </g>
          ))}

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
          
          {/* Наступний рівень (ціль) */}
          {nextBand && (
            <>
              {/* Горизонтальна пунктирна лінія для наступного рівня */}
              <line
                x1={chartLeft}
                y1={yScale(nextBand.min)}
                x2={chartLeft + chartWidth}
                y2={yScale(nextBand.min)}
                stroke={nextBand.color}
                strokeWidth={2}
                strokeDasharray="6,4"
                opacity={0.7}
              />
              {/* Підпис наступного рівня */}
              <text
                x={chartLeft + chartWidth + 10}
                y={yScale(nextBand.min) + 4}
                textAnchor="start"
                fontSize="13"
                fill={nextBand.color}
                fontWeight="700"
              >
                {nextBand.min} ▶ {nextBand.name}
              </text>
            </>
          )}
        </svg>

        {/* Тултип матчу */}
        {hoveredIndex !== null && ratingHistory[hoveredIndex]?.matchId && (
          <div
            className="fixed bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-xs z-50 pointer-events-none"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: 'translate(-50%, -100%)',
              minWidth: '200px'
            }}
          >
            {(() => {
              const point = ratingHistory[hoveredIndex];
              const matchData = matches.find(m => m.id === point.matchId);
              if (!matchData) return null;

              const isP1 = matchData.player1Id === player.id;
              const opponentId = isP1 ? matchData.player2Id : matchData.player1Id;
              const opponent = players.find(p => p.id === opponentId);
              const opponentName = opponent ? opponent.name : 'Суперник';

              const ratingChange = isP1 ? matchData.player1RatingChange : matchData.player2RatingChange;
              const playerScore = isP1 ? matchData.player1Score : matchData.player2Score;
              const opponentScore = isP1 ? matchData.player2Score : matchData.player1Score;
              const matchDate = new Date(matchData.date).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div className="space-y-1 text-center">
                  <div className="text-yellow-300 font-semibold text-xs border-b border-gray-700 pb-1">
                    vs {opponentName}
                  </div>
                  <div className="text-white font-semibold text-sm">
                    {playerScore}:{opponentScore}
                  </div>
                  <div className={`font-bold text-base ${ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ratingChange > 0 ? '+' : ''}{ratingChange}
                  </div>
                  <div className="text-blue-300 font-semibold text-sm border-t border-gray-700 pt-1">
                    Рейтинг: {point.rating}
                  </div>
                  <div className="text-gray-300 text-xs">
                    {matchDate}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

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

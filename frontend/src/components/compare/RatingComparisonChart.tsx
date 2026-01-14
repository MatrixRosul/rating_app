'use client';

import type { Player, Match } from '@/types';
import { useMemo } from 'react';
import { getRatingBand } from '@/utils/rating';

interface RatingComparisonChartProps {
  player1: Player;
  player2: Player;
  player1Matches: Match[];
  player2Matches: Match[];
}

export default function RatingComparisonChart({
  player1,
  player2,
  player1Matches,
  player2Matches
}: RatingComparisonChartProps) {
  const band1 = getRatingBand(player1.rating);
  const band2 = getRatingBand(player2.rating);

  const chartData = useMemo(() => {
    // Build rating history for both players
    const p1History = [{
      date: player1.createdAt,
      rating: player1.initialRating || 1500,
      matchNumber: 0
    }];

    player1Matches.forEach((match, index) => {
      const ratingAfter = match.player1Id === player1.id 
        ? match.player1RatingAfter 
        : match.player2RatingAfter;
      p1History.push({
        date: match.date,
        rating: ratingAfter,
        matchNumber: index + 1
      });
    });

    const p2History = [{
      date: player2.createdAt,
      rating: player2.initialRating || 1500,
      matchNumber: 0
    }];

    player2Matches.forEach((match, index) => {
      const ratingAfter = match.player1Id === player2.id 
        ? match.player1RatingAfter 
        : match.player2RatingAfter;
      p2History.push({
        date: match.date,
        rating: ratingAfter,
        matchNumber: index + 1
      });
    });

    // Find min/max ratings for scaling
    const allRatings = [...p1History, ...p2History].map(h => h.rating);
    const minRating = Math.floor(Math.min(...allRatings) / 100) * 100;
    const maxRating = Math.ceil(Math.max(...allRatings) / 100) * 100;
    const maxMatches = Math.max(p1History.length, p2History.length);

    return {
      p1History,
      p2History,
      minRating,
      maxRating,
      maxMatches
    };
  }, [player1, player2, player1Matches, player2Matches]);

  const { p1History, p2History, minRating, maxRating, maxMatches } = chartData;

  // SVG dimensions
  const width = 1000;
  const height = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (matchNumber: number) => {
    return padding.left + (matchNumber / (maxMatches - 1 || 1)) * chartWidth;
  };

  const scaleY = (rating: number) => {
    const range = maxRating - minRating || 100;
    return padding.top + chartHeight - ((rating - minRating) / range) * chartHeight;
  };

  // Generate path for player
  const generatePath = (history: typeof p1History) => {
    if (history.length === 0) return '';
    
    const points = history.map((h, i) => {
      const x = scaleX(i);
      const y = scaleY(h.rating);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return points.join(' ');
  };

  // Y-axis ticks
  const yTicks = [];
  const tickCount = 6;
  const tickStep = (maxRating - minRating) / (tickCount - 1);
  for (let i = 0; i < tickCount; i++) {
    const value = Math.round(minRating + tickStep * i);
    yTicks.push(value);
  }

  // X-axis ticks
  const xTicks = [];
  const xTickCount = Math.min(10, maxMatches);
  const xTickStep = Math.floor((maxMatches - 1) / (xTickCount - 1)) || 1;
  for (let i = 0; i < maxMatches; i += xTickStep) {
    xTicks.push(i);
  }
  if (xTicks[xTicks.length - 1] !== maxMatches - 1) {
    xTicks.push(maxMatches - 1);
  }

  const player1Color = band1.textColor.replace('text-', '');
  const player2Color = band2.textColor.replace('text-', '');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Динаміка рейтингу
      </h2>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#2563eb' }}
          />
          <span className="text-sm font-medium text-gray-700">{player1.name}</span>
          <span className="text-sm font-bold text-blue-600">
            ({player1.rating})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#ea580c' }}
          />
          <span className="text-sm font-medium text-gray-700">{player2.name}</span>
          <span className="text-sm font-bold text-orange-600">
            ({player2.rating})
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ maxHeight: '500px' }}
        >
          {/* Grid lines */}
          {yTicks.map(tick => {
            const y = scaleY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X-axis ticks */}
          {xTicks.map(tick => {
            const x = scaleX(tick);
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={height - padding.bottom}
                  x2={x}
                  y2={height - padding.bottom + 5}
                  stroke="#6b7280"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Player 1 line */}
          <path
            d={generatePath(p1History)}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
            style={{ stroke: '#2563eb' }}
          />

          {/* Player 1 points */}
          {p1History.map((h, i) => (
            <circle
              key={`p1-${i}`}
              cx={scaleX(i)}
              cy={scaleY(h.rating)}
              r="5"
              className="stroke-white"
              strokeWidth="2"
              style={{ fill: '#2563eb' }}
            />
          ))}

          {/* Player 2 line */}
          <path
            d={generatePath(p2History)}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
            style={{ stroke: '#ea580c' }}
          />

          {/* Player 2 points */}
          {p2History.map((h, i) => (
            <circle
              key={`p2-${i}`}
              cx={scaleX(i)}
              cy={scaleY(h.rating)}
              r="5"
              className="stroke-white"
              strokeWidth="2"
              style={{ fill: '#ea580c' }}
            />
          ))}

          {/* Axis labels */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#374151"
          >
            Номер матчу
          </text>
          <text
            x={15}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#374151"
            transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
          >
            Рейтинг
          </text>
        </svg>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Початковий рейтинг</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {p1History[0].rating}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-lg font-bold text-orange-600">
              {p2History[0].rating}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Поточний рейтинг</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {player1.rating}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-lg font-bold text-orange-600">
              {player2.rating}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Зміна рейтингу</div>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-lg font-bold ${player1.rating >= p1History[0].rating ? 'text-green-600' : 'text-red-600'}`}>
              {player1.rating >= p1History[0].rating ? '+' : ''}{player1.rating - p1History[0].rating}
            </span>
            <span className="text-gray-400">|</span>
            <span className={`text-lg font-bold ${player2.rating >= p2History[0].rating ? 'text-green-600' : 'text-red-600'}`}>
              {player2.rating >= p2History[0].rating ? '+' : ''}{player2.rating - p2History[0].rating}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Зіграно матчів</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {p1History.length - 1}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-lg font-bold text-blue-600">
              {p2History.length - 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

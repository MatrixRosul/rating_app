'use client';

import type { Player, Match } from '@/types';
import { useMemo } from 'react';
import { getRatingBand } from '@/utils/rating';

interface SpiderChartProps {
  player1: Player;
  player2: Player;
  player1Matches: Match[];
  player2Matches: Match[];
}

interface MetricData {
  label: string;
  value1: number;
  value2: number;
  max: number;
}

export default function SpiderChart({
  player1,
  player2,
  player1Matches,
  player2Matches
}: SpiderChartProps) {
  const band1 = getRatingBand(player1.rating);
  const band2 = getRatingBand(player2.rating);

  const metrics = useMemo(() => {
    // Calculate stats for both players
    const p1Wins = player1Matches.filter(m => m.winnerId === player1.id).length;
    const p1WinRate = player1Matches.length > 0 ? (p1Wins / player1Matches.length * 100) : 0;
    
    const p2Wins = player2Matches.filter(m => m.winnerId === player2.id).length;
    const p2WinRate = player2Matches.length > 0 ? (p2Wins / player2Matches.length * 100) : 0;

    // Recent form (last 5 matches)
    const p1RecentMatches = [...player1Matches].reverse().slice(0, 5);
    const p1RecentWins = p1RecentMatches.filter(m => m.winnerId === player1.id).length;
    const p1RecentForm = p1RecentMatches.length > 0 ? (p1RecentWins / p1RecentMatches.length * 100) : 0;

    const p2RecentMatches = [...player2Matches].reverse().slice(0, 5);
    const p2RecentWins = p2RecentMatches.filter(m => m.winnerId === player2.id).length;
    const p2RecentForm = p2RecentMatches.length > 0 ? (p2RecentWins / p2RecentMatches.length * 100) : 0;

    // Experience (number of matches)
    const maxMatches = Math.max(player1Matches.length, player2Matches.length, 100);

    return [
      {
        label: 'Рейтинг',
        value1: player1.rating,
        value2: player2.rating,
        max: Math.max(player1.rating, player2.rating, player1.peakRating || 0, player2.peakRating || 0) * 1.1
      },
      {
        label: 'Win Rate',
        value1: p1WinRate,
        value2: p2WinRate,
        max: 100
      },
      {
        label: 'Форма',
        value1: p1RecentForm,
        value2: p2RecentForm,
        max: 100
      },
      {
        label: 'Досвід',
        value1: player1Matches.length,
        value2: player2Matches.length,
        max: maxMatches
      },
      {
        label: 'Пік',
        value1: player1.peakRating || player1.rating,
        value2: player2.peakRating || player2.rating,
        max: Math.max(player1.peakRating || 0, player2.peakRating || 0, player1.rating, player2.rating) * 1.1
      }
    ];
  }, [player1, player2, player1Matches, player2Matches]);

  // SVG dimensions
  const size = 400;
  const center = size / 2;
  const maxRadius = size / 2 - 60;
  const levels = 5;
  const angleStep = (Math.PI * 2) / metrics.length;

  // Calculate point position
  const getPoint = (value: number, max: number, index: number) => {
    const normalizedValue = (value / max) * maxRadius;
    const angle = angleStep * index - Math.PI / 2;
    const x = center + normalizedValue * Math.cos(angle);
    const y = center + normalizedValue * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon path
  const getPolygonPath = (values: number[]) => {
    const points = values.map((value, index) => {
      const max = metrics[index].max;
      return getPoint(value, max, index);
    });
    
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  const player1Values = metrics.map(m => m.value1);
  const player2Values = metrics.map(m => m.value2);

  // Фіксовані кольори для кращої видимості незалежно від звання
  const color1 = '#2563eb'; // Синій для гравця 1
  const color2 = '#ea580c'; // Помаранчевий для гравця 2

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Порівняння характеристик
      </h2>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: color1 }}
          />
          <span className="text-sm font-medium text-gray-700">{player1.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: color2 }}
          />
          <span className="text-sm font-medium text-gray-700">{player2.name}</span>
        </div>
      </div>

      {/* Spider Chart */}
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circles */}
          {Array.from({ length: levels }).map((_, i) => {
            const radius = (maxRadius / levels) * (i + 1);
            return (
              <circle
                key={`level-${i}`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines and labels */}
          {metrics.map((metric, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const endX = center + maxRadius * Math.cos(angle);
            const endY = center + maxRadius * Math.sin(angle);
            const labelX = center + (maxRadius + 35) * Math.cos(angle);
            const labelY = center + (maxRadius + 35) * Math.sin(angle);

            return (
              <g key={`axis-${index}`}>
                <line
                  x1={center}
                  y1={center}
                  x2={endX}
                  y2={endY}
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#374151"
                >
                  {metric.label}
                </text>
              </g>
            );
          })}

          {/* Player 2 polygon (behind) */}
          <path
            d={getPolygonPath(player2Values)}
            fill={color2}
            fillOpacity="0.25"
            stroke={color2}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Player 2 points */}
          {player2Values.map((value, index) => {
            const point = getPoint(value, metrics[index].max, index);
            return (
              <circle
                key={`p2-point-${index}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={color2}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Player 1 polygon (front) */}
          <path
            d={getPolygonPath(player1Values)}
            fill={color1}
            fillOpacity="0.25"
            stroke={color1}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Player 1 points */}
          {player1Values.map((value, index) => {
            const point = getPoint(value, metrics[index].max, index);
            return (
              <circle
                key={`p1-point-${index}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={color1}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      {/* Metric values */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-600 mb-1">{metric.label}</div>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-bold" style={{ color: color1 }}>
                {metric.label === 'Win Rate' || metric.label === 'Форма' 
                  ? `${metric.value1.toFixed(0)}%` 
                  : Math.round(metric.value1)}
              </div>
              <div className="text-sm font-bold" style={{ color: color2 }}>
                {metric.label === 'Win Rate' || metric.label === 'Форма'
                  ? `${metric.value2.toFixed(0)}%`
                  : Math.round(metric.value2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { getRatingBand } from '@/utils/rating';
import type { Player } from '@/types';

interface DisciplineStats {
  free_pyramid: number;
  dynamic_pyramid: number;
  combined_pyramid: number;
  free_pyramid_extended: number;
  combined_pyramid_changes: number;
}

interface DisciplineComparisonChartProps {
  player1: Player;
  player2: Player;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function DisciplineComparisonChart({
  player1,
  player2
}: DisciplineComparisonChartProps) {
  const [stats1, setStats1] = useState<DisciplineStats | null>(null);
  const [stats2, setStats2] = useState<DisciplineStats | null>(null);
  const [loading, setLoading] = useState(true);

  const band1 = getRatingBand(player1.rating);
  const band2 = getRatingBand(player2.rating);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [response1, response2] = await Promise.all([
          fetch(`${API_URL}/api/players/${player1.id}/discipline-stats`),
          fetch(`${API_URL}/api/players/${player2.id}/discipline-stats`)
        ]);

        if (response1.ok) {
          const data1 = await response1.json();
          setStats1(data1);
        }

        if (response2.ok) {
          const data2 = await response2.json();
          setStats2(data2);
        }
      } catch (error) {
        console.error('Error fetching discipline stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [player1.id, player2.id]);

  const disciplines = useMemo(() => [
    { 
      key: 'free_pyramid' as keyof DisciplineStats, 
      label: 'Вільна',
      shortLabel: 'ВП'
    },
    { 
      key: 'dynamic_pyramid' as keyof DisciplineStats, 
      label: 'Динамічна',
      shortLabel: 'ДП'
    },
    { 
      key: 'combined_pyramid' as keyof DisciplineStats, 
      label: 'Комбінована',
      shortLabel: 'КП'
    },
    { 
      key: 'free_pyramid_extended' as keyof DisciplineStats, 
      label: 'Вільна+',
      shortLabel: 'ВП+'
    },
    { 
      key: 'combined_pyramid_changes' as keyof DisciplineStats, 
      label: 'Комб. зі змінами',
      shortLabel: 'КПЗ'
    }
  ], []);

  // Фіксовані кольори для кращої видимості незалежно від звання
  const color1 = '#2563eb'; // Синій для гравця 1
  const color2 = '#ea580c'; // Помаранчевий для гравця 2

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-gray-600 font-medium">Завантаження статистики дисциплін...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats1 && !stats2) {
    return null;
  }

  // SVG dimensions
  const size = 400;
  const center = size / 2;
  const maxRadius = size / 2 - 60;
  const levels = 5;
  const angleStep = (Math.PI * 2) / disciplines.length;

  // Calculate point position
  const getPoint = (value: number, index: number) => {
    const normalizedValue = (value / 100) * maxRadius;
    const angle = angleStep * index - Math.PI / 2;
    const x = center + normalizedValue * Math.cos(angle);
    const y = center + normalizedValue * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon path
  const getPolygonPath = (stats: DisciplineStats | null) => {
    if (!stats) return '';
    
    const points = disciplines.map((d, index) => {
      const value = stats[d.key] || 0;
      return getPoint(value, index);
    });
    
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Порівняння по дисциплінах
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
          {disciplines.map((discipline, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const endX = center + maxRadius * Math.cos(angle);
            const endY = center + maxRadius * Math.sin(angle);
            const labelX = center + (maxRadius + 40) * Math.cos(angle);
            const labelY = center + (maxRadius + 40) * Math.sin(angle);

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
                  fontSize="12"
                  fontWeight="600"
                  fill="#374151"
                >
                  {discipline.shortLabel}
                </text>
              </g>
            );
          })}

          {/* Player 2 polygon (behind) */}
          {stats2 && (
            <>
              <path
                d={getPolygonPath(stats2)}
                fill={color2}
                fillOpacity="0.25"
                stroke={color2}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Player 2 points */}
              {disciplines.map((d, index) => {
                const value = stats2[d.key] || 0;
                const point = getPoint(value, index);
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
            </>
          )}

          {/* Player 1 polygon (front) */}
          {stats1 && (
            <>
              <path
                d={getPolygonPath(stats1)}
                fill={color1}
                fillOpacity="0.25"
                stroke={color1}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Player 1 points */}
              {disciplines.map((d, index) => {
                const value = stats1[d.key] || 0;
                const point = getPoint(value, index);
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
            </>
          )}
        </svg>
      </div>

      {/* Discipline values */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {disciplines.map((discipline, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-600 mb-2 font-medium">
              {discipline.label}
            </div>
            <div className="flex flex-col gap-1">
              {stats1 && (
                <div className="text-sm font-bold" style={{ color: color1 }}>
                  {stats1[discipline.key].toFixed(1)}%
                </div>
              )}
              {stats2 && (
                <div className="text-sm font-bold" style={{ color: color2 }}>
                  {stats2[discipline.key].toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Win Rate по кожній дисципліні
      </div>
    </div>
  );
}

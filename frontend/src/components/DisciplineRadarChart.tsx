'use client';

import React, { useEffect, useState } from 'react';

interface DisciplineStats {
  free_pyramid: number;
  dynamic_pyramid: number;
  combined_pyramid: number;
  free_pyramid_extended: number;
  combined_pyramid_changes: number;
}

interface DisciplineRadarChartProps {
  playerId: string;
}

const DisciplineRadarChart: React.FC<DisciplineRadarChartProps> = ({ playerId }) => {
  const [stats, setStats] = useState<DisciplineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/players/${playerId}/discipline-stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching discipline stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, API_URL]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Конфігурація дисциплін
  const disciplines = [
    { key: 'free_pyramid' as keyof DisciplineStats, label: 'Вільна піраміда' },
    { key: 'dynamic_pyramid' as keyof DisciplineStats, label: 'Динамічна піраміда' },
    { key: 'combined_pyramid' as keyof DisciplineStats, label: 'Комбінована піраміда' },
    { key: 'free_pyramid_extended' as keyof DisciplineStats, label: 'Вільна з продовженням' },
    { key: 'combined_pyramid_changes' as keyof DisciplineStats, label: 'Комбінована зі змінами' }
  ];

  // SVG параметри
  const size = 400;
  const center = size / 2;
  const maxRadius = 160;
  const levels = 5;
  const angleStep = (Math.PI * 2) / disciplines.length;

  // Функція для обчислення координат точки на радарі
  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2; // Починаємо з верху
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  // Генерація точок для полігону даних
  const dataPoints = disciplines.map((d, i) => {
    const value = stats[d.key];
    return getPoint(i, value);
  });

  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Генерація ліній сітки (концентричні кола)
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const radius = (maxRadius / levels) * (i + 1);
    return (
      <circle
        key={i}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    );
  });

  // Генерація осей
  const axes = disciplines.map((_, i) => {
    const endPoint = getPoint(i, 100);
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    );
  });

  // Генерація підписів
  const labels = disciplines.map((d, i) => {
    const labelPoint = getPoint(i, 115); // Трохи далі за межі
    const value = stats[d.key];
    const isHovered = hoveredIndex === i;

    return (
      <g key={i}>
        <text
          x={labelPoint.x}
          y={labelPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-xs sm:text-sm font-medium transition-all ${
            isHovered ? 'fill-blue-600 text-base sm:text-lg' : 'fill-gray-700'
          }`}
        >
          {d.label}
        </text>
        <text
          x={labelPoint.x}
          y={labelPoint.y + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-xs font-semibold transition-all ${
            isHovered ? 'fill-blue-600' : 'fill-gray-900'
          }`}
        >
          {value.toFixed(1)}%
        </text>
      </g>
    );
  });

  // Генерація точок даних
  const dataCircles = dataPoints.map((p, i) => {
    const isHovered = hoveredIndex === i;
    return (
      <circle
        key={i}
        cx={p.x}
        cy={p.y}
        r={isHovered ? 7 : 5}
        fill="#3b82f6"
        stroke="white"
        strokeWidth="2"
        className="transition-all cursor-pointer"
        onMouseEnter={() => setHoveredIndex(i)}
        onMouseLeave={() => setHoveredIndex(null)}
      />
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        Статистика по дисциплінах
      </h3>
      
      <div className="flex justify-center">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${size} ${size}`}
          className="max-w-full"
          style={{ maxHeight: '500px' }}
        >
          {/* Фонова сітка */}
          <g opacity="0.3">
            {gridCircles}
            {axes}
          </g>

          {/* Градієнт для заливки */}
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Полігон даних з градієнтною заливкою */}
          <path
            d={pathData}
            fill="url(#radarGradient)"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Точки даних */}
          {dataCircles}

          {/* Підписи */}
          {labels}
        </svg>
      </div>

      {/* Легенда */}
      <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
        Win Rate: відсоток перемог у турнірних матчах
      </div>
    </div>
  );
};

export default DisciplineRadarChart;

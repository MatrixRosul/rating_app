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
      <div className="relative bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 sm:p-6 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 animate-pulse"></div>
        <div className="relative flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-gray-600 font-medium">Завантаження статистики...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Конфігурація дисциплін з кольорами
  const disciplines = [
    { 
      key: 'free_pyramid' as keyof DisciplineStats, 
      label: 'Вільна', 
      shortLabel: 'ВП',
      color: '#6366f1', // indigo
      lightColor: '#818cf8'
    },
    { 
      key: 'dynamic_pyramid' as keyof DisciplineStats, 
      label: 'Динамічна', 
      shortLabel: 'ДП',
      color: '#8b5cf6', // violet
      lightColor: '#a78bfa'
    },
    { 
      key: 'combined_pyramid' as keyof DisciplineStats, 
      label: 'Комбінована', 
      shortLabel: 'КП',
      color: '#ec4899', // pink
      lightColor: '#f472b6'
    },
    { 
      key: 'free_pyramid_extended' as keyof DisciplineStats, 
      label: 'Вільна+', 
      shortLabel: 'ВП+',
      color: '#14b8a6', // teal
      lightColor: '#2dd4bf'
    },
    { 
      key: 'combined_pyramid_changes' as keyof DisciplineStats, 
      label: 'Комбінована зі змінами', 
      shortLabel: 'КПЗ',
      color: '#f59e0b', // amber
      lightColor: '#fbbf24'
    }
  ];


  // SVG параметри - адаптивні розміри
  const size = 500;
  const center = size / 2;
  const maxRadius = 180;
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

  // Генерація ліній сітки (концентричні кола) з градієнтом
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const radius = (maxRadius / levels) * (i + 1);
    const opacity = 1 - (i * 0.02);
    return (
      <circle
        key={i}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="url(#gridGradient)"
        strokeWidth="2"
        opacity={opacity}
      />
    );
  });

  // Генерація осей з градієнтом
  const axes = disciplines.map((d, i) => {
    const endPoint = getPoint(i, 100);
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke={d.lightColor}
        strokeWidth="2"
        opacity="0.5"
      />
    );
  });

  // Генерація підписів - покращена типографіка
  const labels = disciplines.map((d, i) => {
    const labelPoint = getPoint(i, 125);
    const value = stats[d.key];
    const isHovered = hoveredIndex === i;

    return (
      <g key={i}>
        {/* Background circle for label on hover */}
        {isHovered && (
          <circle
            cx={labelPoint.x}
            cy={labelPoint.y - 8}
            r="45"
            fill={d.color}
            opacity="0.1"
            className="transition-all duration-300"
          />
        )}
        
        {/* Mobile: короткі назви */}
        <text
          x={labelPoint.x}
          y={labelPoint.y - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-sm font-bold transition-all duration-300 sm:hidden ${
            isHovered ? 'text-lg' : ''
          }`}
          fill={isHovered ? d.color : '#374151'}
        >
          {d.shortLabel}
        </text>
        
        {/* Desktop: повні назви */}
        <text
          x={labelPoint.x}
          y={labelPoint.y - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`hidden sm:block text-sm font-bold transition-all duration-300 ${
            isHovered ? 'text-base' : ''
          }`}
          fill={isHovered ? d.color : '#374151'}
        >
          {d.label}
        </text>
        
        {/* Percentage value */}
        <text
          x={labelPoint.x}
          y={labelPoint.y + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-base font-extrabold transition-all duration-300 ${
            isHovered ? 'text-xl' : ''
          }`}
          fill={d.color}
        >
          {value.toFixed(1)}%
        </text>
      </g>
    );
  });

  // Генерація точок даних з красивими ефектами
  const dataCircles = dataPoints.map((p, i) => {
    const isHovered = hoveredIndex === i;
    const d = disciplines[i];
    return (
      <g key={i}>
        {/* Glow effect on hover */}
        {isHovered && (
          <circle
            cx={p.x}
            cy={p.y}
            r={15}
            fill={d.color}
            opacity="0.2"
            className="animate-pulse"
          />
        )}
        {/* Outer ring */}
        <circle
          cx={p.x}
          cy={p.y}
          r={isHovered ? 10 : 8}
          fill={d.color}
          opacity="0.3"
          className="transition-all duration-300"
        />
        {/* Inner dot */}
        <circle
          cx={p.x}
          cy={p.y}
          r={isHovered ? 6 : 5}
          fill={d.color}
          stroke="white"
          strokeWidth="3"
          className="transition-all duration-300 cursor-pointer drop-shadow-lg"
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      </g>
    );
  });

  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100/50 p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Статистика по дисциплінах
          </h3>
        </div>
        <p className="text-sm text-gray-600 ml-4">Win Rate у турнірних матчах</p>
      </div>
      
      <div className="relative flex justify-center">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${size} ${size}`}
          className="max-w-full drop-shadow-xl"
          style={{ maxHeight: '600px' }}
        >
          {/* Definitions for gradients and effects */}
          <defs>
            {/* Grid gradient */}
            <radialGradient id="gridGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
            </radialGradient>
            
            {/* Data area gradient - multi-color */}
            <radialGradient id="radarGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
            </radialGradient>
            
            {/* Shadow filter */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background circles with subtle gradient */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius}
            fill="url(#gridGradient)"
            opacity="0.05"
          />

          {/* Фонова сітка */}
          <g opacity="0.4">
            {gridCircles}
            {axes}
          </g>

          {/* Полігон даних з градієнтною заливкою та тінню */}
          <path
            d={pathData}
            fill="url(#radarGradient)"
            stroke="url(#radarGradient)"
            strokeWidth="3"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-500"
          />

          {/* Точки даних */}
          <g filter="url(#shadow)">
            {dataCircles}
          </g>

          {/* Підписи */}
          {labels}
        </svg>
      </div>

      {/* Color legend - адаптивна легенда */}
      <div className="relative mt-6 pt-6 border-t border-gray-200/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {disciplines.map((d, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                hoveredIndex === i ? 'bg-gradient-to-r from-blue-50 to-purple-50 scale-105' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="w-4 h-4 rounded-full shadow-md flex-shrink-0"
                style={{ 
                  backgroundColor: d.color,
                  boxShadow: `0 0 10px ${d.color}40`
                }}
              ></div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-700 truncate">{d.label}</div>
                <div className="text-xs font-bold" style={{ color: d.color }}>
                  {stats[d.key].toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info tooltip */}
      <div className="relative mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100/50">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">i</div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Наведіть курсор на точки або легенду для детальної інформації. 
            Win Rate показує відсоток перемог у турнірних матчах для кожної дисципліни.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisciplineRadarChart;

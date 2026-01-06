'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO date string
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return null;
  }

  if (timeLeft.isExpired) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-700 font-semibold text-xl">
          Реєстрація завершена
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
      <div className="text-lg font-medium text-gray-600 mb-4">
        До завершення реєстрації залишилось
      </div>
      <div className="flex justify-center gap-6">
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-blue-600">{timeLeft.days}</div>
          <div className="text-sm text-gray-600 mt-2">днів</div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-5xl font-bold text-gray-400">:</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-blue-600">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-600 mt-2">годин</div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-5xl font-bold text-gray-400">:</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-blue-600">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-600 mt-2">хвилин</div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-5xl font-bold text-gray-400">:</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-blue-600">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-600 mt-2">секунд</div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { TournamentStatus, TournamentDiscipline } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DISCIPLINES: { value: TournamentDiscipline; label: string }[] = [
  { value: 'FREE_PYRAMID', label: 'Вільна піраміда' },
  { value: 'FREE_PYRAMID_EXTENDED', label: 'Вільна піраміда з продовженням' },
  { value: 'COMBINED_PYRAMID', label: 'Комбінована піраміда' },
  { value: 'DYNAMIC_PYRAMID', label: 'Динамічна піраміда' },
  { value: 'COMBINED_PYRAMID_CHANGES', label: 'Комбінована піраміда зі змінами' },
];

export default function CreateTournamentModal({ isOpen, onClose, onSuccess }: CreateTournamentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    registrationEnd: '',
    registrationStart: '',
    startDate: '',
    endDate: '',
    city: '',
    country: 'Україна',
    club: '',
    discipline: 'FREE_PYRAMID' as TournamentDiscipline,
    isRated: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Необхідна авторизація');
        return;
      }

      const payload: any = {
        name: formData.name,
        registration_end: formData.registrationEnd,
        city: formData.city,
        country: formData.country,
        club: formData.club,
        discipline: formData.discipline,
        is_rated: formData.isRated,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.registrationStart) payload.registration_start = formData.registrationStart;
      if (formData.startDate) payload.start_date = formData.startDate;
      if (formData.endDate) payload.end_date = formData.endDate;

      const response = await fetch(`${API_URL}/api/tournaments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : JSON.stringify(data.detail) || 'Помилка створення турніру';
        throw new Error(errorMsg);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        registrationEnd: '',
        registrationStart: '',
        startDate: '',
        endDate: '',
        city: '',
        country: 'Україна',
        club: '',
        discipline: 'FREE_PYRAMID',
        isRated: true,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.message || err.toString() || 'Щось пішло не так';
      setError(errorMsg);
      console.error('Tournament creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-6 md:p-8 max-w-2xl w-full my-4 sm:my-8">
        {/* Decorative gradient */}
        <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Створити новий турнір
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors hover:scale-110 duration-300"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Назва турніру <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              required
              disabled={loading}
              placeholder="Введіть назву турніру"
            />
          </div>

          {/* City, Country, Club in a grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Місто <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
                disabled={loading}
                placeholder="Київ"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Країна <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
                disabled={loading}
                placeholder="Україна"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Клуб <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.club}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
                disabled={loading}
                placeholder="Назва клубу"
              />
            </div>
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Дисципліна <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value as TournamentDiscipline })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              required
              disabled={loading}
            >
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Опис / Регламент
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base resize-none"
              rows={3}
              disabled={loading}
              placeholder="Опис турніру та регламент..."
            />
          </div>

          {/* Is Rated */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl p-3 sm:p-4 border border-blue-100">
            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRated}
                onChange={(e) => setFormData({ ...formData, isRated: e.target.checked })}
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-1">
                Рейтинговий турнір
                {formData.isRated && (
                  <span className="block sm:inline sm:ml-1 text-orange-600 text-xs sm:text-sm">
                    (рахується до рейтингу)
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Registration Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Початок реєстрації
              </label>
              <input
                type="datetime-local"
                value={formData.registrationStart}
                onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Кінець реєстрації <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.registrationEnd}
                onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Tournament Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Дата початку турніру
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Дата закінчення турніру
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="relative bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm rounded-xl shadow-lg border-2 border-red-300/50 p-3 sm:p-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 rounded-full blur-2xl"></div>
              <div className="relative flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-red-700 font-medium text-xs sm:text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-sm sm:text-base"
              disabled={loading}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base hover:scale-105 active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Створення...
                </span>
              ) : (
                'Створити'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

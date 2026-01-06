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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
        <h2 className="text-2xl font-bold mb-6">Створити новий турнір</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Назва турніру <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {/* City, Country, Club in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Місто <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Київ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Країна <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Клуб <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.club}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Назва клубу"
              />
            </div>
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Дисципліна <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value as TournamentDiscipline })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-black mb-1">Опис / Регламент</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={loading}
              placeholder="Опис турніру та регламент..."
            />
          </div>

          {/* Is Rated */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRated}
                onChange={(e) => setFormData({ ...formData, isRated: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm font-medium text-black">
                Рейтинговий турнір {formData.isRated && <span className="text-orange-500">(рахується до рейтингу)</span>}
              </span>
            </label>
          </div>

          {/* Registration Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Початок реєстрації</label>
              <input
                type="datetime-local"
                value={formData.registrationStart}
                onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Кінець реєстрації <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.registrationEnd}
                onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Tournament Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Дата початку турніру</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Дата закінчення турніру</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-blue-50 transition"
              disabled={loading}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Створення...' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

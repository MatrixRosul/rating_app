'use client';

import { useState } from 'react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface StartTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  confirmedCount: number;
  onSuccess: () => void;
}

export default function StartTournamentModal({
  isOpen,
  onClose,
  tournamentId,
  confirmedCount,
  onSuccess,
}: StartTournamentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [seedingMode, setSeedingMode] = useState<'auto' | 'manual'>('auto');
  
  // Bracket type selection
  const [bracketType, setBracketType] = useState<'single_elimination' | 'double_elimination' | 'group_stage'>('single_elimination');
  
  // Race to values
  const [raceToF, setRaceToF] = useState(7);
  const [raceToSF, setRaceToSF] = useState(5);
  const [raceToQF, setRaceToQF] = useState(4);
  const [raceToR16, setRaceToR16] = useState(3);
  const [raceToR32, setRaceToR32] = useState(3);
  const [raceToR64, setRaceToR64] = useState(2);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Потрібна авторизація');
        return;
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/bracket/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Помилка завантаження preview';
        try {
          const data = await response.json();
          errorMessage = typeof data.detail === 'string' ? data.detail : 'Помилка завантаження preview';
        } catch {
          errorMessage = `Помилка сервера (${response.status})`;
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      setPreviewData(data.bracket);
      setShowPreview(true);
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.message || 'Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Потрібна авторизація');
        return;
      }

      // Якщо обрано ручний режим сідів - перевіряємо чи всі підтверджені учасники мають сід
      if (seedingMode === 'manual') {
        const participantsResponse = await fetch(
          `${API_URL}/api/tournaments/${tournamentId}/participants/`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (participantsResponse.ok) {
          const participants = await participantsResponse.json();
          const confirmedParticipants = participants.filter((p: any) => p.status === 'confirmed');
          const participantsWithoutSeed = confirmedParticipants.filter((p: any) => !p.seed);
          
          if (participantsWithoutSeed.length > 0) {
            setError(
              `Заповніть ручні сіяні номери для всіх підтверджених учасників! ` +
              `Бракує сідів для ${participantsWithoutSeed.length} учасників. ` +
              `Використайте кнопку "Редагувати сіяних" перед запуском турніру.`
            );
            setLoading(false);
            return;
          }
        }
      }

      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bracket_type: bracketType,
          race_to_f: raceToF,
          race_to_sf: raceToSF || null,
          race_to_qf: raceToQF || null,
          race_to_r16: raceToR16 || null,
          race_to_r32: raceToR32 || null,
          race_to_r64: raceToR64 || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Помилка запуску турніру';
        try {
          const data = await response.json();
          const errorDetail = data.detail;
          if (typeof errorDetail === 'object' && errorDetail.errors) {
            errorMessage = errorDetail.errors.join(', ');
          } else if (typeof errorDetail === 'string') {
            errorMessage = errorDetail;
          } else if (errorDetail.message) {
            errorMessage = errorDetail.message;
          }
        } catch {
          // Якщо JSON парсинг не вдався
          errorMessage = `Помилка сервера (${response.status})`;
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Tournament start error:', err);
      setError(err.message || 'Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Запустити турнір</h2>

          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Увага!</strong> Після запуску турніру:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                  <li>Неможливо додати або видалити учасників</li>
                  <li>Регламент стане read-only</li>
                  <li>Сітка буде автоматично згенерована</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mb-6">
            <div className="text-sm text-gray-600">
              <strong>Підтверджених учасників:</strong> {confirmedCount}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Формат:</strong> {
                bracketType === 'single_elimination' ? 'Single Elimination (на виліт)' :
                bracketType === 'double_elimination' ? 'Double Elimination (подвійна сітка)' :
                bracketType === 'group_stage' ? 'Group Stage (групова стадія)' :
                'Single Elimination (на виліт)'
              }
            </div>
          </div>

          {/* Bracket Type Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Тип сітки турніру</h3>
            <div className="space-y-3">
              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="bracketType"
                  value="single_elimination"
                  checked={bracketType === 'single_elimination'}
                  onChange={() => setBracketType('single_elimination')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Single Elimination (на виліт)</div>
                  <div className="text-sm text-gray-600">
                    Класичний формат - одна поразка і ви виліт
                  </div>
                </div>
              </label>
              
              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="bracketType"
                  value="double_elimination"
                  checked={bracketType === 'double_elimination'}
                  onChange={() => setBracketType('double_elimination')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Double Elimination (подвійна сітка)</div>
                  <div className="text-sm text-gray-600">
                    Upper і Lower Bracket - дві поразки і ви виліт
                  </div>
                </div>
              </label>
              
              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="bracketType"
                  value="group_stage"
                  checked={bracketType === 'group_stage'}
                  onChange={() => setBracketType('group_stage')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Group Stage (групова стадія)</div>
                  <div className="text-sm text-gray-600">
                    Групи + плейоф стадія
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Seeding Mode Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Розподіл сіяних номерів</h3>
            <div className="space-y-3">
              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="seedingMode"
                  value="auto"
                  checked={seedingMode === 'auto'}
                  onChange={() => setSeedingMode('auto')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Автоматичний розподіл по рейтингу</div>
                  <div className="text-sm text-gray-600">
                    Учасники будуть автоматично розподілені в сітці згідно їх рейтингу
                  </div>
                </div>
              </label>
              
              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="seedingMode"
                  value="manual"
                  checked={seedingMode === 'manual'}
                  onChange={() => setSeedingMode('manual')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Ручний розподіл</div>
                  <div className="text-sm text-gray-600">
                    Використати сіяні номери, встановлені вручну через "Редагувати сіяних"
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Race to settings */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Налаштування партій (race to)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фінал <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={raceToF}
                  onChange={(e) => setRaceToF(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Півфінали
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={raceToSF}
                  onChange={(e) => setRaceToSF(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Чвертьфінали
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={raceToQF}
                  onChange={(e) => setRaceToQF(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1/16 фіналу
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={raceToR16}
                  onChange={(e) => setRaceToR16(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1/32 фіналу
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={raceToR32}
                  onChange={(e) => setRaceToR32(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1/64 фіналу
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={raceToR64}
                  onChange={(e) => setRaceToR64(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Залиште 0 щоб використати значення з фіналу для всіх раундів
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <button
              onClick={fetchPreview}
              disabled={loading}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
            >
              Попередній перегляд сітки
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                onClick={handleStart}
                disabled={loading || !raceToF}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Запуск...' : 'Запустити турнір'}
              </button>
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && previewData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Попередній перегляд сітки</h3>
                  
                  <div className="mb-4 text-sm text-gray-600">
                    <strong>Розмір сітки:</strong> {previewData.bracket_size} учасників
                    <br />
                    <strong>Підтверджених:</strong> {previewData.participants_count}
                    <br />
                    <strong>Матчів:</strong> {previewData.total_matches}
                  </div>

                  {previewData.rounds && previewData.rounds.map((round: any) => (
                    <div key={round.name} className="mb-6">
                      <h4 className="font-semibold text-lg mb-3 text-gray-700">
                        {round.name === 'F' ? 'Фінал' :
                         round.name === 'SF' ? 'Півфінали' :
                         round.name === 'QF' ? 'Чвертьфінали' :
                         round.name === 'R16' ? '1/16 фіналу' :
                         round.name === 'R32' ? '1/32 фіналу' :
                         round.name === 'R64' ? '1/64 фіналу' : round.name}
                      </h4>
                      
                      <div className="space-y-2">
                        {round.matches.map((match: any) => (
                          <div key={match.match_number} className="border rounded p-3 bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {match.player1?.name || 'TBD'}
                                  {match.player1?.seed && <span className="text-xs text-gray-500 ml-2">#{match.player1.seed}</span>}
                                </div>
                                {match.player1?.rating && (
                                  <div className="text-sm text-gray-600">{match.player1.rating}</div>
                                )}
                              </div>
                              
                              <div className="px-4 font-bold text-gray-400">VS</div>
                              
                              <div className="flex-1 text-right">
                                <div className="font-medium">
                                  {match.player2?.name || 'TBD'}
                                  {match.player2?.seed && match.player2.name !== 'BYE' && (
                                    <span className="text-xs text-gray-500 ml-2">#{match.player2.seed}</span>
                                  )}
                                </div>
                                {match.player2?.rating && (
                                  <div className="text-sm text-gray-600">{match.player2.rating}</div>
                                )}
                                {match.is_wo && (
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">WO</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Закрити
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

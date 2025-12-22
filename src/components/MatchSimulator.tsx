'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function MatchSimulator() {
  const { state, addMatch, simulateRandomMatches, resetData, loadRealPlayers, importCsvMatches } = useApp();
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [winnerId, setWinnerId] = useState('');
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(5);
  const [randomMatchCount, setRandomMatchCount] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // Search states for player selection
  const [player1Search, setPlayer1Search] = useState('');
  const [player2Search, setPlayer2Search] = useState('');
  const [showPlayer1Dropdown, setShowPlayer1Dropdown] = useState(false);
  const [showPlayer2Dropdown, setShowPlayer2Dropdown] = useState(false);

  // Filter players based on search
  const filterPlayers = (searchTerm: string) => {
    if (!searchTerm) return state.players;
    return state.players.filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handlePlayer1Select = (player: any) => {
    setPlayer1Id(player.id);
    setPlayer1Search(player.name);
    setShowPlayer1Dropdown(false);
    if (winnerId === player.id) {
      setPlayer1Score(maxScore);
    } else if (winnerId && winnerId !== player.id) {
      setPlayer1Score(Math.max(0, maxScore - 1));
    }
  };

  const handlePlayer2Select = (player: any) => {
    setPlayer2Id(player.id);
    setPlayer2Search(player.name);
    setShowPlayer2Dropdown(false);
    if (winnerId === player.id) {
      setPlayer2Score(maxScore);
    } else if (winnerId && winnerId !== player.id) {
      setPlayer2Score(Math.max(0, maxScore - 1));
    }
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player1Id || !player2Id || !winnerId) {
      alert('Будь ласка, оберіть всіх гравців та переможця');
      return;
    }

    if (player1Id === player2Id) {
      alert('Оберіть різних гравців');
      return;
    }

    if (player1Score < 0 || player2Score < 0) {
      alert('Рахунок не може бути від\'ємним');
      return;
    }

    if (maxScore <= 0 || maxScore > 10) {
      alert('Максимальний рахунок повинен бути від 1 до 10');
      return;
    }

    // Перевіряємо, що переможець дійсно має більший рахунок
    const winnerScore = winnerId === player1Id ? player1Score : player2Score;
    const loserScore = winnerId === player1Id ? player2Score : player1Score;
    
    if (winnerScore <= loserScore) {
      alert('Переможець повинен мати більший рахунок');
      return;
    }

    if (winnerScore !== maxScore) {
      alert(`Переможець повинен мати рахунок ${maxScore}`);
      return;
    }

    addMatch(player1Id, player2Id, winnerId, player1Score, player2Score, maxScore);
    
    // Reset form
    setPlayer1Id('');
    setPlayer2Id('');
    setWinnerId('');
    setPlayer1Score(0);
    setPlayer2Score(0);
    setMaxScore(5);
    setPlayer1Search('');
    setPlayer2Search('');
    setShowPlayer1Dropdown(false);
    setShowPlayer2Dropdown(false);
  };

  const handleSimulateRandomMatches = () => {
    if (randomMatchCount <= 0 || randomMatchCount > 1000) {
      alert('Кількість матчів повинна бути від 1 до 1000');
      return;
    }

    setIsSimulating(true);
    try {
      simulateRandomMatches(randomMatchCount);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Ви впевнені, що хочете скинути всі дані? Це видалить всіх гравців та матчі.')) {
      resetData();
    }
  };

  const handleLoadRealPlayers = () => {
    if (confirm('Завантажити реальних гравців? Це замінить поточних гравців на 115 реальних гравців з рейтингом 1100.')) {
      loadRealPlayers();
    }
  };

  const handleImportMatches = async () => {
    setImportMessage(null);
    setImporting(true);
    try {
      await importCsvMatches();
      setImportMessage('Імпорт успішний: матчі та рейтинги оновлено');
    } catch (error) {
      setImportMessage('Помилка імпорту. Спробуйте ще раз.');
    } finally {
      setImporting(false);
    }
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.player-search-container')) {
        setShowPlayer1Dropdown(false);
        setShowPlayer2Dropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (state.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {importMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-md text-sm">
          {importMessage}
        </div>
      )}

      {/* Manual Match Addition */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Додати матч</h2>
        
        <form onSubmit={handleAddMatch} className="space-y-4">
          {/* Match Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-2">
                Гра до скільки очок (1-10)
              </label>
              <input
                type="number"
                id="maxScore"
                min="1"
                max="10"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Введіть число від 1 до 10"
              />
              <div className="mt-1 text-xs text-gray-500">
                Популярні: 3, 5, 7, 10 очок
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 1 */}
            <div>
              <label htmlFor="player1" className="block text-sm font-medium text-gray-700 mb-2">
                Гравець 1
              </label>
              <div className="relative player-search-container">
                <input
                  type="text"
                  id="player1"
                  value={player1Search}
                  onChange={(e) => {
                    setPlayer1Search(e.target.value);
                    setShowPlayer1Dropdown(true);
                    if (!e.target.value) {
                      setPlayer1Id('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Пошук гравця 1"
                  required
                />
                {showPlayer1Dropdown && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                    {filterPlayers(player1Search).length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        Гравця не знайдено
                      </div>
                    ) : (
                      filterPlayers(player1Search).map(player => (
                        <div
                          key={player.id}
                          onClick={() => handlePlayer1Select(player)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white"
                        >
                          <div className="flex items-center">
                            <div className="text-sm font-medium">
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-400 ml-2">
                              {player.rating}
                            </div>
                          </div>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <span className="text-blue-600 text-xs font-semibold">
                              Обрано
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {player1Id && (
                <div className="mt-2">
                  <label htmlFor="player1Score" className="block text-sm font-medium text-gray-700 mb-1">
                    Рахунок гравця 1
                  </label>
                  <input
                    type="number"
                    id="player1Score"
                    min="0"
                    max={maxScore}
                    value={player1Score}
                    onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div>
              <label htmlFor="player2" className="block text-sm font-medium text-gray-700 mb-2">
                Гравець 2
              </label>
              <div className="relative player-search-container">
                <input
                  onChange={(e) => {
                    setPlayer2Search(e.target.value);
                    setShowPlayer2Dropdown(true);
                    if (!e.target.value) {
                      setPlayer2Id('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Пошук гравця 2"
                  required
                />
                {showPlayer2Dropdown && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                    {filterPlayers(player2Search).filter(player => player.id !== player1Id).length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        Гравця не знайдено
                      </div>
                    ) : (
                      filterPlayers(player2Search).filter(player => player.id !== player1Id).map(player => (
                        <div
                          key={player.id}
                          onClick={() => handlePlayer2Select(player)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white"
                        >
                          <div className="flex items-center">
                            <div className="text-sm font-medium">
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-400 ml-2">
                              {player.rating}
                            </div>
                          </div>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <span className="text-blue-600 text-xs font-semibold">
                              Обрано
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {player2Id && (
                <div className="mt-2">
                  <label htmlFor="player2Score" className="block text-sm font-medium text-gray-700 mb-1">
                    Рахунок гравця 2
                  </label>
                  <input
                    type="number"
                    id="player2Score"
                    min="0"
                    max={maxScore}
                    value={player2Score}
                    onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Winner Selection */}
          {player1Id && player2Id && (
            <div>
              <label htmlFor="winner" className="block text-sm font-medium text-gray-700 mb-2">
                Переможець (хто набрав {maxScore} очок)
              </label>
              <select
                id="winner"
                value={winnerId}
                onChange={(e) => {
                  setWinnerId(e.target.value);
                  if (e.target.value === player1Id) {
                    setPlayer1Score(maxScore);
                    setPlayer2Score(Math.max(0, maxScore - 2));
                  } else if (e.target.value === player2Id) {
                    setPlayer2Score(maxScore);
                    setPlayer1Score(Math.max(0, maxScore - 2));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Оберіть переможця</option>
                {[player1Id, player2Id].map(id => {
                  const player = state.players.find(p => p.id === id);
                  return player ? (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ) : null;
                })}
              </select>
            </div>
          )}

          {/* Score Preview */}
          {player1Id && player2Id && winnerId && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Попередній перегляд матчу:</h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="font-semibold">
                    {state.players.find(p => p.id === player1Id)?.name}
                  </div>
                  <div className={`text-2xl font-bold ${winnerId === player1Id ? 'text-green-600' : 'text-red-600'}`}>
                    {player1Score}
                  </div>
                </div>
                <div className="text-gray-400">:</div>
                <div className="text-center">
                  <div className="font-semibold">
                    {state.players.find(p => p.id === player2Id)?.name}
                  </div>
                  <div className={`text-2xl font-bold ${winnerId === player2Id ? 'text-green-600' : 'text-red-600'}`}>
                    {player2Score}
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Гра до {maxScore} очок
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!player1Id || !player2Id || !winnerId || player1Score < 0 || player2Score < 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Додати матч з рахунком {player1Score}:{player2Score}
          </button>
        </form>
      </div>

      {/* Advanced Rating System Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handleImportMatches}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                importing
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              disabled={importing}
            >
              {importing ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Імпорт матчів...</span>
                </>
              ) : (
                <span>⬇️ Імпорт матчів</span>
              )}
            </button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Розширена рейтингова система</h2>
        
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Нова система враховує:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Рахунок матчу</strong> - чим ближчий рахунок, тім менша зміна рейтингу</li>
            <li><strong>Якість гри програвшого</strong> - якщо програв, але зіграв краще за очікування, втратить менше рейтингу</li>
            <li><strong>Фактор несподіванки</strong> - перемога над сильнішим гравцем дає значно більше очок</li>
            <li><strong>Адаптивний K-фактор</strong> - більша зміна рейтингу при великій різниці в силі гравців</li>
            <li><strong>Збільшені зміни</strong> - мінімум ±4, максимум ±60 рейтингу за матч</li>
          </ul>
          
          <div className="bg-blue-50 p-3 rounded-md mt-4">
            <p className="text-blue-800">
              <strong>Приклад:</strong> Гравець 1100 програв 4:5 гравцю 1700 - отримає +6-10 рейтингу за гарну гру!<br/>
              <strong>Шок:</strong> Гравець 1100 переміг 5:2 гравця 1700 - отримає +30-45 рейтингу!
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md mt-2">
            <p className="text-green-800">
              <strong>Гнучкість:</strong> Тепер можна грати до будь-якої кількості очок від 1 до 10!
            </p>
          </div>
        </div>
      </div>

      {/* Random Match Simulation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Симуляція матчів</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="matchCount" className="block text-sm font-medium text-gray-700 mb-2">
              Кількість випадкових матчів
            </label>
            <input
              type="number"
              id="matchCount"
              min="1"
              max="1000"
              value={randomMatchCount}
              onChange={(e) => setRandomMatchCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <button
            onClick={handleSimulateRandomMatches}
            disabled={isSimulating}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSimulating ? 'Симуляція...' : `Симулювати ${randomMatchCount} матчів`}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Статистика</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{state.players.length}</div>
            <div className="text-sm text-gray-600">Гравців</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{state.matches.length}</div>
            <div className="text-sm text-gray-600">Матчів</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {state.players.length > 0 ? Math.max(...state.players.map(p => p.rating)) : 0}
            </div>
            <div className="text-sm text-gray-600">Макс рейтинг</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {state.players.length > 0 ? Math.min(...state.players.map(p => p.rating)) : 0}
            </div>
            <div className="text-sm text-gray-600">Мін рейтинг</div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-3">
          <button
            onClick={handleLoadRealPlayers}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            🎯 Завантажити реальних гравців (115 осіб)
          </button>
          
          <button
            onClick={handleResetData}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            🔄 Скинути всі дані
          </button>
        </div>
      </div>
    </div>
  );
}

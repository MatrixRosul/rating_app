'use client';

import { useState, useEffect } from 'react';
import { Table } from '@/types';
import { getTables, createTable, updateTable, deleteTable } from '@/lib/api/tables';

interface TableManagerProps {
  tournamentId: number;
}

export default function TableManager({ tournamentId }: TableManagerProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const loadTables = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTables(tournamentId);
      setTables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завантаження столів');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [tournamentId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    try {
      await createTable(tournamentId, newTableName.trim(), true);
      setNewTableName('');
      setShowAddForm(false);
      await loadTables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка створення столу');
    }
  };

  const handleToggleActive = async (table: Table) => {
    try {
      await updateTable(table.id, { isActive: !table.isActive });
      await loadTables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка оновлення столу');
    }
  };

  const handleStartEdit = (table: Table) => {
    setEditingId(table.id);
    setEditName(table.name);
  };

  const handleSaveEdit = async (tableId: number) => {
    if (!editName.trim()) return;

    try {
      await updateTable(tableId, { name: editName.trim() });
      setEditingId(null);
      await loadTables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження');
    }
  };

  const handleDelete = async (tableId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей стіл?')) return;

    try {
      await deleteTable(tableId);
      await loadTables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка видалення столу');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управління столами</h2>
          <p className="text-sm text-gray-600 mt-1">Керуйте столами для проведення турніру</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          {showAddForm ? '✖ Скасувати' : '➕ Додати стіл'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Назва столу (напр. Стіл 1, VIP Стіл)"
              className="flex-1 px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newTableName.trim()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Створити
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
          <div className="text-3xl mb-2">🎱</div>
          <div className="text-2xl font-bold text-gray-900">{tables.length}</div>
          <div className="text-sm text-gray-600">Всього столів</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-emerald-700">
            {tables.filter(t => t.isActive && !t.isOccupied).length}
          </div>
          <div className="text-sm text-gray-600">Доступні</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
          <div className="text-3xl mb-2">🎮</div>
          <div className="text-2xl font-bold text-orange-700">
            {tables.filter(t => t.isOccupied).length}
          </div>
          <div className="text-sm text-gray-600">Зайняті</div>
        </div>
      </div>

      {/* Tables List */}
      {tables.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🎱</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Столи не знайдено</h3>
          <p className="text-gray-600 mb-4">Додайте перший стіл для початку роботи</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            ➕ Додати стіл
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`rounded-lg p-4 border-2 transition-all ${
                table.isOccupied
                  ? 'bg-orange-50 border-orange-200'
                  : table.isActive
                  ? 'bg-emerald-50 border-emerald-200 hover:shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    table.isOccupied
                      ? 'bg-orange-200 text-orange-800'
                      : table.isActive
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {table.isOccupied ? '🎮 Зайнято' : table.isActive ? '✅ Доступний' : '⏸️ Вимкнено'}
                </span>
              </div>

              {/* Name */}
              {editingId === table.id ? (
                <div className="mb-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(table.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                </div>
              ) : (
                <h3 className="text-lg font-bold text-gray-900 mb-3">{table.name}</h3>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {editingId === table.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(table.id)}
                      className="flex-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                    >
                      ✓ Зберегти
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                      ✖ Скасувати
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleActive(table)}
                      disabled={table.isOccupied}
                      className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors font-medium ${
                        table.isActive
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={table.isOccupied ? 'Неможливо вимкнути зайнятий стіл' : ''}
                    >
                      {table.isActive ? '⏸️ Вимкнути' : '▶️ Увімкнути'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(table)}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      disabled={table.isOccupied}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={table.isOccupied ? 'Неможливо видалити зайнятий стіл' : ''}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

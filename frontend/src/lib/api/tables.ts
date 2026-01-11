/**
 * Tables API
 * PHASE 3: Tournament table management
 */

import { Table } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Get all tables for a tournament
 */
export async function getTables(tournamentId: number): Promise<Table[]> {
  const response = await fetch(`${API_URL}/api/tables?tournament_id=${tournamentId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Помилка завантаження столів');
  }

  const data = await response.json();
  // Convert snake_case to camelCase
  return data.map((table: any) => ({
    id: table.id,
    tournamentId: table.tournament_id,
    name: table.name,
    isActive: table.is_active,
    isOccupied: table.is_occupied,
    createdAt: table.created_at,
    updatedAt: table.updated_at,
  }));
}

/**
 * Create a new table
 */
export async function createTable(
  tournamentId: number,
  name: string,
  isActive: boolean = true
): Promise<Table> {
  const response = await fetch(`${API_URL}/api/tables`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      tournament_id: tournamentId,
      name,
      is_active: isActive,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Помилка створення столу');
  }

  const data = await response.json();
  // Convert snake_case to camelCase
  return {
    id: data.id,
    tournamentId: data.tournament_id,
    name: data.name,
    isActive: data.is_active,
    isOccupied: data.is_occupied,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update table
 */
export async function updateTable(
  tableId: number,
  updates: { name?: string; isActive?: boolean; isOccupied?: boolean }
): Promise<Table> {
  const response = await fetch(`${API_URL}/api/tables/${tableId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: updates.name,
      is_active: updates.isActive,
      is_occupied: updates.isOccupied,
    }),
  });

  if (!response.ok) {
    throw new Error('Помилка оновлення столу');
  }

  const data = await response.json();
  
  // Convert snake_case to camelCase
  return {
    id: data.id,
    tournamentId: data.tournament_id,
    name: data.name,
    isActive: data.is_active,
    isOccupied: data.is_occupied,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Помилка оновлення столу');
  }

  return response.json();
}

/**
 * Delete table
 */
export async function deleteTable(tableId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/tables/${tableId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Помилка видалення столу');
  }
}

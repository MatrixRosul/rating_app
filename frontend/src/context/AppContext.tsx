'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Player, Match } from '@/types';
import { fetchPlayers, fetchMatches } from '@/lib/api';

interface AppState {
  players: Player[];
  matches: Match[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INITIALIZE_DATA'; payload: { players: Player[]; matches: Match[] } }
  | { type: 'RELOAD_DATA' };

const initialState: AppState = {
  players: [],
  matches: [],
  loading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'INITIALIZE_DATA':
      return {
        ...state,
        players: action.payload.players,
        matches: action.payload.matches,
        loading: false,
        error: null,
      };
    
    case 'RELOAD_DATA':
      return { ...state, loading: true };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  reloadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from API on mount
  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [playersData, matchesData] = await Promise.all([
        fetchPlayers(),
        fetchMatches()
      ]);
      
      // Populate players' matches arrays
      const playersWithMatches = playersData.map(player => ({
        ...player,
        matches: matchesData
          .filter(m => m.player1Id === player.id || m.player2Id === player.id)
          .map(m => m.id)
      }));
      
      dispatch({ type: 'INITIALIZE_DATA', payload: { players: playersWithMatches, matches: matchesData } });
    } catch (error: any) {
      console.error('Error loading data from API:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load data from backend' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reloadData = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider value={{ state, reloadData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

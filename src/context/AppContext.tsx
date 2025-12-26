'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Player, Match } from '@/types';
import { generateInitialPlayers, generateRealPlayers, calculateRatingChange, simulateMatch } from '@/utils/rating';

interface AppState {
  players: Player[];
  matches: Match[];
  loading: boolean;
  error: string | null;
  isClient: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'SET_MATCHES'; payload: Match[] }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'UPDATE_PLAYER_RATINGS'; payload: { player1Id: string; player2Id: string; newRating1: number; newRating2: number; matchId: string } }
  | { type: 'SET_CLIENT'; payload: boolean }
  | { type: 'INITIALIZE_DATA'; payload: { players: Player[]; matches: Match[] } };

const initialState: AppState = {
  players: [],
  matches: [],
  loading: true,
  error: null,
  isClient: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CLIENT':
      return { ...state, isClient: action.payload };
    
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    
    case 'SET_MATCHES':
      return { ...state, matches: action.payload };
    
    case 'ADD_MATCH':
      return { 
        ...state, 
        matches: [...state.matches, action.payload],
      };
    
    case 'UPDATE_PLAYER_RATINGS':
      return {
        ...state,
        players: state.players.map(player => {
          if (player.id === action.payload.player1Id) {
            return { 
              ...player, 
              rating: action.payload.newRating1,
              matches: [...player.matches, action.payload.matchId],
              updatedAt: new Date()
            };
          }
          if (player.id === action.payload.player2Id) {
            return { 
              ...player, 
              rating: action.payload.newRating2,
              matches: [...player.matches, action.payload.matchId],
              updatedAt: new Date()
            };
          }
          return player;
        }),
      };
    
    case 'INITIALIZE_DATA':
      return {
        ...state,
        players: action.payload.players,
        matches: action.payload.matches,
        loading: false,
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  addMatch: (player1Id: string, player2Id: string, winnerId: string, player1Score: number, player2Score: number, maxScore: number) => void;
  resetData: () => void;
  loadRealPlayers: () => void;
  simulateRandomMatches: (count: number) => void;
  importCsvMatches: (warmupRuns?: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Set client-side flag
  useEffect(() => {
    dispatch({ type: 'SET_CLIENT', payload: true });
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    if (!state.isClient) return; // Only run on client-side

    const loadData = () => {
      try {
        // Версія рейтингової системи (змінюйте при зміні початкового рейтингу)
        const RATING_SYSTEM_VERSION = '1200-base';
        const savedVersion = localStorage.getItem('billiard-rating-version');
        
        // Якщо версія змінилась - очищаємо старі дані
        if (savedVersion !== RATING_SYSTEM_VERSION) {
          console.log(`🔄 Rating system updated from ${savedVersion || 'old'} to ${RATING_SYSTEM_VERSION}. Clearing old data...`);
          localStorage.removeItem('billiard-players');
          localStorage.removeItem('billiard-matches');
          localStorage.setItem('billiard-rating-version', RATING_SYSTEM_VERSION);
          
          // Generate initial data with new version
          const initialPlayers = generateInitialPlayers(100, 1000);
          dispatch({ type: 'INITIALIZE_DATA', payload: { players: initialPlayers, matches: [] } });
          return;
        }

        const savedPlayers = localStorage.getItem('billiard-players');
        const savedMatches = localStorage.getItem('billiard-matches');

        if (savedPlayers && savedMatches) {
          const players = JSON.parse(savedPlayers).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          const matches = JSON.parse(savedMatches).map((m: any) => ({
            ...m,
            date: new Date(m.date),
            // Додаємо поля рахунку для сумісності з старими матчами
            player1Score: m.player1Score || (m.winnerId === m.player1Id ? 1 : 0),
            player2Score: m.player2Score || (m.winnerId === m.player2Id ? 1 : 0),
            maxScore: m.maxScore || 1,
          }));

          dispatch({ type: 'INITIALIZE_DATA', payload: { players, matches } });
        } else {
          // Generate initial data if none exists
          localStorage.setItem('billiard-rating-version', RATING_SYSTEM_VERSION);
          const initialPlayers = generateInitialPlayers(100, 1000);
          dispatch({ type: 'INITIALIZE_DATA', payload: { players: initialPlayers, matches: [] } });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
        // Generate initial data on error
        const initialPlayers = generateInitialPlayers(100, 1000);
        dispatch({ type: 'INITIALIZE_DATA', payload: { players: initialPlayers, matches: [] } });
      }
    };

    loadData();
  }, [state.isClient]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!state.loading && state.players.length > 0 && state.isClient) {
      localStorage.setItem('billiard-players', JSON.stringify(state.players));
      localStorage.setItem('billiard-matches', JSON.stringify(state.matches));
      localStorage.setItem('billiard-rating-version', '1200-base');
    }
  }, [state.players, state.matches, state.loading, state.isClient]);

  const addMatch = (player1Id: string, player2Id: string, winnerId: string, player1Score: number, player2Score: number, maxScore: number) => {
    const player1 = state.players.find(p => p.id === player1Id);
    const player2 = state.players.find(p => p.id === player2Id);

    if (!player1 || !player2) {
      dispatch({ type: 'SET_ERROR', payload: 'Players not found' });
      return;
    }

    const { player1Change, player2Change } = calculateRatingChange(
      player1.rating,
      player2.rating,
      player1Score,
      player2Score,
      maxScore
    );

    const newMatch: Match = {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      player1Id,
      player2Id,
      player1Name: player1.name, // Зберігаємо імена для віртуальних профілів
      player2Name: player2.name,
      winnerId,
      player1Score,
      player2Score,
      maxScore,
      player1RatingBefore: player1.rating,
      player2RatingBefore: player2.rating,
      player1RatingAfter: player1.rating + player1Change,
      player2RatingAfter: player2.rating + player2Change,
      player1RatingChange: player1Change,
      player2RatingChange: player2Change,
      date: new Date(),
    };

    dispatch({ type: 'ADD_MATCH', payload: newMatch });
    dispatch({ 
      type: 'UPDATE_PLAYER_RATINGS', 
      payload: { 
        player1Id, 
        player2Id, 
        newRating1: newMatch.player1RatingAfter,
        newRating2: newMatch.player2RatingAfter,
        matchId: newMatch.id
      } 
    });
  };

  const resetData = () => {
    const initialPlayers = generateInitialPlayers(100, 1000);
    dispatch({ type: 'SET_PLAYERS', payload: initialPlayers });
    dispatch({ type: 'SET_MATCHES', payload: [] });
    localStorage.removeItem('billiard-players');
    localStorage.removeItem('billiard-matches');
  };

  const loadRealPlayers = () => {
    const realPlayers = generateRealPlayers();
    dispatch({ type: 'SET_PLAYERS', payload: realPlayers });
    dispatch({ type: 'SET_MATCHES', payload: [] });
    localStorage.removeItem('billiard-players');
    localStorage.removeItem('billiard-matches');
  };

  const simulateRandomMatches = (count: number) => {
    // Створюємо локальну копію гравців для послідовного оновлення рейтингів
    let currentPlayers = [...state.players];
    const newMatches: Match[] = [];
    
    for (let i = 0; i < count; i++) {
      // Pick two random players from current local state
      const player1Index = Math.floor(Math.random() * currentPlayers.length);
      let player2Index = Math.floor(Math.random() * currentPlayers.length);
      
      // Ensure different players
      while (player2Index === player1Index) {
        player2Index = Math.floor(Math.random() * currentPlayers.length);
      }

      const player1 = currentPlayers[player1Index];
      const player2 = currentPlayers[player2Index];

      // Симулюємо результат матчу
      const ratingDiff = player1.rating - player2.rating;
      const player1WinProbability = 1 / (1 + Math.pow(10, -ratingDiff / 400));
      const maxScore = [5, 7, 10][Math.floor(Math.random() * 3)];
      
      let player1Score: number, player2Score: number, winnerId: string;
      
      if (Math.random() < player1WinProbability) {
        // Player 1 wins
        player1Score = maxScore;
        player2Score = Math.max(0, Math.min(maxScore - 1, Math.floor(Math.random() * (maxScore - 1))));
        winnerId = player1.id;
      } else {
        // Player 2 wins
        player2Score = maxScore;
        player1Score = Math.max(0, Math.min(maxScore - 1, Math.floor(Math.random() * (maxScore - 1))));
        winnerId = player2.id;
      }

      // Розраховуємо зміни рейтингу на основі поточних рейтингів
      const { player1Change, player2Change } = calculateRatingChange(
        player1.rating,
        player2.rating,
        player1Score,
        player2Score,
        maxScore
      );

      // Створюємо матч
      const newMatch: Match = {
        id: `match-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        player1Id: player1.id,
        player2Id: player2.id,
        player1Name: player1.name, // Зберігаємо імена для віртуальних профілів
        player2Name: player2.name,
        winnerId,
        player1Score,
        player2Score,
        maxScore,
        player1RatingBefore: player1.rating,
        player2RatingBefore: player2.rating,
        player1RatingAfter: player1.rating + player1Change,
        player2RatingAfter: player2.rating + player2Change,
        player1RatingChange: player1Change,
        player2RatingChange: player2Change,
        date: new Date(Date.now() + i), // Додаємо мілісекунди для правильного сортування
      };

      // Оновлюємо локальні копії гравців з новими рейтингами та матчами
      currentPlayers[player1Index] = {
        ...player1,
        rating: newMatch.player1RatingAfter,
        matches: [...player1.matches, newMatch.id],
        updatedAt: new Date()
      };
      
      currentPlayers[player2Index] = {
        ...player2, 
        rating: newMatch.player2RatingAfter,
        matches: [...player2.matches, newMatch.id],
        updatedAt: new Date()
      };

      newMatches.push(newMatch);

      // Логування для дебагу
      console.log(`Match ${i + 1}/${count}: ${player1.name} (${player1.rating}->${newMatch.player1RatingAfter}) vs ${player2.name} (${player2.rating}->${newMatch.player2RatingAfter})`);
      console.log(`Result: ${player1Score}:${player2Score}, Winner: ${winnerId === player1.id ? player1.name : player2.name}`);
    }

    // Оновлюємо стан одним батчем після завершення всіх симуляцій
    dispatch({ type: 'SET_PLAYERS', payload: currentPlayers });
    dispatch({ type: 'SET_MATCHES', payload: [...state.matches, ...newMatches] });
    
    console.log(`Симуляція завершена: ${count} матчів, рейтинги оновлено`);
  };

  const importCsvMatches = async (warmupRuns: number = 0) => {
    try {
      const url = warmupRuns > 0 
        ? `/api/import-csv?warmupRuns=${warmupRuns}`
        : '/api/import-csv';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('CSV import failed');
      const data = await res.json();

      const players = (data.players as any[]).map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));

      const matches = (data.matches as any[]).map((m) => ({
        ...m,
        date: new Date(m.date),
      }));

      dispatch({ type: 'SET_PLAYERS', payload: players });
      dispatch({ type: 'SET_MATCHES', payload: matches });

      console.log('CSV import summary:', data.summary);
      return data.summary;
    } catch (error) {
      console.error('CSV import failed', error);
      dispatch({ type: 'SET_ERROR', payload: 'Не вдалося імпортувати CSV' });
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ state, addMatch, resetData, loadRealPlayers, simulateRandomMatches, importCsvMatches }}>
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

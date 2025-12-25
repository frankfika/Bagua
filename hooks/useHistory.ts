import { useState, useEffect, useCallback } from 'react';
import { UserInput, BaziResult } from '../types';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  input: UserInput;
  result: BaziResult;
}

const HISTORY_KEY = 'zen_bazi_history';
const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryRecord[];
        setHistory(parsed);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save a new record
  const addRecord = useCallback((input: UserInput, result: BaziResult) => {
    const newRecord: HistoryRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      input,
      result
    };

    setHistory(prev => {
      // Check if same person exists (by name + birthDate + birthTime)
      const existingIndex = prev.findIndex(
        r => r.input.name === input.name &&
             r.input.birthDate === input.birthDate &&
             r.input.birthTime === input.birthTime
      );

      let newHistory: HistoryRecord[];
      if (existingIndex >= 0) {
        // Update existing record
        newHistory = [...prev];
        newHistory[existingIndex] = newRecord;
      } else {
        // Add new record, limit to MAX_HISTORY
        newHistory = [newRecord, ...prev].slice(0, MAX_HISTORY);
      }

      // Persist to localStorage
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save history:', e);
      }

      return newHistory;
    });

    return newRecord;
  }, []);

  // Remove a record
  const removeRecord = useCallback((id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save history:', e);
      }
      return newHistory;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }, []);

  // Get a record by id
  const getRecord = useCallback((id: string) => {
    return history.find(r => r.id === id);
  }, [history]);

  return {
    history,
    addRecord,
    removeRecord,
    clearHistory,
    getRecord
  };
}

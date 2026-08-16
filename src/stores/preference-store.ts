import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getPreference, setPreference } from '../db/queries';
import { isThemePreference, type ThemePreference } from '../theme';

const THEME_KEY = 'theme_preference';

interface PreferenceState {
  themePreference: ThemePreference;
  hydrate: (db: SQLiteDatabase) => Promise<void>;
  setThemePreference: (db: SQLiteDatabase, value: ThemePreference) => Promise<void>;
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  themePreference: 'system',

  hydrate: async (db) => {
    const stored = await getPreference(db, THEME_KEY);
    if (isThemePreference(stored)) {
      set({ themePreference: stored });
    }
  },

  setThemePreference: async (db, value) => {
    await setPreference(db, THEME_KEY, value);
    set({ themePreference: value });
  },
}));

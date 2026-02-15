import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: async (db: SQLiteDatabase): Promise<void> => {
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS triggers (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          notes TEXT,
          category TEXT NOT NULL CHECK (category IN ('sleep', 'stress', 'food', 'weather', 'hormonal', 'other')),
          severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5)
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS episodes (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          notes TEXT,
          severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
          duration_minutes INTEGER,
          symptoms TEXT NOT NULL DEFAULT '[]',
          aura INTEGER NOT NULL DEFAULT 0
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS treatments (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          notes TEXT,
          type TEXT NOT NULL CHECK (type IN ('medication', 'rest', 'hydration', 'caffeine', 'other')),
          name TEXT NOT NULL,
          effective INTEGER
        );
      `);

      await db.runAsync(
        'CREATE INDEX IF NOT EXISTS idx_triggers_timestamp ON triggers (timestamp);'
      );
      await db.runAsync(
        'CREATE INDEX IF NOT EXISTS idx_triggers_category ON triggers (category);'
      );
      await db.runAsync(
        'CREATE INDEX IF NOT EXISTS idx_episodes_timestamp ON episodes (timestamp);'
      );
      await db.runAsync(
        'CREATE INDEX IF NOT EXISTS idx_treatments_timestamp ON treatments (timestamp);'
      );
      await db.runAsync(
        'CREATE INDEX IF NOT EXISTS idx_treatments_type ON treatments (type);'
      );
    },
  },
];

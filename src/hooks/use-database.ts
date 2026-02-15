import React, { createContext, useContext, useEffect, useState } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import { openDatabase } from "../db/database";
import { migrateDbIfNeeded } from "../db/migrate";
import { useTriggerStore } from "../stores/trigger-store";
import { useEpisodeStore } from "../stores/episode-store";
import { useTreatmentStore } from "../stores/treatment-store";
import { useRiskStore } from "../stores/risk-store";

interface DatabaseContextValue {
  db: SQLiteDatabase | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const database = await openDatabase();
      await migrateDbIfNeeded(database);

      if (cancelled) return;
      setDb(database);

      await Promise.all([
        useTriggerStore.getState().hydrate(database),
        useEpisodeStore.getState().hydrate(database),
        useTreatmentStore.getState().hydrate(database),
      ]);
      await useRiskStore.getState().recalculate(database);

      if (!cancelled) {
        setIsReady(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return React.createElement(
    DatabaseContext.Provider,
    { value: { db, isReady } },
    children,
  );
}

export function useDatabase(): SQLiteDatabase {
  const { db } = useContext(DatabaseContext);
  if (!db) {
    throw new Error(
      "useDatabase must be used within a DatabaseProvider after initialization",
    );
  }
  return db;
}

export function useDatabaseReady(): boolean {
  const { isReady } = useContext(DatabaseContext);
  return isReady;
}

import React, { createContext, useContext, useEffect, useState } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import { openDatabase } from "../db/database";
import { migrateDbIfNeeded } from "../db/migrate";
import { useTriggerStore } from "../stores/trigger-store";
import { useEpisodeStore } from "../stores/episode-store";
import { useTreatmentStore } from "../stores/treatment-store";
import { useRiskStore } from "../stores/risk-store";
import {
  usePreferenceStore,
  needsOnboarding,
} from "../stores/preference-store";

interface DatabaseContextValue {
  db: SQLiteDatabase | null;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
  error: null,
});

/**
 * Someone upgrading from a build that predates onboarding has no completion
 * mark but plenty of data. Showing them a welcome screen after six months of
 * logging would be absurd, so treat existing entries as proof the flow is not
 * needed — and as implicit sight of the v1 disclaimer, which those builds
 * carried in Settings. A later disclaimer revision still gates them, because
 * the acknowledged version is recorded rather than merely set.
 */
async function backfillOnboardingForUpgrade(db: SQLiteDatabase): Promise<void> {
  const preferences = usePreferenceStore.getState();
  if (!needsOnboarding(preferences.onboardingVersion)) return;

  const hasData =
    useTriggerStore.getState().triggers.length > 0 ||
    useEpisodeStore.getState().episodes.length > 0 ||
    useTreatmentStore.getState().treatments.length > 0;
  if (!hasData) return;

  await preferences.completeOnboarding(db);
  await preferences.acknowledgeDisclaimer(db);
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const database = await openDatabase();
        await migrateDbIfNeeded(database);

        if (cancelled) return;
        setDb(database);

        await Promise.all([
          useTriggerStore.getState().hydrate(database),
          useEpisodeStore.getState().hydrate(database),
          useTreatmentStore.getState().hydrate(database),
          usePreferenceStore.getState().hydrate(database),
        ]);
        await useRiskStore.getState().recalculate(database);
        await backfillOnboardingForUpgrade(database);

        if (!cancelled) {
          setIsReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return React.createElement(
    DatabaseContext.Provider,
    { value: { db, isReady, error } },
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

export function useDatabaseError(): Error | null {
  const { error } = useContext(DatabaseContext);
  return error;
}

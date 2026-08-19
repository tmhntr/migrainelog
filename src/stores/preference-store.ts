import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getPreference, setPreference } from '../db/queries';
import { isThemePreference, type ThemePreference } from '../theme';

const THEME_KEY = 'theme_preference';
const ONBOARDING_KEY = 'onboarding_completed_version';
const DISCLAIMER_VERSION_KEY = 'disclaimer_acknowledged_version';
const DISCLAIMER_AT_KEY = 'disclaimer_acknowledged_at';

/**
 * Bumped when the flow changes enough that returning users should see it
 * again. That is a real interruption for someone who has been logging for
 * months, so it is not free — most changes should leave this alone.
 */
export const ONBOARDING_VERSION = 1;

/**
 * Bumped only when the wording of the medical disclaimer changes materially.
 * An acknowledgement covers the text that was actually read, so a revision has
 * to be presented and acknowledged again rather than inheriting consent given
 * to older wording.
 */
export const DISCLAIMER_VERSION = 1;

function parseVersion(stored: string | null): number | null {
  if (stored === null) return null;
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

interface PreferenceState {
  themePreference: ThemePreference;
  /** Flow version this device has completed, or null if it never has. */
  onboardingVersion: number | null;
  /** Disclaimer version acknowledged on this device, or null. */
  disclaimerVersion: number | null;

  hydrate: (db: SQLiteDatabase) => Promise<void>;
  setThemePreference: (db: SQLiteDatabase, value: ThemePreference) => Promise<void>;
  completeOnboarding: (db: SQLiteDatabase) => Promise<void>;
  acknowledgeDisclaimer: (db: SQLiteDatabase) => Promise<void>;
  /** Clears the completion mark so Settings can replay the flow. */
  replayOnboarding: (db: SQLiteDatabase) => Promise<void>;
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  themePreference: 'system',
  onboardingVersion: null,
  disclaimerVersion: null,

  hydrate: async (db) => {
    const [theme, onboarding, disclaimer] = await Promise.all([
      getPreference(db, THEME_KEY),
      getPreference(db, ONBOARDING_KEY),
      getPreference(db, DISCLAIMER_VERSION_KEY),
    ]);

    set({
      onboardingVersion: parseVersion(onboarding),
      disclaimerVersion: parseVersion(disclaimer),
    });
    if (isThemePreference(theme)) {
      set({ themePreference: theme });
    }
  },

  setThemePreference: async (db, value) => {
    await setPreference(db, THEME_KEY, value);
    set({ themePreference: value });
  },

  completeOnboarding: async (db) => {
    await setPreference(db, ONBOARDING_KEY, String(ONBOARDING_VERSION));
    set({ onboardingVersion: ONBOARDING_VERSION });
  },

  acknowledgeDisclaimer: async (db) => {
    await setPreference(db, DISCLAIMER_VERSION_KEY, String(DISCLAIMER_VERSION));
    await setPreference(db, DISCLAIMER_AT_KEY, new Date().toISOString());
    set({ disclaimerVersion: DISCLAIMER_VERSION });
  },

  replayOnboarding: async (db) => {
    await setPreference(db, ONBOARDING_KEY, '');
    set({ onboardingVersion: null });
  },
}));

/** True until the flow has been completed at the current version. */
export function needsOnboarding(onboardingVersion: number | null): boolean {
  return onboardingVersion === null || onboardingVersion < ONBOARDING_VERSION;
}

/**
 * True until the *current* disclaimer wording has been acknowledged. Checked
 * independently of onboarding: an upgrading user skips the flow but must still
 * see a revised disclaimer.
 */
export function needsDisclaimer(disclaimerVersion: number | null): boolean {
  return disclaimerVersion === null || disclaimerVersion < DISCLAIMER_VERSION;
}

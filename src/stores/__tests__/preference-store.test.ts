import type { SQLiteDatabase } from 'expo-sqlite';

// queries.ts generates ids via expo-crypto at import time; the preference
// helpers never touch it, so a stub keeps the module graph loadable.
jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'test-uuid') }));

// The store validates the theme value through the theme barrel, which pulls in
// React Native. Only the type guard matters here.
jest.mock('../../theme', () => ({
  isThemePreference: (value: unknown) =>
    value === 'system' || value === 'light' || value === 'dark',
}));

import {
  usePreferenceStore,
  needsOnboarding,
  needsDisclaimer,
  ONBOARDING_VERSION,
  DISCLAIMER_VERSION,
} from '../preference-store';

/**
 * Stands in for the `preferences` table: the store only ever reaches it
 * through getPreference/setPreference, both of which are single-row key-value
 * statements, so a Map is a faithful substitute.
 */
function createPreferenceDb(seed: Record<string, string> = {}) {
  const rows = new Map<string, string>(Object.entries(seed));

  const db = {
    getFirstAsync: jest.fn(async (_sql: string, params: unknown[]) => {
      const value = rows.get(String(params[0]));
      return value === undefined ? null : { value };
    }),
    runAsync: jest.fn(async (_sql: string, params: unknown[]) => {
      rows.set(String(params[0]), String(params[1]));
    }),
  };

  return { db: db as unknown as SQLiteDatabase, rows };
}

beforeEach(() => {
  usePreferenceStore.setState({
    themePreference: 'system',
    onboardingVersion: null,
    disclaimerVersion: null,
  });
});

describe('onboarding gates', () => {
  it('needs onboarding until the current version is completed', () => {
    expect(needsOnboarding(null)).toBe(true);
    expect(needsOnboarding(ONBOARDING_VERSION - 1)).toBe(true);
    expect(needsOnboarding(ONBOARDING_VERSION)).toBe(false);
  });

  // An acknowledgement covers the wording that was actually read. Revising the
  // disclaimer has to ask again rather than inherit the old consent.
  it('needs the disclaimer again when its version moves', () => {
    expect(needsDisclaimer(null)).toBe(true);
    expect(needsDisclaimer(DISCLAIMER_VERSION - 1)).toBe(true);
    expect(needsDisclaimer(DISCLAIMER_VERSION)).toBe(false);
  });
});

describe('hydrate', () => {
  it('reads both versions back from the preferences table', async () => {
    const { db } = createPreferenceDb({
      theme_preference: 'dark',
      onboarding_completed_version: '1',
      disclaimer_acknowledged_version: '1',
    });

    await usePreferenceStore.getState().hydrate(db);

    const state = usePreferenceStore.getState();
    expect(state.themePreference).toBe('dark');
    expect(state.onboardingVersion).toBe(1);
    expect(state.disclaimerVersion).toBe(1);
  });

  it('treats a missing or unparseable mark as never completed', async () => {
    const { db } = createPreferenceDb({ onboarding_completed_version: '' });

    await usePreferenceStore.getState().hydrate(db);

    const state = usePreferenceStore.getState();
    expect(state.onboardingVersion).toBeNull();
    expect(needsOnboarding(state.onboardingVersion)).toBe(true);
  });
});

describe('marks', () => {
  it('records completion at the current version', async () => {
    const { db, rows } = createPreferenceDb();

    await usePreferenceStore.getState().completeOnboarding(db);

    expect(rows.get('onboarding_completed_version')).toBe(String(ONBOARDING_VERSION));
    expect(needsOnboarding(usePreferenceStore.getState().onboardingVersion)).toBe(false);
  });

  it('records the disclaimer version alongside a timestamp', async () => {
    const { db, rows } = createPreferenceDb();

    await usePreferenceStore.getState().acknowledgeDisclaimer(db);

    expect(rows.get('disclaimer_acknowledged_version')).toBe(String(DISCLAIMER_VERSION));
    expect(rows.get('disclaimer_acknowledged_at')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(needsDisclaimer(usePreferenceStore.getState().disclaimerVersion)).toBe(false);
  });

  // Replaying is a request to see the flow again, not to re-consent: the
  // disclaimer acknowledgement survives it.
  it('replay clears completion but leaves the acknowledgement intact', async () => {
    const { db } = createPreferenceDb();
    const store = usePreferenceStore.getState();

    await store.completeOnboarding(db);
    await store.acknowledgeDisclaimer(db);
    await store.replayOnboarding(db);

    const state = usePreferenceStore.getState();
    expect(needsOnboarding(state.onboardingVersion)).toBe(true);
    expect(needsDisclaimer(state.disclaimerVersion)).toBe(false);
  });
});

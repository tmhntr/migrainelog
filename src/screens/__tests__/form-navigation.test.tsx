import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { TriggerFormScreen } from '../TriggerFormScreen';
import { EpisodeFormScreen } from '../EpisodeFormScreen';
import { TreatmentFormScreen } from '../TreatmentFormScreen';

// The forms call useDatabase() at render. The concrete handle is never touched
// because the stores are stubbed below, so a bare object is enough.
jest.mock('../../hooks/use-database', () => ({
  useDatabase: () => ({}),
}));

const mockTriggerStore = {
  triggers: [] as unknown[],
  add: jest.fn(),
  update: jest.fn(),
};
const mockEpisodeStore = {
  episodes: [] as unknown[],
  add: jest.fn(),
  update: jest.fn(),
};
const mockTreatmentStore = {
  treatments: [] as unknown[],
  add: jest.fn(),
  update: jest.fn(),
};

jest.mock('../../stores/trigger-store', () => ({
  useTriggerStore: () => mockTriggerStore,
}));
jest.mock('../../stores/episode-store', () => ({
  useEpisodeStore: () => mockEpisodeStore,
}));
jest.mock('../../stores/treatment-store', () => ({
  useTreatmentStore: () => mockTreatmentStore,
}));

function makeNavigation() {
  return {
    setOptions: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
  };
}

// Each form is a different screen component but they share one contract, so
// drive them through a single table rather than three near-identical tests.
const cases = [
  {
    label: 'trigger',
    Component: TriggerFormScreen,
    store: mockTriggerStore,
    detail: 'TriggerDetail',
    saveLabel: 'Save trigger',
    existing: { id: 'edit-1', category: 'stress', severity: 3, timestamp: '2026-08-19T10:00:00.000Z', notes: null },
    collection: 'triggers' as const,
    fill: undefined as undefined | ((utils: ReturnType<typeof render>) => void),
  },
  {
    label: 'episode',
    Component: EpisodeFormScreen,
    store: mockEpisodeStore,
    detail: 'EpisodeDetail',
    saveLabel: 'Save episode',
    existing: { id: 'edit-1', severity: 5, symptoms: [], aura: false, durationMinutes: null, timestamp: '2026-08-19T10:00:00.000Z', notes: null },
    collection: 'episodes' as const,
    fill: undefined as undefined | ((utils: ReturnType<typeof render>) => void),
  },
  {
    label: 'treatment',
    Component: TreatmentFormScreen,
    store: mockTreatmentStore,
    detail: 'TreatmentDetail',
    saveLabel: 'Save treatment',
    existing: { id: 'edit-1', type: 'medication', name: 'Ibuprofen', timestamp: '2026-08-19T10:00:00.000Z', notes: null, effective: null },
    collection: 'treatments' as const,
    // The treatment form refuses to save without a name.
    fill: (utils: ReturnType<typeof render>) => {
      fireEvent.changeText(
        utils.getByPlaceholderText('e.g. Ibuprofen 400mg'),
        'Sumatriptan 50mg',
      );
    },
  },
];

describe('form screens navigate to the new entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTriggerStore.triggers = [];
    mockEpisodeStore.episodes = [];
    mockTreatmentStore.treatments = [];
  });

  describe.each(cases)(
    '$label form',
    ({ Component, store, detail, saveLabel, existing, collection, fill }) => {
      it('replaces itself with the detail screen after creating', async () => {
        store.add.mockResolvedValue({ id: 'new-id' });
        const navigation = makeNavigation();
        const Screen = Component as unknown as React.ComponentType<{
          navigation: unknown;
          route: unknown;
        }>;

        const utils = render(
          <Screen navigation={navigation} route={{ params: {} }} />,
        );
        fill?.(utils);
        fireEvent.press(utils.getByText(saveLabel));

        await waitFor(() => expect(store.add).toHaveBeenCalledTimes(1));

        // Replace, not push: the back arrow must land on the list, and the
        // spent form must not sit underneath the detail screen.
        expect(navigation.replace).toHaveBeenCalledWith(detail, {
          id: 'new-id',
        });
        expect(navigation.goBack).not.toHaveBeenCalled();
      });

      it('goes back after editing an existing entry', async () => {
        store.update.mockResolvedValue({ id: 'edit-1' });
        (store as Record<string, unknown>)[collection] = [existing];
        const navigation = makeNavigation();
        const Screen = Component as unknown as React.ComponentType<{
          navigation: unknown;
          route: unknown;
        }>;

        const utils = render(
          <Screen navigation={navigation} route={{ params: { id: 'edit-1' } }} />,
        );
        fireEvent.press(utils.getByText('Save changes'));

        await waitFor(() => expect(store.update).toHaveBeenCalledTimes(1));

        // Editing was reached from the detail screen, so returning is correct.
        expect(navigation.goBack).toHaveBeenCalledTimes(1);
        expect(navigation.replace).not.toHaveBeenCalled();
      });
    },
  );
});

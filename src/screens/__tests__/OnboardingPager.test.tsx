import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { OnboardingPager } from '../onboarding/OnboardingPager';
import { usePreferenceStore } from '../../stores/preference-store';

jest.mock('../../hooks/use-database', () => ({
  useDatabase: () => ({ runAsync: jest.fn(), getFirstAsync: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const noop = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  // The pager asks the OS whether motion should be reduced. Answer the default
  // so that query stays out of the assertions.
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<
      typeof AccessibilityInfo.addEventListener
    >);

  usePreferenceStore.setState({
    onboardingVersion: null,
    disclaimerVersion: null,
    completeOnboarding: jest.fn(async () => {}),
    acknowledgeDisclaimer: jest.fn(async () => {}),
  });
});

/** Renders and settles the reduce-motion query the pager fires on mount. */
async function renderPager(props: React.ComponentProps<typeof OnboardingPager>) {
  const utils = render(<OnboardingPager {...props} />);
  await act(async () => {});
  return utils;
}

describe('OnboardingPager', () => {
  it('opens on the welcome frame', async () => {
    await renderPager({ onDone: noop });

    expect(screen.getByText('MigraineLog')).toBeTruthy();
    expect(screen.getByText('Get started')).toBeTruthy();
  });

  // App Review (Guideline 1.4.1) wants the disclaimer in front of the user.
  // This locks both the claims and the fact that they cannot be walked past.
  describe('the disclaimer gate', () => {
    async function advanceToGate() {
      await renderPager({ onDone: noop });
      fireEvent.press(screen.getByText('Get started'));
    }

    it('states what the app does not do', async () => {
      await advanceToGate();

      expect(screen.getByText('This is a notebook, not a diagnosis.')).toBeTruthy();
      expect(
        screen.getByText(/diagnose, treat, or\s+prevent any medical condition/),
      ).toBeTruthy();
      expect(screen.getByText(/predict migraines/)).toBeTruthy();
      expect(screen.getByText(/replaces advice from a clinician/)).toBeTruthy();
    });

    it('offers no way to skip past it', async () => {
      await advanceToGate();

      expect(screen.queryByLabelText('Skip the introduction')).toBeNull();
    });

    it('holds Continue until the box is ticked', async () => {
      await advanceToGate();

      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

      fireEvent.press(screen.getByLabelText('I understand'));

      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
    });

    // Ticking is not consent until the frame is left — a box ticked and then
    // unticked must not leave an acknowledgement behind.
    it('records nothing while the user is still on the frame', async () => {
      await advanceToGate();

      fireEvent.press(screen.getByLabelText('I understand'));

      expect(usePreferenceStore.getState().acknowledgeDisclaimer).not.toHaveBeenCalled();
    });

    it('records the acknowledgement on leaving the frame', async () => {
      await advanceToGate();

      fireEvent.press(screen.getByLabelText('I understand'));
      fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() =>
        expect(usePreferenceStore.getState().acknowledgeDisclaimer).toHaveBeenCalled(),
      );
    });
  });

  describe('disclaimer-only mode', () => {
    it('presents the gate alone, with no progress and no skip', async () => {
      await renderPager({ mode: 'disclaimer', onDone: noop });

      expect(screen.getByText('This is a notebook, not a diagnosis.')).toBeTruthy();
      expect(screen.queryByText('Get started')).toBeNull();
      expect(screen.queryByLabelText('Skip the introduction')).toBeNull();
      expect(screen.queryByLabelText(/^Step \d+ of/)).toBeNull();
    });

    // An established user meeting revised wording has already seen the rest of
    // the flow; acknowledging returns them to the app, not through it.
    it('hands back once acknowledged', async () => {
      const onDone = jest.fn();
      await renderPager({ mode: 'disclaimer', onDone });

      fireEvent.press(screen.getByLabelText('I understand'));
      fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() => expect(onDone).toHaveBeenCalledWith('dashboard'));
    });

    it('leaves the completion mark alone', async () => {
      const onDone = jest.fn();
      await renderPager({ mode: 'disclaimer', onDone });

      fireEvent.press(screen.getByLabelText('I understand'));
      fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() => expect(onDone).toHaveBeenCalled());
      expect(usePreferenceStore.getState().completeOnboarding).not.toHaveBeenCalled();
    });
  });
});

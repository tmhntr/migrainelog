import React from 'react';
import { render } from '@testing-library/react-native';

import { SettingsScreen } from '../SettingsScreen';

// Navigation props are unused by SettingsScreen's render path; treat it as a
// no-prop component so the test doesn't need to construct a full nav prop.
const Screen = SettingsScreen as unknown as React.ComponentType;

// SettingsScreen calls useDatabase() at render; the concrete DB isn't needed to
// assert static content, so stub the hook to a no-op handle.
jest.mock('../../hooks/use-database', () => ({
  useDatabase: () => ({ runAsync: jest.fn() }),
}));

describe('SettingsScreen', () => {
  // App Review (Guideline 1.4.1) requires an in-app medical disclaimer. This
  // locks the copy so it can't be dropped without a failing test.
  it('shows the medical disclaimer', () => {
    const { getByText } = render(<Screen />);

    expect(getByText('Medical Disclaimer')).toBeTruthy();
    expect(
      getByText(/does not diagnose, treat, or\s+prevent any medical condition/),
    ).toBeTruthy();
    expect(getByText(/Consult a\s+qualified healthcare provider/)).toBeTruthy();
  });
});

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { ErrorBoundary } from '../ErrorBoundary';

// A child that throws on render, to exercise the boundary's catch path.
function Boom(): React.ReactElement {
  throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
  // React logs caught render errors to console.error; silence it so the test
  // output stays readable.
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders children when there is no error', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <Text>Healthy content</Text>
      </ErrorBoundary>,
    );

    expect(getByText('Healthy content')).toBeTruthy();
    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('renders the fallback when a child throws during render', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText(/Your saved data is safe/)).toBeTruthy();
    expect(queryByText('Healthy content')).toBeNull();
  });
});

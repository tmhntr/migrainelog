# Testing Guide

This document provides comprehensive information about the testing setup and practices for the Migraine Log application.

## Table of Contents

- [Overview](#overview)
- [Test Stack](#test-stack)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [CI/CD](#cicd)
- [Best Practices](#best-practices)

---

## Overview

The project uses a multi-layered testing strategy:

- **Unit Tests** - Test individual functions and components in isolation
- **Integration Tests** - Test how components work together
- **E2E Tests** - Test complete user workflows with Playwright

### Test Coverage

Current test coverage includes:

- ✅ Utility functions (validation, date formatting)
- ✅ Services (episode CRUD operations)
- ✅ Components (StatCard, EpisodeCard)
- ✅ E2E flows (authentication, episode management)

---

## Test Stack

### Unit & Integration Testing

- **[Vitest](https://vitest.dev/)** - Fast unit test framework with native ESM support
- **[React Testing Library](https://testing-library.com/react)** - User-centric component testing
- **[Testing Library User Event](https://testing-library.com/docs/user-event/intro)** - Realistic user interactions
- **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** - Custom Jest matchers for DOM

### E2E Testing

- **[Playwright](https://playwright.dev/)** - Cross-browser end-to-end testing
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile viewports**: Pixel 5, iPhone 12

---

## Running Tests

### Unit & Integration Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run all tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# View test report
npm run test:e2e:report
```

---

## Test Structure

```
migrainelog/
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       ├── StatCard.tsx
│   │       └── __tests__/
│   │           └── StatCard.test.tsx
│   ├── services/
│   │   ├── episodeService.ts
│   │   └── __tests__/
│   │       └── episodeService.test.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── __tests__/
│   │       └── validation.test.ts
│   └── test/
│       ├── setup.ts              # Global test setup
│       ├── utils.tsx              # Test utilities
│       ├── mocks/
│       │   └── supabase.ts       # Supabase mocks
│       └── fixtures/
│           └── episodes.ts        # Test data
└── tests/                         # E2E tests
    ├── auth.spec.ts
    └── episodes.spec.ts
```

### Naming Conventions

- Unit/Integration tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Test directories: `__tests__/` adjacent to source files

---

## Writing Tests

### Unit Tests

Test pure functions and business logic:

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '../date';

describe('formatDate', () => {
  it('should format date with default format', () => {
    const date = new Date('2025-01-01T10:00:00Z');
    const result = formatDate(date);
    expect(result).toBe('January 1st, 2025');
  });
});
```

### Component Tests

Test React components with user interactions:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Total Episodes" value={42} />);

    expect(screen.getByText('Total Episodes')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
```

### Service Tests with Mocks

Test services with mocked dependencies:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { episodeService } from '../episodeService';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('EpisodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch episodes', async () => {
    // Setup mocks and assertions
  });
});
```

### E2E Tests

Test complete user workflows:

```typescript
import { test, expect } from '@playwright/test';

test('should allow user signup', async ({ page }) => {
  await page.goto('/signup');

  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel('Confirm Password').fill('password123');

  await page.getByRole('button', { name: 'Sign Up' }).click();

  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

---

## Coverage

### Coverage Thresholds

Minimum coverage requirements:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Viewing Coverage

```bash
# Generate HTML coverage report
npm run test:coverage

# Open in browser
open coverage/index.html
```

### Coverage Exclusions

The following are excluded from coverage:

- `node_modules/`
- `src/test/` - Test utilities
- `**/*.d.ts` - Type definitions
- `**/*.config.*` - Config files
- `tests/` - E2E tests
- `dist/` - Build output
- `.github/` - GitHub workflows
- `src/vite-env.d.ts` - Vite types
- `src/routeTree.gen.ts` - Generated router
- `src/main.tsx` - Entry point

---

## CI/CD

### GitHub Actions Workflows

#### Unit Tests (`test.yml`)

Runs on every push and PR:

- ✅ Linting
- ✅ Type checking
- ✅ Unit tests
- ✅ Coverage reporting
- 📊 Uploads coverage artifacts

#### E2E Tests (`playwright.yml`)

Runs on every push and PR:

- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Cached browser installations
- ✅ Matrix strategy for parallel execution
- 📊 Uploads test reports and results
- 🎯 Smart browser selection (all browsers on `main`, Chromium only on feature branches)

#### Deployment (`deploy.yml`)

Runs on push to `main`:

- 🏗️ Builds production bundle
- 🚀 Deploys to GitHub Pages
- 🔒 Secure with GitHub tokens
- ⚡ Optimized with npm caching

### Branch Protection

Recommended branch protection rules for `main`:

1. Require status checks to pass:
   - `Run Tests`
   - `Playwright E2E Tests`
2. Require branches to be up to date
3. Require pull request reviews

---

## Best Practices

### Test Organization

1. **Co-locate tests** - Place tests in `__tests__/` directories next to source files
2. **Use descriptive names** - Test names should describe what they test
3. **Follow AAA pattern** - Arrange, Act, Assert
4. **Keep tests isolated** - Each test should be independent

### Component Testing

1. **Test user behavior** - Focus on what users see and do, not implementation details
2. **Use accessible queries** - Prefer `getByRole`, `getByLabelText`, etc.
3. **Avoid testing implementation** - Don't test internal state or methods
4. **Mock external dependencies** - Mock API calls, routing, etc.

### E2E Testing

1. **Test critical paths** - Focus on core user journeys
2. **Use data attributes** - Add `data-testid` for reliable selectors
3. **Handle async properly** - Use `waitFor*` methods
4. **Clean up test data** - Create isolated test users

### Mocking

1. **Mock at boundaries** - Mock external services (Supabase, APIs)
2. **Use factories** - Create reusable test data factories
3. **Reset mocks** - Clear mocks between tests with `beforeEach`
4. **Avoid over-mocking** - Only mock what's necessary

### Coverage Goals

1. **Focus on critical code** - Prioritize business logic
2. **Don't chase 100%** - Aim for meaningful coverage
3. **Test edge cases** - Cover error scenarios
4. **Ignore trivial code** - Don't test simple getters/setters

---

## Troubleshooting

### Common Issues

#### Tests timeout

```bash
# Increase timeout in test file
test('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

#### Mock not working

```bash
# Ensure mock is defined before imports
vi.mock('@/lib/supabase', () => ({
  supabase: { /* mock */ }
}));

import { episodeService } from '../episodeService';
```

#### Coverage not generated

```bash
# Clear cache and regenerate
rm -rf node_modules/.vite
npm run test:coverage
```

#### E2E tests fail locally

```bash
# Ensure dev server is running
npm run dev

# In another terminal
npm run test:e2e
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🧪**

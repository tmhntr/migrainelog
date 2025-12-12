# E2E Testing with Playwright

This directory contains end-to-end tests for the Migraine Log application using [Playwright](https://playwright.dev/).

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing New Tests](#writing-new-tests)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Our E2E test suite covers:

- **Authentication flows** - signup, login, logout, protected routes
- **Episode CRUD operations** - create, read, update, delete episodes
- **Form validation** - required fields, data validation
- **User interactions** - multi-select components, dynamic fields
- **Navigation** - routing, protected routes, redirects

## Setup

### Install Playwright Browsers

Before running tests for the first time, you need to install the browser binaries:

```bash
npx playwright install
```

This will download Chromium, Firefox, and WebKit browsers that Playwright uses for testing.

### Environment Setup

The tests use the local development server. Make sure you have:

1. Your Supabase project configured (`.env` file with correct credentials)
2. Database tables created and accessible
3. The development server can run on port 5173

## Running Tests

### Run All Tests (Headless)

```bash
npm run test:e2e
```

This runs all tests in headless mode across all configured browsers (Chromium, Firefox, WebKit).

### Run Tests with UI Mode

```bash
npm run test:e2e:ui
```

Opens the Playwright Test UI where you can:
- See all tests in a visual interface
- Run individual tests
- See test results in real-time
- Debug failed tests
- View traces and screenshots

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

Runs tests with the Playwright Inspector:
- Step through tests line by line
- See actionability logs
- Edit and run code live
- Pick locators visually

### Run Tests in Headed Mode

```bash
npm run test:e2e:headed
```

Runs tests with browser windows visible (useful for watching tests execute).

### Run Tests on Specific Browser

```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Run Specific Test File

```bash
npx playwright test tests/auth.spec.ts
npx playwright test tests/episodes.spec.ts
```

### Run Specific Test by Name

```bash
npx playwright test -g "should allow user signup"
```

### View Test Report

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

## Test Structure

```
tests/
├── README.md                 # This file
├── auth.spec.ts             # Authentication tests
├── episodes.spec.ts         # Episode CRUD tests
└── utils/
    ├── auth-helpers.ts      # Authentication helper functions
    ├── test-data.ts         # Mock episode data and fixtures
    └── assertions.ts        # Custom assertion functions
```

### Test Files

#### `auth.spec.ts`

Tests for user authentication:
- User signup with validation
- User login with valid/invalid credentials
- User logout
- Protected route access
- Navigation between login/signup pages

#### `episodes.spec.ts`

Tests for episode management:
- Creating episodes (minimal and complete)
- Viewing episode list
- Viewing episode details
- Editing episodes
- Deleting episodes with confirmation
- Form validation
- Dynamic fields (medications, multi-select)

### Utility Files

#### `utils/auth-helpers.ts`

Reusable authentication functions:
- `generateTestUser()` - Creates unique test user credentials
- `signUp(page, user)` - Signs up a new user
- `signIn(page, user)` - Signs in an existing user
- `signOut(page)` - Signs out current user
- `verifyProtectedRoute(page, route)` - Verifies redirect to login

#### `utils/test-data.ts`

Mock episode data:
- `minimalEpisode` - Minimal required fields
- `completeEpisode` - All fields filled
- `severeEpisode` - High severity episode
- `mildEpisode` - Low severity episode
- `hormonalEpisode` - Episode with hormonal trigger
- `generateMultipleEpisodes(count)` - Generate multiple test episodes

#### `utils/assertions.ts`

Custom assertion helpers:
- `assertEpisodeCardData(page, data)` - Verify episode card
- `assertEpisodeDetailData(page, data)` - Verify episode detail page
- `assertErrorMessage(page, text)` - Verify error messages
- `assertSuccessMessage(page, text)` - Verify success messages
- `assertEpisodeCount(page, count)` - Verify episode list count
- `assertConfirmationDialog(page, title, description)` - Verify dialogs

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    // e.g., login user, navigate to page
  });

  test('should do something specific', async ({ page }) => {
    // Arrange - Set up test data and conditions
    await page.goto('/some-route');

    // Act - Perform the action being tested
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assert - Verify the expected outcome
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Using Test Utilities

```typescript
import { generateTestUser, signUp } from './utils/auth-helpers';
import { completeEpisode } from './utils/test-data';

test('example test with utilities', async ({ page }) => {
  // Create and login a user
  const testUser = generateTestUser();
  await signUp(page, testUser);

  // Use test data
  await fillEpisodeForm(page, completeEpisode);
});
```

### Common Locator Patterns

```typescript
// By role (preferred)
await page.getByRole('button', { name: 'Sign In' });
await page.getByRole('heading', { name: 'Dashboard' });
await page.getByRole('textbox', { name: 'Email' });

// By label (for form inputs)
await page.getByLabel('Email');
await page.getByLabel('Password');

// By text
await page.getByText('Welcome back');
await page.getByText(/error/i); // Case-insensitive regex

// By test ID (add data-testid attributes)
await page.getByTestId('episode-card');

// By CSS selector (use sparingly)
await page.locator('.episode-card');
```

## Common Patterns

### Creating an Authenticated Session

```typescript
test.beforeEach(async ({ page }) => {
  const testUser = generateTestUser();
  await signUp(page, testUser);
  // Now the user is logged in for this test
});
```

### Filling Complex Forms

```typescript
// Multi-select components
await page.getByRole('button', { name: /select pain locations/i }).click();
await page.getByText('Forehead').click();
await page.getByText('Temples').click();
await page.keyboard.press('Escape'); // Close dropdown

// Dynamic array fields (medications)
await page.getByRole('button', { name: /add medication/i }).click();
await page.getByLabel('Medication Name').nth(0).fill('Ibuprofen');
await page.getByLabel('Dosage').nth(0).fill('400mg');
```

### Waiting for Navigation

```typescript
// Wait for specific URL
await page.waitForURL('/episodes');

// Wait for URL pattern
await page.waitForURL(/\/episodes\/[a-zA-Z0-9-]+/);

// Click and wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.getByRole('link', { name: 'Episodes' }).click(),
]);
```

### Working with Dialogs

```typescript
// Wait for dialog to appear
await expect(page.getByRole('dialog')).toBeVisible();

// Fill dialog form
await page.getByLabel('Name').fill('Test');

// Close dialog
await page.getByRole('button', { name: 'Cancel' }).click();
// or
await page.keyboard.press('Escape');
```

### Handling Async Operations

```typescript
// Wait for element to be visible
await expect(page.getByText('Loading...')).toBeVisible();
await expect(page.getByText('Loading...')).not.toBeVisible();

// Wait for success message
await expect(
  page.getByText(/success/i)
).toBeVisible({ timeout: 10000 });
```

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// Good
test('should show error when email is invalid', async ({ page }) => {});

// Bad
test('email test', async ({ page }) => {});
```

### 2. Keep Tests Independent

Each test should be able to run independently. Don't rely on the state from previous tests.

```typescript
// Good - each test creates its own user
test.beforeEach(async ({ page }) => {
  const testUser = generateTestUser();
  await signUp(page, testUser);
});

// Bad - relying on shared state
let sharedUser: TestUser;
test.beforeAll(() => {
  sharedUser = generateTestUser();
});
```

### 3. Use Semantic Locators

Prefer locators that match how users interact with the page:

```typescript
// Good - uses role and accessible name
await page.getByRole('button', { name: 'Sign In' });

// Bad - brittle CSS selector
await page.locator('button.btn-primary').click();
```

### 4. Add Explicit Waits

Don't rely on implicit waits. Be explicit about what you're waiting for:

```typescript
// Good
await expect(page.getByText('Success')).toBeVisible();

// Less reliable
await page.waitForTimeout(2000); // Avoid arbitrary timeouts
```

### 5. Use Test Data Factories

Use the test data utilities instead of hardcoding values:

```typescript
// Good
import { completeEpisode } from './utils/test-data';
await fillEpisodeForm(page, completeEpisode);

// Bad
await page.getByLabel('Severity').fill('8');
await page.getByLabel('Notes').fill('Some random notes');
```

### 6. Clean Up After Tests

While Playwright runs tests in isolation, clean up resources when needed:

```typescript
test.afterEach(async ({ page }) => {
  // Clean up if needed
  await signOut(page);
});
```

### 7. Add Data Attributes for Testing

When selectors are difficult, add `data-testid` attributes:

```tsx
// In component
<div data-testid="episode-card">...</div>

// In test
await page.getByTestId('episode-card');
```

### 8. Group Related Tests

Use `test.describe` to group related tests:

```typescript
test.describe('Episode Creation', () => {
  test('should create minimal episode', async ({ page }) => {});
  test('should create complete episode', async ({ page }) => {});
  test('should validate required fields', async ({ page }) => {});
});
```

## Troubleshooting

### Tests Timing Out

If tests are timing out:

1. **Increase timeout** in `playwright.config.ts`:
   ```typescript
   timeout: 60 * 1000, // 60 seconds
   ```

2. **Check if dev server is running**:
   ```bash
   npm run dev
   ```

3. **Run tests in headed mode** to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```

### Selectors Not Found

If selectors aren't working:

1. **Use Playwright Inspector** to pick selectors:
   ```bash
   npm run test:e2e:debug
   ```

2. **Check if element is in viewport**:
   ```typescript
   await page.getByText('Submit').scrollIntoViewIfNeeded();
   ```

3. **Wait for element to be visible**:
   ```typescript
   await expect(page.getByText('Submit')).toBeVisible();
   ```

### Tests Failing Intermittently

For flaky tests:

1. **Add explicit waits**:
   ```typescript
   await expect(page.getByText('Loading...')).not.toBeVisible();
   ```

2. **Check for race conditions** - ensure async operations complete

3. **Increase retry count** in CI (already configured in `playwright.config.ts`)

### Authentication Issues

If authentication tests fail:

1. **Check Supabase credentials** in `.env`
2. **Verify database is accessible**
3. **Check email format** - use unique emails per test

### Browser Not Installed

If you get "Browser not found" error:

```bash
npx playwright install
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging Tests](https://playwright.dev/docs/debug)

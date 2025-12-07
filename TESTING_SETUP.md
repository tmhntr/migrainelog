# Playwright E2E Testing Setup Guide

This guide will help you get started with E2E testing for the Migraine Log application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase project configured with valid credentials in `.env` file

## Installation Steps

### 1. Install Playwright Browser Binaries

After cloning the repository and running `npm install`, you need to install the Playwright browser binaries:

```bash
npx playwright install
```

This command downloads Chromium, Firefox, and WebKit browsers that Playwright uses for testing. This is a **one-time setup** per machine.

If you only want to install specific browsers:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### 2. Verify Installation

Check that Playwright is installed correctly:

```bash
npx playwright --version
```

You should see output like: `Version 1.x.x`

### 3. Verify Configuration

Ensure your `playwright.config.ts` exists and is properly configured. The dev server should be set to `http://localhost:5173`.

## Running Your First Test

### 1. Start the Development Server (Optional)

The tests will automatically start the dev server, but you can start it manually if you prefer:

```bash
npm run dev
```

### 2. Run Tests in UI Mode (Recommended for First Time)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all available tests
- Run individual tests or groups
- Watch tests execute in real-time
- View traces and screenshots
- Debug failures

### 3. Run All Tests in Headless Mode

```bash
npm run test:e2e
```

This runs all tests in the background across all configured browsers.

### 4. Run Tests in Headed Mode (Watch Execution)

```bash
npm run test:e2e:headed
```

This opens browser windows so you can watch tests execute.

## Common Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with interactive UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests on specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests matching a pattern
npx playwright test -g "should allow user signup"
```

## What's Included

### Test Files

- `tests/auth.spec.ts` - Authentication flow tests (11 tests)
  - User signup with validation
  - User login with valid/invalid credentials
  - User logout
  - Protected route access
  - Navigation between auth pages

- `tests/episodes.spec.ts` - Episode CRUD tests (14 tests)
  - Creating episodes (minimal and complete)
  - Viewing episode list and details
  - Editing episodes
  - Deleting episodes with confirmation
  - Form validation
  - Dynamic fields (medications, multi-select)

### Test Utilities

- `tests/utils/auth-helpers.ts` - Authentication helper functions
- `tests/utils/test-data.ts` - Mock episode data for testing
- `tests/utils/assertions.ts` - Custom assertion functions

### Configuration

- `playwright.config.ts` - Main Playwright configuration
  - Browser configurations (Chromium, Firefox, WebKit)
  - Test timeout and retry settings
  - Screenshot and video capture on failure
  - Dev server auto-start configuration

## Troubleshooting

### "Executable doesn't exist" Error

If you see an error like "Executable doesn't exist at ..."

**Solution**: Install the browser binaries:
```bash
npx playwright install
```

### Tests Timing Out

If tests are timing out:

1. **Check if the dev server starts correctly**:
   ```bash
   npm run dev
   ```
   Verify it runs on `http://localhost:5173`

2. **Check Supabase credentials**:
   Ensure your `.env` file has valid Supabase credentials

3. **Run tests in headed mode** to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```

### Authentication Tests Failing

If authentication tests fail:

1. **Verify Supabase is accessible**:
   - Check your internet connection
   - Verify Supabase project is active
   - Check `.env` file has correct credentials

2. **Check database tables exist**:
   - Ensure the `episodes` table is created
   - Verify Row Level Security policies are configured

### Port Already in Use

If port 5173 is already in use:

1. **Stop the existing dev server**
2. **Or change the port** in `vite.config.ts` and `playwright.config.ts`

## Test Coverage

### Authentication (11 tests)
- User signup with valid credentials
- Error handling for mismatched passwords
- Error handling for short passwords
- Login with valid credentials
- Error handling for invalid email
- Error handling for invalid password
- User logout
- Protected route redirects
- Authenticated user redirects from login/signup
- Navigation between login and signup pages

### Episodes (14 tests)
- Empty state display
- Dialog opening for new episode
- Creating minimal episode
- Creating complete episode
- Form validation
- Viewing multiple episodes
- Navigating to episode detail
- Editing episodes
- Deleting episodes with confirmation
- Canceling deletion
- Adding/removing medications
- Multi-select pain locations
- Episode with end time

**Total: 25 comprehensive E2E tests**

## Next Steps

1. **Read the full documentation**: See `tests/README.md` for detailed information
2. **Write new tests**: Follow the patterns in existing test files
3. **Add test IDs**: Add `data-testid` attributes to components for easier testing
4. **Run tests in CI**: Configure GitHub Actions or your CI/CD pipeline
5. **Monitor test results**: Review HTML reports after test runs

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Test Utilities README](./tests/README.md)
- [Best Practices](https://playwright.dev/docs/best-practices)

## Quick Reference

### File Structure
```
migrainelog/
├── playwright.config.ts          # Playwright configuration
├── tests/
│   ├── README.md                 # Detailed test documentation
│   ├── auth.spec.ts              # Authentication tests
│   ├── episodes.spec.ts          # Episode CRUD tests
│   └── utils/
│       ├── auth-helpers.ts       # Auth utilities
│       ├── test-data.ts          # Test fixtures
│       └── assertions.ts         # Custom assertions
├── test-results/                 # Test execution results (gitignored)
└── playwright-report/            # HTML test reports (gitignored)
```

### npm Scripts
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:chromium": "playwright test --project=chromium",
  "test:e2e:firefox": "playwright test --project=firefox",
  "test:e2e:webkit": "playwright test --project=webkit",
  "test:e2e:report": "playwright show-report"
}
```

## Support

For issues or questions:
1. Check the [Playwright Documentation](https://playwright.dev/)
2. Review the [tests/README.md](./tests/README.md) file
3. Look at existing test examples in `tests/` directory

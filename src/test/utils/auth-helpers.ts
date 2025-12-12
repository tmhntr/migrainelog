import { type Page, expect } from '@playwright/test';

/**
 * Authentication Helper Functions
 *
 * Reusable functions for authentication flows in E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
}

/**
 * Generate a unique test user with timestamp
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `test-user-${timestamp}@example.com`,
    password: 'TestPassword123!',
  };
}

/**
 * Sign up a new user
 */
export async function signUp(page: Page, user: TestUser) {
  await page.goto('/signup');

  // Wait for the signup form to be visible
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

  // Fill in the signup form
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByLabel('Confirm Password').fill(user.password);

  // Submit the form
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Wait for redirect to dashboard (authenticated route)
  await page.waitForURL('/', { timeout: 10000 });

  // Verify we're logged in by checking for user-specific elements
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

/**
 * Sign in an existing user
 */
export async function signIn(page: Page, user: TestUser) {
  await page.goto('/login');

  // Wait for the login form to be visible
  await expect(page.getByRole('heading', { name: 'Migraine Log' })).toBeVisible();

  // Fill in the login form
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);

  // Submit the form
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 10000 });

  // Verify we're logged in
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page) {
  // Open the menu (hamburger on mobile, menu icon on desktop)
  const menuButton = page.getByRole('button', { name: /toggle menu/i }).or(page.getByLabel(/toggle menu/i));
  await menuButton.click();

  // Wait for menu to open and click logout (use only menuitem role)
  const logoutButton = page.getByRole('menuitem', { name: /log out/i });
  await expect(logoutButton).toBeVisible({ timeout: 5000 });
  await logoutButton.click();

  // Wait for redirect to about page (changed from login)
  await page.waitForURL('/about', { timeout: 5000 });

  // Verify we're on the about page
  await expect(page.getByRole('heading', { name: /migraine log/i })).toBeVisible();
}

/**
 * Check if user is authenticated by verifying dashboard is accessible
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/');
    await page.waitForURL('/', { timeout: 3000 });
    return page.url().includes('/') && !page.url().includes('/login');
  } catch {
    return false;
  }
}

/**
 * Attempt to access a protected route and verify redirect to about page
 */
export async function verifyProtectedRoute(page: Page, route: string) {
  await page.goto(route);

  // Should redirect to about page (changed from login)
  await page.waitForURL('/about', { timeout: 5000 });
  await expect(page.getByRole('heading', { name: /migraine log/i })).toBeVisible();
}

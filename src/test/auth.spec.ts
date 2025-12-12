import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  signUp,
  signOut,
  verifyProtectedRoute,
} from './utils/auth-helpers';
import type { TestUser } from './utils/auth-helpers';

/**
 * Authentication Flow E2E Tests
 *
 * Tests for user authentication including:
 * - Signup with new user
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Logout
 * - Protected route redirects
 */

test.describe('Authentication', () => {
  let testUser: TestUser;

  test.beforeEach(() => {
    // Generate a unique test user for each test
    testUser = generateTestUser();
  });

  test('should allow user signup with valid credentials', async ({ page }) => {
    await page.goto('/signup');

    // Verify we're on the signup page
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(
      page.getByText('Start tracking your migraine episodes today')
    ).toBeVisible();

    // Fill in the signup form
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill(testUser.password);
    await page.getByLabel('Confirm Password').fill(testUser.password);

    // Submit the form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Wait for successful redirect to dashboard
    await page.waitForURL('/', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Verify URL is the root (authenticated)
    expect(page.url()).toContain('/');
    expect(page.url()).not.toContain('/signup');
    expect(page.url()).not.toContain('/login');
  });

  test('should show error for mismatched passwords on signup', async ({ page }) => {
    await page.goto('/signup');

    // Fill in the signup form with mismatched passwords
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill(testUser.password);
    await page.getByLabel('Confirm Password').fill('DifferentPassword123!');

    // Submit the form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Verify error message is displayed
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();

    // Verify we're still on the signup page
    expect(page.url()).toContain('/signup');
  });

  test('should show error for short password on signup', async ({ page }) => {
    await page.goto('/signup');

    // Fill in the signup form with a short password
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill('12345');
    await page.getByLabel('Confirm Password').fill('12345');

    // Submit the form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Verify error message is displayed
    await expect(
      page.getByText(/password must be at least 6 characters/i)
    ).toBeVisible();

    // Verify we're still on the signup page
    expect(page.url()).toContain('/signup');
  });

  test('should allow login with valid credentials', async ({ page }) => {
    // First, create a user
    await signUp(page, testUser);

    // Sign out
    await signOut(page);

    // Now try to sign in
    await page.goto('/login');

    // Verify we're on the login page
    await expect(page.getByRole('heading', { name: 'Migraine Log' })).toBeVisible();
    await expect(
      page.getByText('Sign in to track your migraine episodes')
    ).toBeVisible();

    // Fill in the login form
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for successful redirect to dashboard
    await page.waitForURL('/', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Verify URL is the root (authenticated)
    expect(page.url()).toContain('/');
    expect(page.url()).not.toContain('/login');
  });

  test('should show error for invalid email on login', async ({ page }) => {
    await page.goto('/login');

    // Fill in the login form with non-existent email
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('SomePassword123!');

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for error message
    await expect(
      page.locator('.bg-destructive\\/10, .text-destructive')
    ).toBeVisible({ timeout: 5000 });

    // Verify we're still on the login page
    expect(page.url()).toContain('/login');
  });

  test('should show error for invalid password on login', async ({ page }) => {
    // First, create a user
    await signUp(page, testUser);
    await signOut(page);

    // Try to login with wrong password
    await page.goto('/login');

    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill('WrongPassword123!');

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for error message
    await expect(
      page.locator('.bg-destructive\\/10, .text-destructive')
    ).toBeVisible({ timeout: 5000 });

    // Verify we're still on the login page
    expect(page.url()).toContain('/login');
  });

  test('should successfully logout user', async ({ page }) => {
    // First, create and login a user
    await signUp(page, testUser);

    // Verify we're logged in
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Sign out
    await signOut(page);

    // Verify we're on the login page
    await expect(page.getByRole('heading', { name: 'Migraine Log' })).toBeVisible();
    expect(page.url()).toContain('/login');
  });

  test('should redirect to login when accessing protected route without authentication', async ({
    page,
  }) => {
    // Try to access dashboard without being logged in
    await verifyProtectedRoute(page, '/');

    // Try to access episodes page without being logged in
    await verifyProtectedRoute(page, '/episodes');

    // Try to access analysis page without being logged in
    await verifyProtectedRoute(page, '/analysis');
  });

  test('should redirect authenticated user from login page to dashboard', async ({
    page,
  }) => {
    // First, create and login a user
    await signUp(page, testUser);

    // Verify we're logged in
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Try to access login page while authenticated
    await page.goto('/login');

    // Should redirect back to dashboard
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should redirect authenticated user from signup page to dashboard', async ({
    page,
  }) => {
    // First, create and login a user
    await signUp(page, testUser);

    // Verify we're logged in
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Try to access signup page while authenticated
    await page.goto('/signup');

    // Should redirect back to dashboard
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should have links between login and signup pages', async ({ page }) => {
    // Start on login page
    await page.goto('/login');

    // Click sign up link
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();

    // Verify we're on signup page
    await page.waitForURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Click sign in link
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();

    // Verify we're back on login page
    await page.waitForURL('/login');
    await expect(page.getByRole('heading', { name: 'Migraine Log' })).toBeVisible();
  });
});

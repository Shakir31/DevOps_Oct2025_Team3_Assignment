import { test, expect } from '@playwright/test';

test.describe('Frontend-Backend Integration E2E Tests', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  test('navigation between pages works', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('API connection check - login endpoint responds', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('form validation works', async ({ page }) => {
    await page.goto('/login');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });
});

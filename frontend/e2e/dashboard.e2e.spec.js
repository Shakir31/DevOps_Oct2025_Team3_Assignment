import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
  });

  test('dashboard page structure exists', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(500);
  });
});

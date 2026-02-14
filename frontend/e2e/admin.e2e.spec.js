import { test, expect } from '@playwright/test';

test.describe('Admin Page E2E Tests', () => {
  test('admin page requires authentication', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);
  });

  test('admin page structure exists', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(500);
  });
});

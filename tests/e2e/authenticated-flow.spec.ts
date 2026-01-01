import { test, expect } from '@playwright/test';

test.describe('Authenticated User Flow', () => {
  const email = process.env.E2E_EMAIL!;
  const password = process.env.E2E_PASSWORD!;
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('complete authenticated journey', async ({ page }) => {
    // 1. Login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // 2. Navigate to Events
    await page.click('text=Events');
    await expect(page).toHaveURL(/.*events/);
    
    // 3. Create a new event
    await page.click('text=Create Event');
    await expect(page).toHaveURL(/.*events\/new/);
    
    const eventTitle = `E2E Test Event ${Date.now()}`;
    await page.fill('input[name="title"]', eventTitle);
    await page.fill('textarea[name="description"]', 'This is an automated E2E test event');
    await page.fill('input[name="location"]', 'Test Location');
    
    // Set dates (current date + 1 week for start, + 2 weeks for end)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    
    await page.fill('input[name="start_date"]', startDate.toISOString().slice(0, 16));
    await page.fill('input[name="end_date"]', endDate.toISOString().slice(0, 16));
    
    // Select event type
    await page.selectOption('select[name="event_type"]', 'conference');
    
    // Select target audience
    await page.selectOption('select[name="target_audience"]', 'all');
    
    // Set status to published so we can test public link
    await page.selectOption('select[name="status"]', 'published');
    
    // Submit form
    await page.click('button:has-text("Create Event")');
    
    // Wait for redirect to event detail page
    await page.waitForURL(/.*events\/[a-z0-9-]+$/, { timeout: 10000 });
    
    // Verify event was created
    await expect(page.locator('h1')).toContainText(eventTitle);
    
    // Store event ID for later
    const url = page.url();
    const eventId = url.split('/').pop();
    
    // 4. Navigate to Feedback page
    await page.click('text=Feedback');
    await expect(page).toHaveURL(/.*feedback/);
    
    // Initially should show no feedback
    // (or existing feedback if data wasn't cleared)
    
    // 5. Check dashboard metrics
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify dashboard cards exist
    await expect(page.locator('text=Total Events')).toBeVisible();
    await expect(page.locator('text=Total Feedback')).toBeVisible();
    
    // 6. Logout
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL(/.*login/);
  });

  test('can view and navigate between tabs', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
   await page.waitForURL(/.*dashboard/);

    // Navigate Dashboard -> Events -> Feedback -> Dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    await page.click('text=Events');
    await expect(page).toHaveURL(/.*events/);
    
    await page.click('text=Feedback');
    await expect(page).toHaveURL(/.*feedback/);
    
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

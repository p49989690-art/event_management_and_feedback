import { test, expect } from '@playwright/test';

test.describe('Public Feedback Flow (Unauthenticated)', () => {
  // This test requires a published event to exist
  // The ID should be passed via environment variable or we create one first
  
  test('guest can submit feedback with name via public link', async ({ page }) => {
    // For this test to work, you need an event ID
    // You can either:
    // 1. Hardcode an event ID from production
    // 2. Run the authenticated test first to create an event
    // 3. Pass it as an environment variable
    
    // For now, let's assume we navigate to an event and get the public link
    // In a real scenario, you'd get this from the authenticated flow
    
    const testEventId = process.env.E2E_TEST_EVENT_ID;
    
    if (!testEventId) {
      test.skip();
      return;
    }

    // Navigate to public feedback page
    await page.goto(`/event-feedback/${testEventId}`);
    
    // Verify the page loaded
    await expect(page.locator('h1')).toBeVisible();
    
    // Fill in guest name
    await page.fill('input[name="name"]', `E2E Test Guest ${Date.now()}`);
    
    // Fill in feedback for different categories
    const categories = ['Venue', 'Content', 'Speaker', 'Organization'];
    
    for (const category of categories) {
      // Find the textarea for this category
      const categorySection = page.locator(`text=${category}`).locator('..');
      const textarea = categorySection.locator('textarea');
      
      if (await textarea.count() > 0) {
        await textarea.fill(`Great ${category.toLowerCase()}! (E2E Test)`);
      }
    }
    
    // Select overall rating (5 stars)
    const ratingStars = page.locator('[data-testid="rating-star"]').or(page.locator('button:has-text("★")'));
    const starCount = await ratingStars.count();
    if (starCount > 0) {
      await ratingStars.nth(4).click(); // Click 5th star (0-indexed)
    }
    
    // Submit feedback
    await page.click('button:has-text("Submit")').or(page.click('button[type="submit"]'));
    
    // Wait for success message or redirect
    await page.waitForTimeout(2000);
    
    // Verify submission success (could be a success message or redirect)
    const hasSuccessMessage = await page.locator('text=/thank you|success|submitted/i').count() > 0;
    expect(hasSuccessMessage).toBeTruthy();
  });

  test('guest can submit anonymous feedback', async ({ page }) => {
    const testEventId = process.env.E2E_TEST_EVENT_ID;
    
    if (!testEventId) {
      test.skip();
      return;
    }

    await page.goto(`/event-feedback/${testEventId}`);
    
    // Check "Submit Anonymously" checkbox
    const anonymousCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /anonymous/i });
    if (await anonymousCheckbox.count() > 0) {
      await anonymousCheckbox.check();
    }
    
    // Fill in a comment
    const textarea = page.locator('textarea').first();
    await textarea.fill('Anonymous feedback from E2E test');
    
    // Select rating
    const ratingStars = page.locator('[data-testid="rating-star"]').or(page.locator('button:has-text("★")'));
    if (await ratingStars.count() > 0) {
      await ratingStars.nth(3).click(); // 4 stars
    }
    
    // Submit
    await page.click('button:has-text("Submit")').or(page.click('button[type="submit"]'));
    
    await page.waitForTimeout(2000);
    
    // Verify success
    const hasSuccessMessage = await page.locator('text=/thank you|success|submitted/i').count() > 0;
    expect(hasSuccessMessage).toBeTruthy();
  });

  test('public link for draft event should not be accessible', async ({ page }) => {
    // This requires a draft event ID
    // It should either show 404 or "Event not found"
    const draftEventId = process.env.E2E_DRAFT_EVENT_ID;
    
    if (!draftEventId) {
      test.skip();
      return;
    }

    await page.goto(`/event-feedback/${draftEventId}`);
    
    // Should show error or empty state
    const hasError = await page.locator('text=/not found|draft|unavailable/i').count() > 0;
    const isEmpty = await page.locator('text=/no feedback|empty/i').count() > 0;
    
    expect(hasError || isEmpty).toBeTruthy();
  });
});

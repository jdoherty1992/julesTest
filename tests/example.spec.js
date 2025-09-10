const { test, expect } = require('@playwright/test');

test.describe('Personalization and Conditional Rendering', () => {
  test('should greet Kris and show the correct button for CST department', async ({ page }) => {
    await page.goto('https://azuretest24.which50.com/content/app/13104/9ccd24bc762f78ee063ced9bf7d21847?test=true&type=Desktop');
    await expect(page.locator('text=Dear Kris')).toBeVisible();
    await expect(page.locator('text="View welcome pack"')).toBeVisible();
  });

  test('should greet Ciaran and show the correct button for Dev department', async ({ page }) => {
    await page.goto('https://azuretest24.which50.com/content/app/13104/ab8296a968201cd83d8f97f6879b89d3?test=true&type=Desktop');
    await expect(page.locator('text=Dear Ciaran')).toBeVisible();
    await expect(page.locator('text="View welcome dev pack"')).toBeVisible();
  });
});

test.describe('Navigation to Pack Pages', () => {
  test('should switch to the generic pack view for CST contacts', async ({ page }) => {
    await page.goto('https://azuretest24.which50.com/content/app/13104/9ccd24bc762f78ee063ced9bf7d21847?test=true&type=Desktop');
    await page.click('text="View welcome pack"');
    // The page switches views, not navigates. Check for content in the new view.
    await expect(page.locator('h3:has-text("View welcome pack")')).toBeVisible();
  });

  test('should switch to the dev pack view for Dev contacts', async ({ page }) => {
    await page.goto('https://azuretest24.which50.com/content/app/13104/ab8296a968201cd83d8f97f6879b89d3?test=true&type=Desktop');
    await page.click('text="View welcome dev pack"');
    // The page switches views, not navigates. Check for content in the new view.
    await expect(page.locator('h3:has-text("View welcome dev pack")')).toBeVisible();
  });
});

test.describe('Pack Acceptance', () => {
  test('should send a POST request and show confirmation for generic pack', async ({ page }) => {
    await page.goto('https://azuretest24.which50.com/content/app/13104/9ccd24bc762f78ee063ced9bf7d21847?test=true&type=Desktop');
    await page.click('text="View welcome pack"');

    // Wait for the view to switch
    await expect(page.locator('h3:has-text("View welcome pack")')).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest(req => req.method() === 'POST' && req.postData().includes('Pack_accepted=Yes')),
      page.click('text=Accept')
    ]);

    await expect(page.locator('text=Kris , thank you for accepting your welcome pack.')).toBeVisible();
  });

  test('should send a POST request and show confirmation for dev pack', async ({ page }) => {
    await page.goto('https://azuretest24.which50.com/content/app/13104/ab8296a968201cd83d8f97f6879b89d3?test=true&type=Desktop');
    await page.click('text="View welcome dev pack"');

    // Wait for the view to switch
    await expect(page.locator('h3:has-text("View welcome dev pack")')).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest(req => req.method() === 'POST' && req.postData().includes('Pack_accepted=Yes')),
      page.click('text=Accept')
    ]);

    await expect(page.locator('text=Ciaran , thank you for accepting your welcome pack.')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test('verify architectural and UI updates', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Verify Global font size and number input arrows removal via CSS check would be hard,
  // but we can check if the elements exist and take a screenshot.

  // Check City selection in Building Info
  const cityInput = page.locator('input[placeholder="Enter City..."]');
  await expect(cityInput).toBeVisible();
  await cityInput.fill('Cal');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'city_search_dropdown.png' });

  // Check Province dropdown
  const provinceSelect = page.locator('select:has-text("Select Province")');
  await expect(provinceSelect).toBeVisible();

  // Check Temp boxes alignment and labels (ODTH, IDTH, DCDBT, IDTC)
  await expect(page.locator('label:has-text("ODTH")')).toBeVisible();
  await expect(page.locator('label:has-text("DCDBT (ODTC)")')).toBeVisible();
  await page.screenshot({ path: 'temp_boxes.png' });

  // Navigate to THGM Worksheet
  await page.click('button:has-text("THGM Worksheet")');
  await expect(page.locator('div:has-text("HG ΔT:")')).toBeVisible();
  await page.screenshot({ path: 'thgm_worksheet_updated.png', fullPage: true });

  // Navigate to Library
  await page.click('button:has-text("Library")');
  await expect(page.locator('h1:has-text("Reference Library")')).toBeVisible();
  await page.screenshot({ path: 'library_page.png', fullPage: true });

  // Check Room Wizard width and Window display cleanup
  await page.click('button:has-text("Input Wizard")');
  // Add a room or edit one
  const roomBtn = page.locator('button:has-text("Room 1")'); // initialState might have rooms? No, it's empty.
  await page.click('button:has-text("+ Add New Room")');

  // Check WizardContainer max-width (max-w-5xl)
  const wizardContainer = page.locator('.max-w-5xl');
  await expect(wizardContainer).toBeVisible();

  await page.click('button:has-text("Next Step")');
  // Verify Window Assembly is NOT visible
  const windowAssemblyText = page.locator('text=Selected Assembly');
  await expect(windowAssemblyText).not.toBeVisible();

  await page.screenshot({ path: 'room_wizard_step2.png', fullPage: true });
});

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  if (!fs.existsSync('verification')) fs.mkdirSync('verification');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000');

    // Create a room so we can see the wizard
    await page.click('text=Room Manager');
    await page.fill('input[placeholder="Room Name"]', 'Test Room');
    await page.click('text=Add Room');

    // Go to Engineering Wizard
    const wizardLink = await page.locator('text=Engineering Wizard').first();
    await wizardLink.click();

    // Capture Wizard Step 2
    await page.screenshot({ path: 'verification/wizard_step2.png', fullPage: true });

    // Go to Final Report
    await page.click('text=Final Report');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/final_report.png', fullPage: true });

    console.log('Screenshots captured in verification/');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();

import { test, expect } from '@playwright/test';

test('THGM calculation updates when Latitude or Shading changes', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Add a room
  await page.click('text=+ Add New Room');
  await page.fill('#room-name', 'TestRoom');
  await page.fill('#perimeter', '100');
  await page.fill('#floor-area', '500');
  await page.fill('#height', '10');

  await page.click('text=Next Step');

  // Add south window area
  // Dir S index in the loop is likely 2nd (N/S, S, ...)
  await page.fill('#win-S', '20');

  // Get initial total gain from the summary button or report
  // We can check the button text in the room list
  const getGain = async () => {
    const text = await page.innerText('button:has-text("TestRoom")');
    const match = text.match(/\/ (\d+)/);
    return parseInt(match[1]);
  };

  const initialGain = await getGain();
  console.log('Initial Gain:', initialGain);

  // Change Latitude in Project Settings
  await page.fill('#latitude', '48');
  const lat48Gain = await getGain();
  console.log('Lat 48 Gain:', lat48Gain);
  expect(lat48Gain).not.toBe(initialGain);

  // Change Shading to Reflective
  await page.selectOption('#shading', 'Reflective');
  const reflectiveGain = await getGain();
  console.log('Reflective Gain:', reflectiveGain);
  expect(reflectiveGain).not.toBe(lat48Gain);
});

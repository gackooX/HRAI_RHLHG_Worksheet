import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:5173')

        # Check if we are on the first page
        print("Page title:", await page.title())

        # Fill out some global values
        await page.fill('input[name="hl_odt"]', '-10')
        await page.fill('input[name="hl_idt"]', '72')
        await page.fill('input[name="north_latitude"]', '44')

        # Go to Step 2
        await page.click('button:has-text("Next: Room Details")')
        await page.wait_for_selector('text=Room Name')

        # Add a room
        await page.fill('input[placeholder="Room Name"]', 'Living Room')
        await page.fill('input[placeholder="Perimeter"]', '40')
        await page.fill('input[placeholder="Area"]', '100')
        await page.fill('input[name="windows.S"]', '20')

        # Select Shading and Glazing
        await page.select_option('select:has-text("No shades")', label="Blinds/Curtains")
        await page.select_option('select:has-text("Double")', label="Triple Low-E")

        # Go to Report
        await page.click('button:has-text("Report Generator")')
        await page.wait_for_selector('text=HRAI RESIDENTIAL')

        # Check report content
        content = await page.content()
        if 'Living Room' in content:
            print("Room found in report")
        if 'ISF: 0.53' in content:
            print("ISF value found in report")
        if 'SHGC: 0.35' in content:
            print("Triple Low-E SHGC found in report")

        await page.screenshot(path='/home/jules/verification/final_report_check.png', full_page=True)
        await browser.close()

asyncio.run(run())

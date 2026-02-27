import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:5173')

        print("Page title:", await page.title())

        # Fill out global values using IDs
        await page.fill('#hl-odt', '-10')
        await page.fill('#hl-idt', '72')
        await page.fill('#latitude', '44')

        # Add a room
        await page.click('text="+ Add New Room"')

        # Fill Room Dimensions (Step 1)
        await page.fill('#room-name', 'Testing')
        await page.fill('#perimeter', '40')
        await page.fill('#floor-area', '100')

        # Go to Step 2
        await page.click('button:has-text("Next")')

        # Fill Windows
        # Windows use generic input in WizardStep2 if they are not specifically IDed,
        # but they have labels. Let's use labels or placeholders if possible.
        # Actually in WizardStep2.jsx they are likely inputs next to "N", "S", etc.
        await page.fill('div:has-text("South (S)") >> input', '20')

        # Check Dropdowns
        # Glazing override
        await page.select_option('select:near(label:has-text("Glazing System Override"))', label="Triple Low-E")
        # Shading
        await page.select_option('select:near(label:has-text("Interior Shading (ISF)"))', label="Blinds/Curtains")

        # Go to Report
        await page.click('button:has-text("Report Generator")')
        await page.wait_for_selector('text=HRAI RESIDENTIAL')

        content = await page.content()
        checks = {
            "Room 'Testing'": "Testing" in content,
            "ISF Label": "ISF: 0.53" in content,
            "SHGC Label": "SHGC: 0.35" in content,
            "THGM Note": "THGM-based" in content
        }

        for name, success in checks.items():
            print(f"{name}: {'PASS' if success else 'FAIL'}")

        await page.screenshot(path='/home/jules/verification/final_v2.png', full_page=True)
        await browser.close()

asyncio.run(run())

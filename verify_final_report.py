import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 2000})

        try:
            await page.goto("http://localhost:5173", timeout=10000)
            await page.wait_for_load_state("networkidle")

            # 1. Add a room
            await page.click("text=+ Add New Room")
            await page.fill("#room-name", "Kitchen")
            await page.fill("#perimeter", "40")
            await page.fill("#floor-area", "100")
            await page.fill("#height", "9")
            await page.click("text=Next Step")

            # 2. Select assemblies
            await page.select_option("select:near(label:has-text('Wall Assembly'))", index=1)
            await page.select_option("select:near(label:has-text('Window Assembly'))", index=1)
            await page.click("text=Save Room")

            # 3. Go to Report
            await page.click("text=Report Generator")

            # 4. Verify Pages
            await page.wait_for_selector("text=HRAI Residential")
            await page.wait_for_selector("text=Building Summary & Load Breakdown")
            await page.wait_for_selector("text=Room Heat Loss & Gain Worksheet")

            # 5. Screenshot
            await page.screenshot(path="/home/jules/verification/final_report.png", full_page=True)
            print("Captured final_report.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path="/home/jules/verification/final_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification", exist_ok=True)
    asyncio.run(verify())

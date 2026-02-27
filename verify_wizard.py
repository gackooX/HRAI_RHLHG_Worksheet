import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 1400})

        try:
            await page.goto("http://localhost:5173", timeout=10000)
            await page.wait_for_load_state("networkidle")

            # 1. Fill Global Settings
            await page.get_by_label("ADDRESS").fill("123 Wizard Lane")
            await page.get_by_label("FRONT FACING").select_option("SE")

            # 2. Add a Room
            await page.get_by_role("button", name="+ Add Room").click()
            await page.get_by_label("Room Name (Max 8 chars)").fill("MASTER")
            await page.get_by_label("Perimeter (PE) ft").fill("60")
            await page.get_by_label("Floor Area (AF) sq ft").fill("200")
            await page.get_by_label("Height (H) ft").fill("10")

            await page.get_by_role("button", name="Next Step").click()

            # 3. Fill Step 2
            # Use text selector for directional labels
            await page.get_by_label("S", exact=True).fill("25")
            await page.get_by_label("Occupancy (Gain Section 13)").fill("2")

            await page.get_by_role("button", name="Save Room").click()

            # 4. Switch to Report View
            await page.get_by_role("button", name="Report Generator").click()
            await page.wait_for_selector("text=MASTER", timeout=5000)

            # Screenshots
            await page.screenshot(path="/home/jules/verification/wizard_final_grid_v2.png")
            print("Captured wizard_final_grid_v2.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path="/home/jules/verification/wizard_error_final_v2.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification", exist_ok=True)
    asyncio.run(verify())

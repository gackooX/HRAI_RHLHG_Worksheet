import asyncio
from playwright.async_api import async_playwright

async def verify_thgm():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            await page.goto("http://localhost:5173", timeout=10000)
            await page.wait_for_load_state("networkidle")

            # Add a room
            await page.get_by_role("button", name="+ Add New Room").click()
            await page.get_by_label("Room Name (Max 8 chars)").fill("THGMTST")
            await page.get_by_label("Perimeter (PE) ft").fill("100")
            await page.get_by_label("Floor Area (AF) sq ft").fill("500")
            await page.get_by_label("Height (H) ft").fill("10")

            await page.get_by_role("button", name="Next Step").click()

            # Add south window area
            await page.get_by_label("S", exact=True).fill("20")

            async def get_gain():
                text = await page.inner_text('button:has-text("THGMTST")')
                # Format: THGMTST Lvl Level 1 • Loss / Gain
                parts = text.split("/")
                return int(parts[-1].strip())

            initial_gain = await get_gain()
            print(f"Initial Gain (Lat 44, None): {initial_gain}")

            # Change Latitude to 48
            await page.get_by_label("North Latitude").fill("48")
            lat48_gain = await get_gain()
            print(f"Lat 48 Gain: {lat48_gain}")

            if lat48_gain == initial_gain:
                print("FAILURE: Gain did not change with Latitude")
            else:
                print("SUCCESS: Gain changed with Latitude")

            # Change Shading to Reflective
            await page.get_by_label("Interior Shading (ISF)").select_option("Reflective")
            refl_gain = await get_gain()
            print(f"Reflective Gain: {refl_gain}")

            if refl_gain == lat48_gain:
                print("FAILURE: Gain did not change with Shading")
            else:
                print("SUCCESS: Gain changed with Shading")

            await page.screenshot(path="/home/jules/verification/thgm_ui_test.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_thgm())

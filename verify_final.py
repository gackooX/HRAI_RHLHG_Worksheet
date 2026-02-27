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

            # 1. Title Page
            await page.get_by_role("button", name="Title Page (1)").first.click()
            await page.wait_for_selector("h1", timeout=5000)
            await page.screenshot(path="/home/jules/verification/title_styled.png")
            print("Captured title_styled.png")

            # 2. General Data
            await page.get_by_role("button", name="General Data (2)").first.click()
            await page.wait_for_selector("text=GENERAL BUILDING DATA", timeout=5000)
            await page.screenshot(path="/home/jules/verification/general_data_styled.png")
            print("Captured general_data_styled.png")

            # 3. Worksheet & Level Selector
            await page.get_by_role("button", name="Worksheets (4+)").first.click()
            await page.wait_for_selector("text=GROSS EXPOSED WALLS", timeout=5000)
            # Find the LVL selector and change it to Level 1 (if currently Basement)
            await page.locator("select.text-blue-700").first.select_option("2")
            await page.screenshot(path="/home/jules/verification/worksheet_lvl_change.png")
            print("Captured worksheet_lvl_change.png")

            # 4. Summary Page
            await page.get_by_role("button", name="Summary Page (3)").first.click()
            await page.wait_for_selector("text=ROOM HEAT LOSS / HEAT GAIN SUMMARY", timeout=5000)
            await page.screenshot(path="/home/jules/verification/summary_styled.png")
            print("Captured summary_styled.png")

            # 5. Metric Toggle
            await page.locator("select").first.select_option("METRIC")
            await asyncio.sleep(1) # wait for state update
            await page.screenshot(path="/home/jules/verification/summary_metric_styled.png")
            print("Captured summary_metric_styled.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path="/home/jules/verification/error_retry.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification", exist_ok=True)
    asyncio.run(verify())

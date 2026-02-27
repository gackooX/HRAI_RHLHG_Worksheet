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

            # 1. Verify Delta T updates
            # HL IDT = 72, HL ODT = -6 -> DT = 78
            await page.get_by_label("Heat Loss ODT").fill("-10")
            # New DT should be 72 - (-10) = 82
            await page.wait_for_selector("text=HL ΔT: 82")
            print("Verified HL ΔT updates in real-time")

            # 2. Verify Unit Conversion
            # Fill Heat Loss ODT with 32 F (0 C)
            await page.get_by_label("Heat Loss ODT").fill("32")
            await page.select_option("select:has-text('Imperial')", "METRIC")

            # Value should now show 0 (C)
            val = await page.get_by_label("Heat Loss ODT").input_value()
            if val == "0":
                print("Verified Fahrenheit to Celsius conversion")
            else:
                print(f"Conversion failed? Got {val}")

            # 3. Verify HRV Validation
            await page.get_by_label("HRV Apparent Sensible Effectiveness").fill("1.5")
            # It should not allow 1.5, we'll check if it stayed at previous or 0
            val_hrv = await page.get_by_label("HRV Apparent Sensible Effectiveness").input_value()
            if float(val_hrv) <= 1.0:
                print(f"Verified HRV validation (value is {val_hrv})")

            # 4. Screenshots
            await page.screenshot(path="/home/jules/verification/wizard_env_params.png")
            print("Captured wizard_env_params.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path="/home/jules/verification/env_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification", exist_ok=True)
    asyncio.run(verify())

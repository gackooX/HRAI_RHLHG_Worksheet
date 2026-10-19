import re

with open('src/components/AIM2CalculatorSheet.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "// Fix: City centre reduction multiplier - use Max to avoid negative/invalid log ratios if H < z0_site\n    // Wait, if H=9.1 and z0_site=2.0, log is positive. What if H < z0_site?\n    // Let's use Math.max(H, 10) for the profile, or standard F280 rule.\n    // Actually, F280 Table 3.2 uses fractional multipliers directly if we want, but AIM-2 uses C_T.\n",
    ""
)

with open('src/components/AIM2CalculatorSheet.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

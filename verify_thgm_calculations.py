import json
import math

def test_thgm_calculation():
    # Load library
    with open('src/data/library.json', 'r') as f:
        lib = json.load(f)

    # Mock state and room
    # Lat 44, HGDT = 14 (86 - 72)
    # South window (S), Double glazed (id: window-1), Blinds
    latitude = 44
    hgdt = 14
    shgc = 0.4
    u_factor = 0.28
    direction = "S"
    shading = "Blinds"
    glazing = "Double"
    area = 20

    # Lookups
    solar = lib['solarTable'][str(latitude)][direction]['imp'] # Expected: 58
    isf = lib['isfTable'][shading][glazing] # Expected: 0.55

    # Manual Calculation
    # THGM = (U * HGDT) + (SHGC * SOLAR * ISF)
    # THGM = (0.28 * 14) + (0.4 * 58 * 0.55)
    # THGM = 3.92 + 12.76 = 16.68
    expected_thgm = (u_factor * hgdt) + (shgc * solar * isf)
    print(f"Calculated THGM: {expected_thgm}")

    expected_gain = area * expected_thgm # 20 * 16.68 = 333.6
    print(f"Expected Window Gain: {expected_gain}")

    assert math.isclose(solar, 58)
    assert math.isclose(isf, 0.55)
    assert math.isclose(expected_thgm, 16.68)

    print("THGM Calculation Logic Verified!")

if __name__ == "__main__":
    test_thgm_calculation()

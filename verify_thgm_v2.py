import json

def calculate_thgm(u_factor, hg_dt, shgc, solar, isf):
    return (u_factor * hg_dt) + (shgc * solar * isf)

def test_example():
    # Example from Jules prompt
    # 44 Latitude, South, Double Glazing, Blinds/Curtains
    # SOLAR: 58 (Imperial)
    # ISF: 0.55
    # HG DT: 13 (from image.png / provided context)
    # U: 0.32 (default for window)
    # SHGC: 0.4

    latitude = 44
    direction = "S"
    glazing = "Double"
    shading = "Blinds/Curtains"
    shgc = 0.4
    u_factor = 0.32
    hg_dt = 13.0

    # Load library to confirm values
    with open('src/data/library.json', 'r') as f:
        lib = json.load(f)

    solar = lib['solarTable'][str(latitude)][direction]['imp']
    isf = lib['isfTable'][shading][glazing]

    print(f"Looked up SOLAR: {solar}")
    print(f"Looked up ISF: {isf}")

    thgm = calculate_thgm(u_factor, hg_dt, shgc, solar, isf)
    print(f"Calculated THGM: {thgm}")

    # Example logic: THGM = (13/R) + (SHGC * 58 * 0.55)
    # Note: 1/R = U
    # THGM = (0.32 * 13) + (0.4 * 58 * 0.55)
    expected = (0.32 * 13.0) + (0.4 * 58 * 0.55)
    print(f"Expected: {expected}")

    assert abs(thgm - expected) < 0.001
    print("SUCCESS: THGM matches expected formula output.")

if __name__ == "__main__":
    test_example()

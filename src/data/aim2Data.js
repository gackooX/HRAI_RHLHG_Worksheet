export const TERRAIN_ROUGHNESS = {
  "Open sea,fetch > 5 km": 0.0002,
  "Mud flats,no vegetation": 0.005,
  "Open flat terrain, grass": 0.03,
  "Low crops, x/H > 20": 0.1,
  "High crops, scattered obstacles": 0.25,
  "Parkland, bushes, x/H ~ 10": 0.5,
  "Suburban, forest": 1.0,
  "City centre": 2.0
 };

export const LOCAL_SHIELDING = {
  "No local shielding": 1.0,
  "Light local shielding": 0.9,
  "Heavy": 0.7,
  "Very heavy": 0.5,
  "Complete (by large buildings)": 0.3
 };

export const AIR_TIGHTNESS_TYPES = {
  "Loose (Pre-1945) (ACH=10.35)": { ach50: 10.35, cNorm: 0.000168611, n: 0.725 },
  "Average (1946-1960) (ACH=4.55)": { ach50: 4.55, cNorm: 0.0000823811, n: 0.698 },
  "Present (1961-) (ACH=3.57)": { ach50: 3.57, cNorm: 0.000061073, n: 0.7125 },
  "Energy Tight (ACH=1.5)": { ach50: 1.5, cNorm: 0.0000266534, n: 0.7028 },
  "Custom - BDT values": { custom: true }
 };

export const LEAKAGE_DISTRIBUTION = {
  // Detached - Crawl Space
  "Detached|One|Crawl Space": { code: "111", ceiling: 0.20, walls: 0.50, floor: 0.30 },
  "Detached|One & Half|Crawl Space": { code: "121", ceiling: 0.20, walls: 0.50, floor: 0.30 },
  "Detached|Two|Crawl Space": { code: "131", ceiling: 0.15, walls: 0.60, floor: 0.25 },
  "Detached|Two & Half|Crawl Space": { code: "141", ceiling: 0.15, walls: 0.60, floor: 0.25 },
  "Detached|Three|Crawl Space": { code: "151", ceiling: 0.10, walls: 0.70, floor: 0.20 },
  // Detached - Slab-on-Grade
  "Detached|One|Slab-on-Grade": { code: "112", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Detached|One & Half|Slab-on-Grade": { code: "122", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Detached|Two|Slab-on-Grade": { code: "132", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  "Detached|Two & Half|Slab-on-Grade": { code: "142", ceiling: 0.20, walls: 0.65, floor: 0.15 },
  "Detached|Three|Slab-on-Grade": { code: "152", ceiling: 0.15, walls: 0.70, floor: 0.15 },
  // Detached - Shallow
  "Detached|One|Shallow": { code: "113", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Detached|One & Half|Shallow": { code: "123", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Detached|Two|Shallow": { code: "133", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  "Detached|Two & Half|Shallow": { code: "143", ceiling: 0.15, walls: 0.70, floor: 0.15 },
  "Detached|Three|Shallow": { code: "153", ceiling: 0.10, walls: 0.80, floor: 0.10 },
  // Detached - Full
  "Detached|One|Full": { code: "114", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Detached|One & Half|Full": { code: "124", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  "Detached|Two|Full": { code: "134", ceiling: 0.20, walls: 0.65, floor: 0.15 },
  "Detached|Two & Half|Full": { code: "144", ceiling: 0.20, walls: 0.70, floor: 0.10 },
  "Detached|Three|Full": { code: "154", ceiling: 0.10, walls: 0.80, floor: 0.10 },
  // Semi-Detached - Crawl Space
  "Semi-Detached|One|Crawl Space": { code: "211", ceiling: 0.30, walls: 0.40, floor: 0.30 },
  "Semi-Detached|One & Half|Crawl Space": { code: "221", ceiling: 0.30, walls: 0.40, floor: 0.30 },
  "Semi-Detached|Two|Crawl Space": { code: "231", ceiling: 0.20, walls: 0.50, floor: 0.30 },
  "Semi-Detached|Two & Half|Crawl Space": { code: "241", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  "Semi-Detached|Three|Crawl Space": { code: "251", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  // Semi-Detached - Slab-on-Grade
  "Semi-Detached|One|Slab-on-Grade": { code: "212", ceiling: 0.30, walls: 0.40, floor: 0.30 },
  "Semi-Detached|One & Half|Slab-on-Grade": { code: "222", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Semi-Detached|Two|Slab-on-Grade": { code: "232", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  "Semi-Detached|Two & Half|Slab-on-Grade": { code: "242", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  "Semi-Detached|Three|Slab-on-Grade": { code: "252", ceiling: 0.20, walls: 0.65, floor: 0.15 },
  // Semi-Detached - Shallow
  "Semi-Detached|One|Shallow": { code: "213", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Semi-Detached|One & Half|Shallow": { code: "223", ceiling: 0.30, walls: 0.55, floor: 0.15 },
  "Semi-Detached|Two|Shallow": { code: "233", ceiling: 0.25, walls: 0.60, floor: 0.15 },
  "Semi-Detached|Two & Half|Shallow": { code: "243", ceiling: 0.20, walls: 0.70, floor: 0.10 },
  "Semi-Detached|Three|Shallow": { code: "253", ceiling: 0.20, walls: 0.70, floor: 0.10 },
  // Semi-Detached - Full
  "Semi-Detached|One|Full": { code: "214", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Semi-Detached|One & Half|Full": { code: "224", ceiling: 0.30, walls: 0.50, floor: 0.20 },
  "Semi-Detached|Two|Full": { code: "234", ceiling: 0.20, walls: 0.60, floor: 0.20 },
  "Semi-Detached|Two & Half|Full": { code: "244", ceiling: 0.20, walls: 0.70, floor: 0.10 },
  "Semi-Detached|Three|Full": { code: "254", ceiling: 0.20, walls: 0.70, floor: 0.10 }
 };


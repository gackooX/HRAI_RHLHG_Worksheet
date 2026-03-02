export const initialState = {
  header: {
    address: '',
    front_facing_direction: 'N', // N, NE, E, SE, S, SW, W, NW
  },
  foundation: {
    foundationType: 'Basement', // 'Basement' or 'Slab on Grade'
    numStoreys: 1, // Max 3
  },
  environmental: {
    hl_odt: -6,
    hl_idt: 72,
    mean_soil_temp: 50,
    hg_odt: -6,
    hg_idt: 72,
    daily_range: 20,
    north_latitude: 44,
  },
  system: {
    hrv_effectiveness: 0.6,
    system_case: 'Case #3', // Case #1, #2, #3
  },
  designMultipliers: {
    header_height: 0.75, // ft
  },
  externalValues: {
    LRairh: 0.873, // Heating leakage default
    LRairc: 0.030, // Cooling leakage default
  },
  rooms: [],
  displayUnits: 'IMPERIAL', // IMPERIAL or METRIC
};

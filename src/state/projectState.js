export const initialState = {
  header: {
    streetNumber: '',
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    front_facing_direction: 'N', // N, NE, E, SE, S, SW, W, NW
    system_case: 'Case #3', // Case #1, #2, #3
  },
  foundation: {
    foundationType: 'Basement', // 'Basement' or 'Slab on Grade'
    numStoreys: 1, // Max 3
  },
  environmental: {
    hl_odt: -6,
    hl_idt: 72,
    hl_mean_soil_temp: 50,
    hg_odt: 86,
    hg_idt: 72,
    hg_daily_range: 20,
    hg_north_latitude: 44,
  },
  system: {
    hrv_effectiveness: 0.6,
  },
  compliance: {
    selectedPackage: 'A1',
    windowREff: 3.57,
    doorREff: 4.00,
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

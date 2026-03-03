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
    floorHeights: {
      'Basement': 8,
      'Level 1': 8,
      'Level 2': 8,
      'Level 3': 8
    },
    basementBelowGradeHeight: 7, // ft
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
    effRValues: {
      windows: 3.57,
      doors: 4.00,
      bgw: 21.12,
      agw: 17.03,
      header: 17.03,
      ceiling: 27.65,
      floor: 29.80
    },
    solarCorrection: {
      windows: 0,
      doors: 0,
      bgw: 0,
      agw: 0,
      header: 0,
      ceiling: 27,
      floor: -6
    },
  },
  designMultipliers: {
    header_height: 0.75, // ft
    includeDuctLoss: true,
    ductLossPercentage: 10,
    includeExposedFloor: false,
  },
  externalValues: {
    LRairh: 0.873, // Heating leakage default
    LRairc: 0.030, // Cooling leakage default
  },
  rooms: [],
  displayUnits: 'IMPERIAL', // IMPERIAL or METRIC
};

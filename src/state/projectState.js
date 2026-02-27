export const initialState = {
  header: {
    address: '',
    front_facing_direction: 'N', // N, NE, E, SE, S, SW, W, NW
  },
  foundation: {
    hasBasement: true,
    numStoreys: 1, // Max 3
  },
  designMultipliers: {
    hl_delta_t: 78.00,
    hg_delta_t: 13.0,
    header_height: 0.75, // ft
  },
  externalValues: {
    LRairh: 0.873, // Heating leakage default
    LRairc: 0.030, // Cooling leakage default
  },
  rooms: [],
  displayUnits: 'IMPERIAL', // IMPERIAL or METRIC
};

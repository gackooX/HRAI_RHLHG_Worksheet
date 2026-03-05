/**
 * Calculation utilities for HRAI Heat Loss & Heat Gain (Headless Model)
 */
import library from '../data/library.json' with { type: 'json' };
import { complianceData } from '../data/complianceData.js';
import { convertTempDelta, convertArea, convertVolume, convertPower } from './unitConverter.js';

const getUFactor = (id, defaultU) => {
  const assembly = library.assemblies.find(a => a.id === id);
  return assembly ? assembly.uFactor : defaultU;
};

const getSolarValue = (latitude, direction) => {
  const latKey = Math.min(Math.max(Math.round(latitude), 40), 48).toString();
  const dirData = library.solarTable[latKey][direction] || { imp: 0, met: 0 };
  // Always return Imperial for internal consistent calculation
  return dirData.imp;
};

const getISFValue = (shadingType, glazingType) => {
  return library.isfTable[shadingType]?.[glazingType] || 1.0;
};

export const getLevelLabel = (level, state) => {
  const { foundationType } = state.foundation;
  if (foundationType === 'Basement') {
    if (level === 1) return 'Basement';
    if (level === 2) return 'Level 1 (Ground)';
    return `Level ${level - 1}`;
  } else {
    if (level === 1) return 'Level 1 (Ground)';
    return `Level ${level}`;
  }
};

export const getInternalLevelKey = (level, state) => {
  const { foundationType } = state.foundation;
  if (foundationType === 'Basement') {
    if (level === 1) return 'Basement';
    return `Level ${level - 1}`;
  } else {
    return `Level ${level}`;
  }
};

export const lookupGlazingData = (config) => {
  const { type, frame, spacer, coating, gapGas, hasStorm } = config;
  const table = library.glazingRValueTable;

  if (type === 'Single') {
    const stormKey = hasStorm ? 'Yes' : 'No';
    const entry = table[type][frame]?.[stormKey];
    return entry ? { rValue: entry.R, shgc: entry.SHGC } : { rValue: 0.83, shgc: 0.73 };
  }

  // Double or Triple
  const frameData = table[type]?.[frame];
  if (!frameData) return { rValue: 1.0, shgc: 0.5 };

  const spacerData = frameData[spacer];
  if (!spacerData) return { rValue: 1.0, shgc: 0.5 };

  const coatingData = spacerData[coating];
  if (!coatingData) return { rValue: 1.0, shgc: 0.5 };

  const finalData = coatingData[gapGas];
  if (!finalData) return { rValue: 1.0, shgc: 0.5 };

  return { rValue: finalData[0], shgc: finalData[1] };
};

export const calculateTHGM = (uFactor, hgdt, shgc, solar, isf) => {
  // Formula: THGM = (HGDT / R) + (SHGC * SOLAR * ISF)
  // where uFactor = 1 / R
  return (uFactor * hgdt) + (shgc * solar * isf);
};

export const calculateHeaderArea = (perimeter, headerHeight = 0.75) => {
  return perimeter * headerHeight;
};

export const calculateRoomVolume = (area, height) => {
  return area * height;
};

export const calculateOccupancyGain = (count) => {
  return count * 239;
};

export const calculateAirLeakage = (volume, deltaT, lrFactor) => {
  // Formula: Q = 0.018 * V * Factor * deltaT
  // The lrFactor (LRairh/LRairc) from the state is used as the multiplier/ACH equivalent
  return 0.018 * volume * lrFactor * deltaT;
};

export const calculateDetailedAreas = (room, state) => {
  const p = room.perimeter || 0;
  const h = room.height || 0;
  const h_header = state.designMultipliers.header_height || 0;
  const h_bg = state.foundation.basementBelowGradeHeight || 0;

  const windowArea = Object.values(room.windows || {}).reduce((a, b) => a + (typeof b === 'object' ? b.area : b), 0);
  const doorArea = room.doorArea || 0;
  const headerArea = p * h_header;

  let grossAGW = 0;
  let grossBGW = 0;
  let netAGW = 0;
  let netBGW = 0;

  const isBasement = room.level === 1 && state.foundation.foundationType === 'Basement';

  if (isBasement) {
    grossBGW = Math.max(0, h_bg * p);
    grossAGW = Math.max(0, (h - h_bg) * p);

    // In HRAI, windows in basements are typically subtracted from AGW portion first
    // if AGW portion is smaller than windows, the remainder goes to BGW
    netAGW = Math.max(0, grossAGW - windowArea - doorArea - headerArea);
    const remainingToSubtract = Math.max(0, (windowArea + doorArea + headerArea) - grossAGW);
    netBGW = Math.max(0, grossBGW - remainingToSubtract);
  } else {
    grossAGW = p * h;
    netAGW = Math.max(0, grossAGW - windowArea - doorArea - headerArea);
  }

  return {
    grossAGW,
    grossBGW,
    netAGW,
    netBGW,
    headerArea,
    windowArea,
    doorArea,
    floorArea: room.floorArea || 0
  };
};

export const calculateRoomConductiveLoss = (room, state, factors) => {
  const areas = calculateDetailedAreas(room, state);

  // Ceiling logic: Only include if it's the top floor
  const activeLevels = [...new Set(state.rooms.map(r => r.level))].sort((a, b) => a - b);
  const topLevel = activeLevels[activeLevels.length - 1];
  const isBasement = room.level === 1 && state.foundation.foundationType === 'Basement';
  const isTopFloor = room.level === topLevel || (!state.rooms.some(r => r.level !== room.level) && !isBasement);

  let loss = (areas.windowArea * factors.windows.hlFactor) +
             (areas.doorArea * factors.doors.hlFactor) +
             (areas.headerArea * factors.header.hlFactor) +
             (areas.netAGW * factors.agw.hlFactor) +
             (areas.netBGW * factors.bgw.hlFactor);

  if (isTopFloor) {
    loss += (areas.floorArea * factors.ceiling.hlFactor);
  }

  if (state.designMultipliers.includeExposedFloor) {
    loss += (areas.floorArea * factors.floor.hlFactor);
  }

  // Foundation special (Slab on Grade logic)
  if (room.level === 1 && state.foundation.foundationType === 'Slab on Grade') {
    const fFactor = library.foundationMultipliers['Slab on Grade']['F-Factor'];
    const hl_delta_t = state.environmental.hl_idt - state.environmental.hl_odt;
    loss += (room.perimeter * fFactor * hl_delta_t);
  }

  return loss;
};

export const calculateRoomConductiveGain = (room, state, factors) => {
  const areas = calculateDetailedAreas(room, state);
  const hg_delta_t = state.environmental.hg_odt - state.environmental.hg_idt;
  const latitude = state.environmental.hg_north_latitude;

  let totalWindowGain = 0;

  if (room.windows) {
    Object.entries(room.windows).forEach(([dir, data]) => {
      // Handle both legacy area-only format and new object format
      const area = typeof data === 'object' ? data.area : data;
      if (area > 0) {
        const shadingType = (typeof data === 'object' && data.shadingType) ? data.shadingType : (room.shadingType || 'No shades');

        // Automated Lookup - Merge global config with room-specific overrides (like area)
        const windowConfig = {
          ...(state.globalWindowConfig || {}),
          ...(typeof data === 'object' ? data : { area: data })
        };
        const lookup = lookupGlazingData(windowConfig);

        const isf = getISFValue(shadingType, windowConfig.type || 'Double');
        const solar = getSolarValue(latitude, dir);

        // Window R-Value is now globally driven by Compliance Package (1/U)
        const thgm = calculateTHGM(1/factors.windows.rEff, hg_delta_t, lookup.shgc, solar, isf);
        totalWindowGain += area * thgm;
      }
    });
  }

  // Ceiling logic: Only include if it's the top floor
  const activeLevels = [...new Set(state.rooms.map(r => r.level))].sort((a, b) => a - b);
  const topLevel = activeLevels[activeLevels.length - 1];
  const isBasement = room.level === 1 && state.foundation.foundationType === 'Basement';
  const isTopFloor = room.level === topLevel || (!state.rooms.some(r => r.level !== room.level) && !isBasement);

  let gain = totalWindowGain +
             (areas.doorArea * factors.doors.hgFactor) +
             (areas.headerArea * factors.header.hgFactor) +
             (areas.netAGW * factors.agw.hgFactor) +
             (areas.netBGW * factors.bgw.hgFactor);

  if (isTopFloor) {
    gain += (areas.floorArea * factors.ceiling.hgFactor);
  }

  if (state.designMultipliers.includeExposedFloor) {
    gain += (areas.floorArea * factors.floor.hgFactor);
  }

  return { totalGain: gain, totalWindowGain };
};

export const calculateSection17Gain = (netLoadGain, supplementalGain = 0) => {
  return (netLoadGain + supplementalGain) * 1.3;
};

export const calculateComponentFactors = (state) => {
  const pkg = complianceData[state.compliance.selectedPackage];
  const hl_delta_t = state.environmental.hl_idt - state.environmental.hl_odt;
  const hg_delta_t = state.environmental.hg_odt - state.environmental.hg_idt;
  const latitude = state.environmental.hg_north_latitude;

  const getHLFactor = (r) => r > 0 ? hl_delta_t / r : 0;
  const scValues = state.compliance.solarCorrection || {
    windows: 0, doors: 0, bgw: 0, agw: 0, header: 0, ceiling: 27, floor: -6
  };
  const getHGFactor = (r, scKey) => r > 0 ? (hg_delta_t + (scValues[scKey] || 0)) / r : 0;
  const effR = state.compliance.effRValues;

  // Pull Window U-Value from compliance package and calculate R = 1/U
  const windowU = pkg.windows.maxU;
  const windowREff = 1 / windowU;

  // Determine Global Window SHGC from lookup (Engine now strictly for SHGC/ISF)
  const globalWindowLookup = lookupGlazingData(state.globalWindowConfig || {
    type: 'Double', frame: 'Operable-Aluminum', spacer: 'Insulating', coating: 'Clear', gapGas: '1/4 Air'
  });

  const factors = {
    windows: {
      rEff: windowREff,
      hlFactor: getHLFactor(windowREff),
      sc: scValues.windows,
      hgFactor: {}, // Will use THGM logic or (HGDT+SC)/R
    },
    doors: {
      rEff: effR.doors,
      hlFactor: getHLFactor(effR.doors),
      sc: scValues.doors,
      hgFactor: getHGFactor(effR.doors, 'doors'),
    },
    bgw: {
      rEff: effR.bgw,
      hlFactor: getHLFactor(effR.bgw),
      sc: scValues.bgw,
      hgFactor: getHGFactor(effR.bgw, 'bgw'),
    },
    agw: {
      rEff: effR.agw,
      hlFactor: getHLFactor(effR.agw),
      sc: scValues.agw,
      hgFactor: getHGFactor(effR.agw, 'agw'),
    },
    header: {
      rEff: effR.header,
      hlFactor: getHLFactor(effR.header),
      sc: scValues.header,
      hgFactor: getHGFactor(effR.header, 'header'),
    },
    ceiling: {
      rEff: effR.ceiling,
      hlFactor: getHLFactor(effR.ceiling),
      sc: scValues.ceiling,
      hgFactor: getHGFactor(effR.ceiling, 'ceiling'),
    },
    floor: {
      rEff: effR.floor,
      hlFactor: getHLFactor(effR.floor),
      sc: scValues.floor,
      hgFactor: getHGFactor(effR.floor, 'floor'),
    }
  };

  // Special case for windows: directional THGM
  // We'll compute these based on the global window lookup for the component table display
  const isf = 1.0; // Default for table display

  ['N_S', 'S', 'E_W', 'NE_NW', 'SE_SW', 'H'].forEach(dir => {
    const solar = getSolarValue(latitude, dir);
    factors.windows.hgFactor[dir] = calculateTHGM(1/factors.windows.rEff, hg_delta_t, globalWindowLookup.shgc, solar, isf);
  });

  return factors;
};

export const calculateRoomMetrics = (room, state) => {
  const isMetric = state.displayUnits === 'METRIC';

  // All internal calculations done in IMPERIAL for consistency
  const hl_delta_t = state.environmental.hl_idt - state.environmental.hl_odt;
  const hg_delta_t = state.environmental.hg_odt - state.environmental.hg_idt;

  const factors = calculateComponentFactors(state);
  const conductiveLoss = calculateRoomConductiveLoss(room, state, factors);
  const { totalGain: conductiveGain, totalWindowGain } = calculateRoomConductiveGain(room, state, factors);

  const volume = calculateRoomVolume(room.floorArea, room.height);
  const airLeakageLoss = calculateAirLeakage(volume, hl_delta_t, state.externalValues.LRairh);
  const airLeakageGain = calculateAirLeakage(volume, hg_delta_t, state.externalValues.LRairc);

  const occupancyGain = calculateOccupancyGain(room.occupancy || 0);

  const foundationLossBTU = room.level === 1 ? (room.foundationConductiveLoss || 0) * 3.412 : 0;

  const netLoss = conductiveLoss + airLeakageLoss + foundationLossBTU;
  let netGain = conductiveGain + airLeakageGain + occupancyGain;

  const ductLossPercent = state.designMultipliers.includeDuctLoss ? (state.designMultipliers.ductLossPercentage / 100) : 0;
  const ductLoss = (room.hasDuctLoss !== false) ? netLoss * ductLossPercent : 0;
  const ductGain = (room.hasDuctLoss !== false) ? netGain * ductLossPercent : 0;

  const totalRoomLoss = Math.round(netLoss + ductLoss);
  const totalRoomGain = Math.round(calculateSection17Gain(netGain, ductGain));

  return {
    ...room,
    conductiveLoss: Math.round(conductiveLoss),
    conductiveGain: Math.round(conductiveGain),
    airLeakageLoss: Math.round(airLeakageLoss),
    airLeakageGain: Math.round(airLeakageGain),
    occupancyGain,
    foundationLossBTU: Math.round(foundationLossBTU),
    levelLabel: getLevelLabel(room.level, state),
    netLoss: Math.round(netLoss),
    netGain: Math.round(netGain),
    totalRoomLoss,
    totalRoomGain,
    totalWindowGain,
    hl_delta_t,
    hg_delta_t,
    headerArea: calculateHeaderArea(room.perimeter, state.designMultipliers.header_height),
    volume
  };
};

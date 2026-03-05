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

export const calculateAirLeakage = (volume, deltaT, lrFactor, systemCase = 'Case #3') => {
  // Formula: Q = 0.018 * V * Factor * deltaT
  // The lrFactor (LRairh/LRairc) from the state is used as the multiplier/ACH equivalent

  // Requirement: "System Case Selection determine the ventilation formula"
  // F280-12 uses Case 1, 2, or 3 to adjust the infiltration/ventilation interaction.
  // For a simplified digital twin, we can apply a multiplier based on the case.
  let caseMultiplier = 1.0;
  if (systemCase === 'Case #1') caseMultiplier = 1.2; // Exhaust only (higher leakage)
  if (systemCase === 'Case #2') caseMultiplier = 1.1; // Direct ducted
  if (systemCase === 'Case #3') caseMultiplier = 1.0; // Central balanced/forced air

  return 0.018 * volume * lrFactor * deltaT * caseMultiplier;
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

  // Level Logic (Bug Fix):
  // Basement: L1 = Basement, L2 = Main, L3 = Second.
  // Slab: L1 = Main, L2 = Second, L3 = Third.
  const isBasementScenario = state.foundation.foundationType === 'Basement';
  const isL1 = room.level?.includes('Level 1');
  const isBasementRoom = isL1 && isBasementScenario;

  if (isBasementRoom) {
    const basementHeight = state.foundation.floorHeights['Basement'] || 8;
    grossBGW = h_bg * p;
    grossAGW = (basementHeight - h_bg) * p;

    // Net Calculations
    netAGW = Math.max(0, grossAGW - windowArea - doorArea - headerArea);
    netBGW = Math.max(0, (basementHeight - h_bg) * p); // Re-evaluating BGW formula per requirement 2.2.2
    // Requirement 2.2.2: Net BGW = (Basement Floor Height - Wall Below Grade Height) * Perimeter
    netBGW = Math.max(0, (basementHeight - h_bg) * p);
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
  const activeLevels = [...new Set(state.rooms.map(r => r.level))];
  // Sort levels to find top level correctly
  activeLevels.sort();
  const topLevel = activeLevels[activeLevels.length - 1];
  const isTopFloor = room.level === topLevel;

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
  if (room.level?.includes('Level 1') && state.foundation.foundationType === 'Slab on Grade') {
    const fFactor = library.foundationMultipliers['Slab on Grade']['F-Factor'];
    const hl_delta_t = state.environmental.hl_idt - state.environmental.hl_odt;
    loss += (room.perimeter * fFactor * hl_delta_t);
  }

  // Manual Foundation Loss (Watts to Btu/h)
  const isL1 = room.level?.includes('Level 1');
  if (isL1 && room.foundationLossWatts) {
    loss += (room.foundationLossWatts * 3.412);
  }

  // Custom Components Heat Loss
  if (room.customComponentAreas) {
    Object.entries(room.customComponentAreas).forEach(([idx, area]) => {
      const comp = state.compliance.customComponents[idx];
      if (comp && comp.rValue > 0) {
        const hlFactor = (state.environmental.hl_idt - state.environmental.hl_odt) / comp.rValue;
        loss += (area * hlFactor);
      }
    });
  }

  return loss;
};

export const calculateRoomConductiveGain = (room, state, factors) => {
  const areas = calculateDetailedAreas(room, state);
  const hg_delta_t = state.environmental.hg_odt - state.environmental.hg_idt;

  let totalWindowGain = 0;

  if (room.windows) {
    Object.entries(room.windows).forEach(([dir, data]) => {
      const area = typeof data === 'object' ? data.area : data;
      if (area > 0 && factors.windows.hgFactor[dir]) {
        totalWindowGain += area * factors.windows.hgFactor[dir];
      }
    });
  }

  // Ceiling logic: Only include if it's the top floor
  const activeLevels = [...new Set(state.rooms.map(r => r.level))];
  activeLevels.sort();
  const topLevel = activeLevels[activeLevels.length - 1];
  const isTopFloor = room.level === topLevel;

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

  // Custom Components Heat Gain
  if (room.customComponentAreas) {
    Object.entries(room.customComponentAreas).forEach(([idx, area]) => {
      const comp = state.compliance.customComponents[idx];
      if (comp && comp.rValue > 0) {
        const hgFactor = (hg_delta_t + (comp.sc || 0)) / comp.rValue;
        gain += (area * hgFactor);
      }
    });
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

  // Determine Global Window SHGC and ISF (No longer per-room)
  const globalWindowConfig = state.globalWindowConfig || {
    type: 'Double', frame: 'Operable-Aluminum', spacer: 'Insulating', coating: 'Clear', gapGas: '1/4 Air', shadingType: 'No shades'
  };
  const globalWindowLookup = lookupGlazingData(globalWindowConfig);
  const globalISF = getISFValue(globalWindowConfig.shadingType || 'No shades', globalWindowConfig.type || 'Double');

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
  // We'll compute these based on the global window lookup and shading
  ['N_S', 'S', 'E_W', 'NE_NW', 'SE_SW', 'H'].forEach(dir => {
    const solar = getSolarValue(latitude, dir);
    factors.windows.hgFactor[dir] = calculateTHGM(1/factors.windows.rEff, hg_delta_t, globalWindowLookup.shgc, solar, globalISF);
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
  const airLeakageLoss = calculateAirLeakage(volume, hl_delta_t, state.externalValues.LRairh, state.header.system_case);
  const airLeakageGain = calculateAirLeakage(volume, hg_delta_t, state.externalValues.LRairc, state.header.system_case);

  const occupancyGain = calculateOccupancyGain(room.occupancy || 0);

  const netLoss = conductiveLoss + airLeakageLoss;
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

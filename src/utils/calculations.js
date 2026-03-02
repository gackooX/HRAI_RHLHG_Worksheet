/**
 * Calculation utilities for HRAI Heat Loss & Heat Gain (Headless Model)
 */
import library from '../data/library.json';
import { complianceData } from '../data/complianceData';
import { convertTempDelta, convertArea, convertVolume, convertPower } from './unitConverter';

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

export const calculateTHGM = (uFactor, hgdt, shgc, solar, isf) => {
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

export const calculateRoomConductiveLoss = (room, state, factors) => {
  const windowArea = Object.values(room.windows || {}).reduce((a, b) => a + b, 0);
  const doorArea = room.doorArea || 0;
  const ceilingArea = room.floorArea || 0;

  const grossWallArea = room.perimeter * room.height;
  const headerArea = calculateHeaderArea(room.perimeter, state.designMultipliers.header_height);
  const netWallArea = Math.max(0, grossWallArea - windowArea - doorArea - headerArea);

  let loss = (windowArea * factors.windows.hlFactor) +
             (doorArea * factors.doors.hlFactor) +
             (headerArea * factors.header.hlFactor);

  if (room.level === 'Basement') {
     loss += (netWallArea * factors.bgw.hlFactor);
  } else {
     loss += (netWallArea * factors.agw.hlFactor);
  }

  // Ceilings and Floors
  loss += (ceilingArea * factors.ceiling.hlFactor);

  // Foundation special (Slab on Grade logic)
  if (room.level === 'Level 1 (Ground)' && state.foundation.foundationType === 'Slab on Grade') {
    const fFactor = library.foundationMultipliers['Slab on Grade']['F-Factor'];
    const hl_delta_t = state.environmental.hl_idt - state.environmental.hl_odt;
    loss += (room.perimeter * fFactor * hl_delta_t);
  }

  return loss;
};

export const calculateRoomConductiveGain = (room, state, factors) => {
  const hg_delta_t = state.environmental.hg_odt - state.environmental.hg_idt;
  const latitude = state.environmental.hg_north_latitude;

  const windowArea = Object.values(room.windows || {}).reduce((a, b) => a + b, 0);
  const doorArea = room.doorArea || 0;
  const ceilingArea = room.floorArea || 0;
  const grossWallArea = room.perimeter * room.height;
  const headerArea = calculateHeaderArea(room.perimeter, state.designMultipliers.header_height);

  // Window Gain calculation using THGM from factors if possible, or recalculated
  const windowAssembly = library.assemblies.find(a => a.id === room.windowAssembly) || { uFactor: 0.32, shgc: 0.4, glazingType: 'Double' };
  const shadingType = room.shadingType || 'No shades';
  const glazingType = room.glazingType || windowAssembly.glazingType || 'Double';
  const isf = getISFValue(shadingType, glazingType);

  let totalWindowGain = 0;
  let totalWindowArea = 0;

  if (room.windows) {
    Object.entries(room.windows).forEach(([dir, area]) => {
      if (area > 0) {
        const solar = getSolarValue(latitude, dir);
        // We use the central R-value from factors but apply specific assembly SHGC/ISF
        const thgm = calculateTHGM(1/factors.windows.rEff, hg_delta_t, windowAssembly.shgc, solar, isf);
        totalWindowGain += area * thgm;
        totalWindowArea += area;
      }
    });
  }

  const netWallArea = Math.max(0, grossWallArea - totalWindowArea - doorArea - headerArea);

  let gain = totalWindowGain +
             (doorArea * factors.doors.hgFactor) +
             (headerArea * factors.header.hgFactor) +
             (ceilingArea * factors.ceiling.hgFactor);

  if (room.level === 'Basement') {
    gain += (netWallArea * factors.bgw.hgFactor);
  } else {
    gain += (netWallArea * factors.agw.hgFactor);
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
  const getHGFactor = (r, sc = 0) => r > 0 ? (hg_delta_t + sc) / r : 0;

  const factors = {
    windows: {
      rEff: state.compliance.windowREff,
      hlFactor: getHLFactor(state.compliance.windowREff),
      sc: {}, // Directional
      hgFactor: {}, // Will use THGM logic or (HGDT+SC)/R
    },
    doors: {
      rEff: state.compliance.doorREff,
      hlFactor: getHLFactor(state.compliance.doorREff),
      sc: 0,
      hgFactor: getHGFactor(state.compliance.doorREff, 0),
    },
    bgw: {
      rEff: pkg.basementWalls.effectiveR,
      hlFactor: getHLFactor(pkg.basementWalls.effectiveR),
      sc: 0,
      hgFactor: getHGFactor(pkg.basementWalls.effectiveR, 0),
    },
    agw: {
      rEff: pkg.wallsAboveGrade.effectiveR,
      hlFactor: getHLFactor(pkg.wallsAboveGrade.effectiveR),
      sc: 0,
      hgFactor: getHGFactor(pkg.wallsAboveGrade.effectiveR, 0),
    },
    header: {
      rEff: pkg.wallsAboveGrade.effectiveR,
      hlFactor: getHLFactor(pkg.wallsAboveGrade.effectiveR),
      sc: 0,
      hgFactor: getHGFactor(pkg.wallsAboveGrade.effectiveR, 0),
    },
    ceiling: {
      rEff: pkg.ceilingWithoutAttic.effectiveR,
      hlFactor: getHLFactor(pkg.ceilingWithoutAttic.effectiveR),
      sc: 27,
      hgFactor: getHGFactor(pkg.ceilingWithoutAttic.effectiveR, 27),
    },
    floor: {
      rEff: pkg.exposedFloor.effectiveR,
      hlFactor: getHLFactor(pkg.exposedFloor.effectiveR),
      sc: 0,
      hgFactor: getHGFactor(pkg.exposedFloor.effectiveR, 0),
    }
  };

  // Special case for windows: directional THGM
  // We'll compute these based on a default window assembly for the component table display
  const defaultWindow = library.assemblies.find(a => a.type === 'window') || { uFactor: 0.28, shgc: 0.4, glazingType: 'Double' };
  const isf = 1.0; // Default for table display

  ['N_S', 'S', 'E_W', 'NE_NW', 'SE_SW', 'H'].forEach(dir => {
    const solar = getSolarValue(latitude, dir);
    factors.windows.hgFactor[dir] = calculateTHGM(1/factors.windows.rEff, hg_delta_t, defaultWindow.shgc, solar, isf);
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

  const netLoss = conductiveLoss + airLeakageLoss;
  let netGain = conductiveGain + airLeakageGain + occupancyGain;

  const ductLoss = room.hasDuctLoss ? netLoss * 0.1 : 0;
  const ductGain = room.hasDuctLoss ? netGain * 0.1 : 0;

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

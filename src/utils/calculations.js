/**
 * Calculation utilities for HRAI Heat Loss & Heat Gain (Headless Model)
 */
import library from '../data/library.json';
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

export const calculateRoomConductiveLoss = (room, hl_delta_t, state) => {
  const windowU = getUFactor(room.windowAssembly, 0.32);
  const ceilingU = getUFactor(room.ceilingAssembly, 0.02);
  const doorU = getUFactor(room.doorAssembly, 0.20);

  const windowArea = Object.values(room.windows || {}).reduce((a, b) => a + b, 0);
  const doorArea = room.doorArea || 0;
  const ceilingArea = room.floorArea || 0;

  const grossWallArea = room.perimeter * room.height;
  const netWallArea = Math.max(0, grossWallArea - windowArea - doorArea);

  let loss = (windowArea * windowU * hl_delta_t) +
             (ceilingArea * ceilingU * hl_delta_t) +
             (doorArea * doorU * hl_delta_t);

  // Foundation Logic
  if (room.level === 'Basement' || (room.level === 'Level 1 (Ground)' && state.foundation.foundationType === 'Slab on Grade')) {
    if (state.foundation.foundationType === 'Slab on Grade') {
      const fFactor = library.foundationMultipliers['Slab on Grade']['F-Factor'];
      loss += (room.perimeter * fFactor * hl_delta_t);
    } else {
      const cFactor = library.foundationMultipliers['Basement']['C-Factor'];
      loss += (netWallArea * cFactor * hl_delta_t);
    }
  } else {
    const wallU = getUFactor(room.wallAssembly, 0.05);
    loss += (netWallArea * wallU * hl_delta_t);
  }

  return loss;
};

export const calculateRoomConductiveGain = (room, state) => {
  const hg_delta_t = state.environmental.hg_odt - state.environmental.hg_idt;
  const latitude = state.environmental.hg_north_latitude;

  const wallU = getUFactor(room.wallAssembly, 0.05);
  const ceilingU = getUFactor(room.ceilingAssembly, 0.02);
  const doorU = getUFactor(room.doorAssembly, 0.20);

  const doorArea = room.doorArea || 0;
  const ceilingArea = room.floorArea || 0;
  const grossWallArea = room.perimeter * room.height;

  // Window Gain calculation using THGM
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
        const thgm = calculateTHGM(windowAssembly.uFactor, hg_delta_t, (windowAssembly.shgc || 0.4), solar, isf);
        totalWindowGain += area * thgm;
        totalWindowArea += area;
      }
    });
  }

  const netWallArea = Math.max(0, grossWallArea - totalWindowArea - doorArea);

  const gain = (netWallArea * wallU * hg_delta_t) +
               totalWindowGain +
               (ceilingArea * ceilingU * hg_delta_t) +
               (doorArea * doorU * hg_delta_t);

  return { totalGain: gain, totalWindowGain };
};

export const calculateSection17Gain = (netLoadGain, supplementalGain = 0) => {
  return (netLoadGain + supplementalGain) * 1.3;
};

export const calculateRoomMetrics = (room, state) => {
  const isMetric = state.displayUnits === 'METRIC';

  // All internal calculations done in IMPERIAL for consistency
  const hl_delta_t = state.environmental.hl_idt - state.environmental.hl_odt;
  const hg_delta_t = state.environmental.hg_odt - state.environmental.hg_idt;

  const conductiveLoss = calculateRoomConductiveLoss(room, hl_delta_t, state);
  const { totalGain: conductiveGain, totalWindowGain } = calculateRoomConductiveGain(room, state);

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

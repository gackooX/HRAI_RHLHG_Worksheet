/**
 * Calculation utilities for HRAI Heat Loss & Heat Gain (Headless Model)
 */

export const calculateHeaderArea = (perimeter, headerHeight = 0.75) => {
  return perimeter * headerHeight;
};

export const calculateRoomVolume = (area, height) => {
  return area * height;
};

export const calculateOccupancyGain = (count) => {
  return count * 239;
};

/**
 * Calculate total conductive loss for a room based on simple multipliers for now
 * In a full model, this would use U-factors from a library.
 * For the wizard, we'll use standard assumptions if library isn't picked.
 */
export const calculateRoomConductiveLoss = (room, designMultipliers) => {
  const { hl_delta_t } = designMultipliers;
  // Simplified conductive loss calculation for the wizard prototype
  // Assuming a default U-factor of 0.05 for walls and 0.32 for windows
  const wallU = room.wallType === 'BGW' ? 0.03 : 0.05;
  const windowU = 0.32;

  const windowArea = Object.values(room.windows || {}).reduce((a, b) => a + b, 0);
  const grossWallArea = room.perimeter * room.height;
  const netWallArea = Math.max(0, grossWallArea - windowArea);

  const loss = (netWallArea * wallU * hl_delta_t) + (windowArea * windowU * hl_delta_t);
  return Math.round(loss);
};

export const calculateRoomConductiveGain = (room, designMultipliers) => {
  const { hg_delta_t } = designMultipliers;
  const windowU = 0.32;
  const wallU = 0.05;

  // Simplified gain calculation
  const windowArea = Object.values(room.windows || {}).reduce((a, b) => a + b, 0);
  const grossWallArea = room.perimeter * room.height;
  const netWallArea = Math.max(0, grossWallArea - windowArea);

  // Basic transmission gain
  const gain = (netWallArea * wallU * hg_delta_t) + (windowArea * windowU * hg_delta_t);
  return Math.round(gain);
};

export const calculateSection17Gain = (netLoadGain, supplementalGain = 0) => {
  return Math.round((netLoadGain + supplementalGain) * 1.3);
};

export const calculateRoomMetrics = (room, state) => {
  const conductiveLoss = calculateRoomConductiveLoss(room, state.designMultipliers);
  const conductiveGain = calculateRoomConductiveGain(room, state.designMultipliers);

  const airLeakageLoss = Math.round(conductiveLoss * state.externalValues.LRairh);
  const airLeakageGain = Math.round(conductiveGain * state.externalValues.LRairc);

  const occupancyGain = calculateOccupancyGain(room.occupancy || 0);

  const netLoss = conductiveLoss + airLeakageLoss;
  let netGain = conductiveGain + airLeakageGain + occupancyGain;

  const ductLoss = room.hasDuctLoss ? netLoss * 0.1 : 0;
  const ductGain = room.hasDuctLoss ? netGain * 0.1 : 0;

  const totalRoomLoss = Math.round(netLoss + ductLoss);
  const totalRoomGain = calculateSection17Gain(netGain, ductGain);

  return {
    ...room,
    conductiveLoss,
    conductiveGain,
    airLeakageLoss,
    airLeakageGain,
    occupancyGain,
    netLoss,
    netGain,
    totalRoomLoss,
    totalRoomGain,
    headerArea: calculateHeaderArea(room.perimeter, state.designMultipliers.header_height),
    volume: calculateRoomVolume(room.floorArea, room.height)
  };
};

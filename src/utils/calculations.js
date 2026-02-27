/**
 * Calculation utilities for HRAI Heat Loss & Heat Gain
 */

/**
 * Calculate Heat Loss: Q = U * A * ΔT
 * @param {number} uFactor - U-Factor of the assembly
 * @param {number} area - Area in square feet
 * @param {number} deltaT - Temperature difference (Indoor - Outdoor)
 * @returns {number} - Heat loss in BTU/h
 */
export const calculateHeatLoss = (uFactor, area, deltaT) => {
  return Math.round(uFactor * area * deltaT);
};

/**
 * Calculate Heat Gain for windows (Solar + Transmission)
 * Simple model for now, to be refined based on HRAI/ASHRAE tables
 */
export const calculateWindowGain = (uFactor, shgc, area, deltaT, solarGainFactor) => {
  const transmissionGain = uFactor * area * deltaT;
  const solarGain = area * shgc * solarGainFactor;
  return Math.round(transmissionGain + solarGain);
};

/**
 * Calculate Gross Wall Area
 * @param {number} perimeter - Perimeter in feet
 * @param {number} height - Height in feet
 * @returns {number}
 */
export const calculateGrossWallArea = (perimeter, height) => {
  return perimeter * height;
};

/**
 * Calculate Net Wall Area
 */
export const calculateNetWallArea = (grossArea, openingsArea) => {
  return Math.max(0, grossArea - openingsArea);
};

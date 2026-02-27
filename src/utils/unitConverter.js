/**
 * Utility functions for Imperial <-> Metric conversions
 */

export const convertLength = (val, toMetric = true) => {
  return toMetric ? val * 0.3048 : val / 0.3048; // ft to m
};

export const convertArea = (val, toMetric = true) => {
  return toMetric ? val * 0.092903 : val / 0.092903; // ft2 to m2
};

export const convertVolume = (val, toMetric = true) => {
  return toMetric ? val * 0.0283168 : val / 0.0283168; // ft3 to m3
};

export const convertTemp = (val, toMetric = true) => {
  return toMetric ? (val - 32) * (5/9) : (val * (9/5)) + 32; // F to C
};

export const convertPower = (val, toMetric = true) => {
  return toMetric ? val * 0.293071 : val / 0.293071; // Btuh to W
};

import { GearGeometryParams, ReverseCalcParams } from './types';

export const DEFAULT_GEOMETRY: GearGeometryParams = {
  module: 2,
  teeth: 20,
  pressureAngle: 20,
  profileShift: 0,
  helixAngle: 0,
  spanTeeth: 3, // Default suitable for z=20, alpha=20
};

export const DEFAULT_REVERSE: ReverseCalcParams = {
  module: 2,
  teeth: 20,
  measuredTipDiameter: 44, // Default for m=2, z=20, x=0
  helixAngle: 0,
};

// Expanded list of standard modules (ISO/JIS Series 1 & 2 plus common intermediates)
export const COMMON_MODULES = [
  0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
  1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 25, 28, 30, 32, 36, 40, 45, 50
];

export enum CalculationMode {
  STANDARD = 'STANDARD',
  REVERSE = 'REVERSE',
  AI = 'AI'
}

export interface GearGeometryParams {
  module: number;       // m (Normal Module mn)
  teeth: number;        // z
  pressureAngle: number;// alpha_n (Normal Pressure Angle, usually 20)
  profileShift: number; // x (coefficient)
  helixAngle: number;   // beta (degrees)
  spanTeeth: number;    // k (User defined or auto-calculated span teeth count)
}

export interface ReverseCalcParams {
  module: number;
  teeth: number;
  measuredTipDiameter: number; // da
  helixAngle: number;          // beta
}

export interface GeometryResults {
  pitchDiameter: number;      // d
  tipDiameter: number;        // da
  rootDiameter: number;       // df
  baseDiameter: number;       // db
  stdTipDiameter: number;     // da_std (Original OD)
  addendum: number;           // ha
  dedendum: number;           // hf
  wholeDepth: number;         // h
  spanTeeth: number;          // k (跨齒數)
  baseTangentLength: number;  // W (跨齒厚)
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

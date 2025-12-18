import React from 'react';
import { GeometryResults } from '../types';

interface GearVisualizerProps {
  results: GeometryResults;
  module: number;
}

const GearVisualizer: React.FC<GearVisualizerProps> = ({ results, module }) => {
  // We will draw a schematic sector of a gear to illustrate terms
  // da (Tip), d (Pitch), df (Root)
  
  const scale = 140 / (results.tipDiameter / 2); // Scale to fit ~140px radius
  
  const r_a = (results.tipDiameter / 2) * scale;
  const r = (results.pitchDiameter / 2) * scale;
  const r_f = (results.rootDiameter / 2) * scale;
  const cx = 150;
  const cy = 150;

  // Helper to create circle path
  const circlePath = (r: number) => {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
  };

  return (
    <div className="w-full flex flex-col items-center p-6 bg-slate-50 rounded-xl border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 w-full">Visual Reference (尺寸示意)</h3>
      <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
        {/* Center Cross */}
        <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke="#cbd5e1" />

        {/* Tip Circle (Outside Diameter) */}
        <path d={circlePath(r_a)} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <text x={cx + r_a + 5} y={cy} className="text-xs fill-blue-600 font-bold" dominantBaseline="middle">
          da (OD)
        </text>

        {/* Pitch Circle */}
        <path d={circlePath(r)} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={cx} y={cy - r - 5} className="text-xs fill-red-500 font-bold" textAnchor="middle">
          d (Pitch)
        </text>

        {/* Root Circle */}
        <path d={circlePath(r_f)} fill="none" stroke="#64748b" strokeWidth="1" />
        <text x={cx + r_f + 5} y={cy + 40} className="text-xs fill-slate-500" dominantBaseline="middle">
          df (Root)
        </text>
        
        {/* Dimension Lines (Schematic radius) */}
        <line x1={cx} y1={cy} x2={cx + r_a * 0.707} y2={cy - r_a * 0.707} stroke="#cbd5e1" strokeWidth="1" />
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs w-full text-center">
        <div className="bg-blue-50 p-2 rounded text-blue-800">
          <div className="font-bold">da</div>
          <div>齒頂圓</div>
        </div>
        <div className="bg-red-50 p-2 rounded text-red-800">
          <div className="font-bold">d</div>
          <div>節圓 (P.C.D)</div>
        </div>
        <div className="bg-slate-200 p-2 rounded text-slate-700">
          <div className="font-bold">df</div>
          <div>齒根圓</div>
        </div>
      </div>
    </div>
  );
};

export default GearVisualizer;

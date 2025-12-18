import React from 'react';

const ResultsChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <h3 className="font-bold text-slate-700 mb-4">Formula Reference (公式參考)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Pitch Diameter (節圓 d)</span>
            <span className="font-mono text-slate-800">d = z · mn / cos(β)</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Tip Diameter (齒頂圓 da)</span>
            <span className="font-mono text-slate-800">da = d + 2mn(1 + x)</span>
          </div>
           <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Base Diameter (基圓 db)</span>
            <span className="font-mono text-slate-800">db = d · cos(αt)</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Root Diameter (齒根圓 df)</span>
            <span className="font-mono text-slate-800">df = d - 2mn(1.25 - x)</span>
          </div>
           <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Original OD (原始外徑)</span>
            <span className="font-mono text-slate-800">da0 = d + 2mn</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Transverse Pressure Angle</span>
            <span className="font-mono text-slate-800">tan(αt) = tan(αn) / cos(β)</span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-400 bg-slate-50 p-3 rounded">
        Span Measurement (W) uses the Wildhaber property over k teeth. For helical gears, calculations assume measurements normal to the tooth flank.
      </div>
    </div>
  );
};

export default ResultsChart;

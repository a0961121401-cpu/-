import React, { useState, useEffect } from 'react';
import { Ruler, Activity, Calculator as CalcIcon, Search, HelpCircle, RefreshCw } from 'lucide-react';
import { GearGeometryParams, ReverseCalcParams, GeometryResults } from '../types';
import { DEFAULT_GEOMETRY, DEFAULT_REVERSE, COMMON_MODULES } from '../constants';
import GearVisualizer from './GearVisualizer';

// Helper Component for DMS Input
const HelixDMSInput = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  const d = Math.floor(value + 0.000001);
  const mFloat = (value - d) * 60;
  const m = Math.floor(mFloat + 0.000001);
  const s = Math.round((mFloat - m) * 60);

  const update = (field: 'd' | 'm' | 's', val: number) => {
    let newD = d;
    let newM = m;
    let newS = s;

    if (field === 'd') newD = Math.max(0, val);
    else if (field === 'm') newM = Math.max(0, val);
    else if (field === 's') newS = Math.max(0, val);

    const decimal = newD + newM / 60 + newS / 3600;
    onChange(decimal);
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="number"
          min="0"
          value={d}
          onChange={(e) => update('d', Number(e.target.value))}
          className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
          placeholder="0"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">度</span>
      </div>
      <div className="flex-1 relative">
        <input
          type="number"
          min="0"
          value={m}
          onChange={(e) => update('m', Number(e.target.value))}
          className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
          placeholder="0"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">分</span>
      </div>
      <div className="flex-1 relative">
        <input
          type="number"
          min="0"
          value={s}
          onChange={(e) => update('s', Number(e.target.value))}
          className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
          placeholder="0"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">秒</span>
      </div>
    </div>
  );
};

const Calculator: React.FC = () => {
  const [mode, setMode] = useState<'FORWARD' | 'REVERSE'>('FORWARD');
  
  // State for Standard Calculation
  const [geoParams, setGeoParams] = useState<GearGeometryParams>(DEFAULT_GEOMETRY);
  const [geoResults, setGeoResults] = useState<GeometryResults | null>(null);

  // State for Reverse Calculation
  const [revParams, setRevParams] = useState<ReverseCalcParams>(DEFAULT_REVERSE);
  const [calculatedX, setCalculatedX] = useState<number | null>(null);
  const [revStdOD, setRevStdOD] = useState<number | null>(null);

  // Involute function: inv(a) = tan(a) - a
  const inv = (angleRad: number) => Math.tan(angleRad) - angleRad;

  // Effect: Auto-calculate recommended Span Teeth (k) when Z, Angle changes
  useEffect(() => {
    const { teeth: z, pressureAngle: alpha_n_deg, helixAngle: beta_deg } = geoParams;
    const alpha_n = alpha_n_deg * Math.PI / 180;
    const beta = beta_deg * Math.PI / 180;
    
    // Transverse pressure angle
    const alpha_t = Math.atan(Math.tan(alpha_n) / Math.cos(beta));
    
    // Theoretical k
    const k_new = Math.round((z * alpha_t) / Math.PI + 0.5);
    
    // Update state only if changed to avoid loop
    setGeoParams(prev => {
      if (prev.spanTeeth !== k_new) {
        return { ...prev, spanTeeth: k_new };
      }
      return prev;
    });
  }, [geoParams.teeth, geoParams.pressureAngle, geoParams.helixAngle]);

  // Main Forward Calculation Effect
  useEffect(() => {
    const { module: mn, teeth: z, profileShift: x, pressureAngle: alpha_n_deg, helixAngle: beta_deg, spanTeeth: k_user } = geoParams;
    
    const alpha_n = alpha_n_deg * Math.PI / 180;
    const beta = beta_deg * Math.PI / 180;
    const alpha_t = Math.atan(Math.tan(alpha_n) / Math.cos(beta));

    // Pitch Diameter (d)
    const d = (z * mn) / Math.cos(beta);
    // Base Diameter (db)
    const db = d * Math.cos(alpha_t);
    // Addendum (ha)
    const ha = mn * (1 + x);
    // Dedendum (hf)
    const hf = mn * (1.25 - x);
    // Tip Diameter (da)
    const da = d + 2 * ha;
    // Original Tip Diameter (da_std, x=0)
    const da_std = d + 2 * mn;
    // Root Diameter (df)
    const df = d - 2 * hf;
    // Whole Depth (h)
    const h = ha + hf;

    // Span Measurement
    // Use user defined k, or fallback to calc
    let k = k_user;
    if (!k || k < 1) {
       k = Math.round((z * alpha_t) / Math.PI + 0.5);
    }
    
    // Base Tangent Length (W)
    const term1 = Math.PI * (k - 0.5);
    const term2 = z * inv(alpha_t);
    const term3 = 2 * x * mn * Math.sin(alpha_n);
    const W = mn * Math.cos(alpha_n) * (term1 + term2) + term3;

    setGeoResults({
      pitchDiameter: d,
      tipDiameter: da,
      rootDiameter: df,
      baseDiameter: db,
      stdTipDiameter: da_std,
      addendum: ha,
      dedendum: hf,
      wholeDepth: h,
      spanTeeth: k,
      baseTangentLength: W
    });
  }, [geoParams]);

  // Reverse Calculation Effect
  useEffect(() => {
    const { module: mn, teeth: z, measuredTipDiameter: da_measured, helixAngle: beta_deg } = revParams;
    
    if (mn > 0 && z > 0) {
      const beta = beta_deg * Math.PI / 180;
      
      const d = (z * mn) / Math.cos(beta);
      const da_std = d + 2 * mn;
      setRevStdOD(da_std);
      
      const x = (da_measured - da_std) / (2 * mn);
      setCalculatedX(x);
    } else {
      setCalculatedX(null);
      setRevStdOD(null);
    }
  }, [revParams]);

  const handleGeoChange = (field: keyof GearGeometryParams, value: number) => {
    setGeoParams(prev => ({ ...prev, [field]: value }));
  };

  const handleRevChange = (field: keyof ReverseCalcParams, value: number) => {
    setRevParams(prev => ({ ...prev, [field]: value }));
  };

  const estimateModule = () => {
    const { measuredTipDiameter: da, teeth: z, helixAngle: beta_deg } = revParams;
    if (da <= 0 || z <= 0) return;
    
    const beta = beta_deg * Math.PI / 180;
    const rawM = da / ((z / Math.cos(beta)) + 2);
    
    const closestM = COMMON_MODULES.reduce((prev, curr) => 
      Math.abs(curr - rawM) < Math.abs(prev - rawM) ? curr : prev
    );

    setRevParams(prev => ({ ...prev, module: closestM }));
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-200 rounded-xl max-w-md mx-auto">
        <button 
          onClick={() => setMode('FORWARD')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'FORWARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Ruler className="w-4 h-4" />
          輸入係數求尺寸
        </button>
        <button 
          onClick={() => setMode('REVERSE')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'REVERSE' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          不知道係數? (反求)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INPUT PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
              {mode === 'FORWARD' ? <Ruler className="w-5 h-5 text-blue-600"/> : <Search className="w-5 h-5 text-purple-600"/>}
              {mode === 'FORWARD' ? 'Input Parameters (輸入參數)' : 'Measured Data (測量數據)'}
            </h2>

            <div className="space-y-4">
              
              {/* Module Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                   <label className="text-sm font-medium text-slate-600">Module (模數 Mn)</label>
                   {mode === 'REVERSE' && (
                     <button 
                       onClick={estimateModule}
                       className="text-xs text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                       title="Estimate module based on OD, Teeth and Helix"
                     >
                       <CalcIcon className="w-3 h-3" />
                       自動推算模數
                     </button>
                   )}
                </div>
                <div className="flex gap-2">
                   <select 
                    value={mode === 'FORWARD' ? geoParams.module : revParams.module}
                    onChange={(e) => mode === 'FORWARD' ? handleGeoChange('module', Number(e.target.value)) : handleRevChange('module', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {COMMON_MODULES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input 
                    type="number"
                    placeholder="Custom"
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => mode === 'FORWARD' ? handleGeoChange('module', Number(e.target.value)) : handleRevChange('module', Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Teeth (齒數 Z)</label>
                <input 
                  type="number"
                  min="1"
                  value={mode === 'FORWARD' ? geoParams.teeth : revParams.teeth}
                  onChange={(e) => mode === 'FORWARD' ? handleGeoChange('teeth', Number(e.target.value)) : handleRevChange('teeth', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Helix Angle with DMS */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Helix Angle (螺旋角 β)</label>
                <HelixDMSInput 
                  value={mode === 'FORWARD' ? geoParams.helixAngle : revParams.helixAngle} 
                  onChange={(val) => mode === 'FORWARD' ? handleGeoChange('helixAngle', val) : handleRevChange('helixAngle', val)}
                />
                <p className="text-xs text-slate-400 mt-1">若是直齒輪 (Spur Gear) 請保持 0 度 0 分 0 秒</p>
              </div>

              {/* Forward Specific */}
              {mode === 'FORWARD' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Pressure Angle (壓力角 αn)</label>
                    <select 
                      value={geoParams.pressureAngle}
                      onChange={(e) => handleGeoChange('pressureAngle', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value={20}>20° (Standard)</option>
                      <option value={14.5}>14.5° (Old Standard)</option>
                      <option value={25}>25°</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-slate-600">Profile Shift (x)</label>
                            <button onClick={() => handleGeoChange('profileShift', 0)} className="text-xs text-blue-600 hover:underline">
                            0
                            </button>
                        </div>
                        <input 
                        type="number"
                        step="0.001"
                        value={geoParams.profileShift}
                        onChange={(e) => handleGeoChange('profileShift', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-slate-600">Span Teeth (k)</label>
                        </div>
                        <input 
                        type="number"
                        min="1"
                        step="1"
                        value={geoParams.spanTeeth || ''}
                        onChange={(e) => handleGeoChange('spanTeeth', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
                        title="Auto-calculated, but can be manually changed"
                        />
                    </div>
                  </div>
                </>
              )}

              {/* Reverse Specific */}
              {mode === 'REVERSE' && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Measured OD (測量齒頂圓 da)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={revParams.measuredTipDiameter}
                    onChange={(e) => handleRevChange('measuredTipDiameter', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-purple-50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-7 space-y-6">
          
          {mode === 'FORWARD' && geoResults && (
            <>
              {/* Main Geometry */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Geometry (幾何尺寸)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ResultItem label="Pitch Diameter (節圓)" symbol="d" value={geoResults.pitchDiameter} unit="mm" highlight />
                  <ResultItem label="Tip Diameter (齒頂圓)" symbol="da" value={geoResults.tipDiameter} unit="mm" highlight />
                  <ResultItem label="Original OD (原始外徑)" symbol="da0" value={geoResults.stdTipDiameter} unit="mm" />
                  <ResultItem label="Root Diameter (齒根圓)" symbol="df" value={geoResults.rootDiameter} unit="mm" />
                  <ResultItem label="Base Diameter (基圓)" symbol="db" value={geoResults.baseDiameter} unit="mm" />
                  <ResultItem label="Whole Depth (全齒高)" symbol="h" value={geoResults.wholeDepth} unit="mm" />
                </div>
              </div>

              {/* Inspection Data */}
              <div className="bg-slate-50 rounded-2xl p-6 shadow-inner border border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Activity className="w-4 h-4"/>
                   Inspection (檢驗數據)
                </h3>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <div className="text-xs text-slate-500 mb-1">Span Teeth Count (跨齒數)</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-800">{geoResults.spanTeeth}</span>
                        <span className="text-sm font-mono text-slate-400 bg-white border px-1 rounded">k</span>
                      </div>
                   </div>
                   <div>
                      <div className="text-xs text-slate-500 mb-1">Base Tangent Length (跨齒厚)</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-800">{geoResults.baseTangentLength.toFixed(3)}</span>
                        <span className="text-sm text-slate-400">mm</span>
                        <span className="text-sm font-mono text-slate-400 bg-white border px-1 rounded">W</span>
                      </div>
                   </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  *Span measurement (W) is calculated over {geoResults.spanTeeth} teeth. Normal pressure angle 20°.
                </p>
              </div>

              <GearVisualizer results={geoResults} module={geoParams.module} />
            </>
          )}

          {mode === 'REVERSE' && (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl shadow-purple-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-purple-100 font-medium mb-1">Calculated Coefficient (反求結果)</h3>
                  <h2 className="text-5xl font-bold tracking-tight my-2">x = {(calculatedX || 0).toFixed(4)}</h2>
                  <p className="text-purple-200 text-sm opacity-90">Profile Shift Coefficient (轉位係數)</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <Activity className="w-8 h-8 text-purple-200" />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 gap-6">
                <div>
                   <div className="text-purple-200 text-xs mb-1">Measured OD (實測外徑)</div>
                   <div className="font-mono text-lg">{revParams.measuredTipDiameter} mm</div>
                </div>
                <div>
                   <div className="text-purple-200 text-xs mb-1">Original OD (原始外徑 x=0)</div>
                   <div className="font-mono text-lg">{revStdOD ? revStdOD.toFixed(3) : '-'} mm</div>
                   {revStdOD && <div className="text-[10px] text-purple-300 mt-0.5">d + 2m</div>}
                </div>
              </div>

              <div className="mt-6 bg-black/20 rounded-lg p-4 text-sm text-purple-100 leading-relaxed">
                 <p className="font-semibold mb-1">結果分析:</p>
                 {(calculatedX || 0) > 0.01 ? (
                   <p>這是一個 <span className="text-white font-bold">正轉位齒輪 (Positive Shift)</span>。外徑比標準齒輪大 {(revParams.measuredTipDiameter - (revStdOD || 0)).toFixed(2)} mm。</p>
                 ) : (calculatedX || 0) < -0.01 ? (
                   <p>這是一個 <span className="text-white font-bold">負轉位齒輪 (Negative Shift)</span>。外徑比標準齒輪小。</p>
                 ) : (
                   <p>這非常接近 <span className="text-white font-bold">標準齒輪 (Standard Gear)</span> (x ≈ 0)。</p>
                 )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const ResultItem: React.FC<{ label: string, symbol: string, value: number, unit: string, highlight?: boolean }> = ({ label, symbol, value, unit, highlight }) => (
  <div className={`p-3 rounded-xl border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
    <div className="flex justify-between items-start mb-1">
      <span className={`text-xs ${highlight ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>{label}</span>
      <span className="text-xs font-mono text-slate-400 bg-white px-1.5 rounded border border-slate-200">{symbol}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-xl font-bold ${highlight ? 'text-blue-900' : 'text-slate-700'}`}>{value.toFixed(3)}</span>
      <span className="text-xs text-slate-400">{unit}</span>
    </div>
  </div>
);

export default Calculator;

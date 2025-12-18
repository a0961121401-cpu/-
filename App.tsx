import React, { useState } from 'react';
import { Cog, Calculator as CalcIcon, MessageSquare } from 'lucide-react';
import Calculator from './components/Calculator';
import AiAdvisor from './components/AiAdvisor';
import ResultsChart from './components/ResultsChart'; // Formula Reference
import { CalculationMode } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculationMode>(CalculationMode.STANDARD);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Cog className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              GearMaster Pro
            </h1>
          </div>
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab(CalculationMode.STANDARD)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === CalculationMode.STANDARD || activeTab === CalculationMode.REVERSE
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalcIcon className="w-4 h-4" />
              Calculator
            </button>
            <button 
              onClick={() => setActiveTab(CalculationMode.AI)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === CalculationMode.AI 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Advisor
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(activeTab === CalculationMode.STANDARD || activeTab === CalculationMode.REVERSE) ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Gear Geometry & Conversion</h2>
              <p className="text-slate-500">Calculate single gear dimensions or reverse-engineer profile shift coefficients.</p>
            </div>
            <Calculator />
            <ResultsChart />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
             <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-800">AI Gear Engineer</h2>
              <p className="text-slate-500">Expert assistance for gear standards, materials, and complex questions.</p>
            </div>
            <AiAdvisor />
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;

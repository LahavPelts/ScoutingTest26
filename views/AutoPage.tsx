import React from 'react';
import { ScoutEntry, AutoData } from '../types';
import { Counter } from '../components/Counter';

interface AutoPageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
}

export const AutoPage: React.FC<AutoPageProps> = ({ data, updateData }) => {
  const updateAuto = (key: keyof AutoData, val: any) => {
    updateData({
      auto: { ...data.auto, [key]: val }
    });
  };

  const MissCounter = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="bg-red-50 p-2 rounded-lg border border-red-200 flex items-center justify-between">
      <span className="font-bold text-red-700 ml-2">{label}</span>
      <div className="flex items-center gap-2">
        <button 
           onClick={() => onChange(Math.max(0, value - 1))}
           className="w-10 h-10 rounded bg-white text-red-600 font-bold shadow-sm border border-red-100 active:scale-95"
        >
          -
        </button>
        <span className="w-8 text-center font-bold text-xl text-red-800">{value}</span>
        <button 
           onClick={() => onChange(value + 1)}
           className="w-10 h-10 rounded bg-red-500 text-white font-bold shadow-sm active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Passed Line Toggle */}
      <div className="bg-white rounded-lg p-3 flex items-center justify-between border border-gray-200 shadow-sm">
        <span className="px-2 text-gray-700 font-bold">Passed The Line</span>
        <div className="flex bg-gray-100 rounded-md p-1 border border-gray-200">
           <button 
             onClick={() => updateAuto('passedLine', true)}
             className={`px-6 py-2 rounded font-bold transition-all ${data.auto.passedLine ? 'bg-ga-accent text-white shadow' : 'text-gray-400 hover:text-gray-600'}`}
           >
             YES
           </button>
           <button 
             onClick={() => updateAuto('passedLine', false)}
             className={`px-6 py-2 rounded font-bold transition-all ${!data.auto.passedLine ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'}`}
           >
             NO
           </button>
        </div>
      </div>

      {/* Coral Section */}
      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-3">
        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Coral Scoring</h3>
        <Counter label="L4" value={data.auto.l4} onChange={(v) => updateAuto('l4', v)} />
        <Counter label="L3" value={data.auto.l3} onChange={(v) => updateAuto('l3', v)} />
        <Counter label="L2" value={data.auto.l2} onChange={(v) => updateAuto('l2', v)} />
        <Counter label="L1" value={data.auto.l1} onChange={(v) => updateAuto('l1', v)} />
        
        {/* Aggregated Coral Misses */}
        <MissCounter label="Coral Missed" value={data.auto.coralMissed} onChange={(v) => updateAuto('coralMissed', v)} />
      </div>

      {/* Algae Section */}
      <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 space-y-3">
        <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-2">Algae Scoring</h3>
         <Counter label="PROCESSOR" value={data.auto.processor} onChange={(v) => updateAuto('processor', v)} />
         <Counter label="NET" value={data.auto.net} onChange={(v) => updateAuto('net', v)} />
         
         {/* Aggregated Algae Misses */}
         <MissCounter label="Algae Missed" value={data.auto.algaeMissed} onChange={(v) => updateAuto('algaeMissed', v)} />
      </div>
    </div>
  );
};

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

      <div className="flex flex-col gap-4">
        <Counter label="L4" value={data.auto.l4} onChange={(v) => updateAuto('l4', v)} />
        <Counter label="L3" value={data.auto.l3} onChange={(v) => updateAuto('l3', v)} />
        <Counter label="L2" value={data.auto.l2} onChange={(v) => updateAuto('l2', v)} />
        <Counter label="L1" value={data.auto.l1} onChange={(v) => updateAuto('l1', v)} />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
         <div className="col-span-1">
            <Counter label="PROC" value={data.auto.processor} onChange={(v) => updateAuto('processor', v)} />
         </div>
         <div className="col-span-1">
             <Counter label="NET" value={data.auto.net} onChange={(v) => updateAuto('net', v)} />
         </div>
      </div>
      
      {/* Reefscape Image Placeholder - purely visual as per request */}
      <div className="flex justify-center mt-6 opacity-40">
        <div className="w-24 h-32 border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 text-xs text-center font-bold">Reefscape<br/>Ref</span>
        </div>
      </div>
    </div>
  );
};
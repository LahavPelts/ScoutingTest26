import React from 'react';
import { ScoutEntry, TeleopData } from '../types';
import { Counter } from '../components/Counter';

interface TeleopPageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
}

export const TeleopPage: React.FC<TeleopPageProps> = ({ data, updateData }) => {
  const updateTeleop = (key: keyof TeleopData, val: any) => {
    updateData({
      teleop: { ...data.teleop, [key]: val }
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
      {/* Defense Toggle */}
      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-bold ml-1">Played Defence</span>
        </div>
        <div className="flex w-full bg-gray-50 rounded-lg p-1 border border-gray-100">
           <button 
             onClick={() => updateTeleop('playedDefence', true)}
             className={`flex-1 py-3 rounded-md transition-all ${data.teleop.playedDefence ? 'bg-ga-accent text-white font-bold shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
           >
             YES
           </button>
           <button 
             onClick={() => updateTeleop('playedDefence', false)}
             className={`flex-1 py-3 rounded-md transition-all ${!data.teleop.playedDefence ? 'bg-ga-accent text-white font-bold shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
           >
             NO
           </button>
        </div>
      </div>

      {/* Coral Section */}
      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-3">
        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Coral Scoring</h3>
        <Counter label="L4" value={data.teleop.l4} onChange={(v) => updateTeleop('l4', v)} />
        <Counter label="L3" value={data.teleop.l3} onChange={(v) => updateTeleop('l3', v)} />
        <Counter label="L2" value={data.teleop.l2} onChange={(v) => updateTeleop('l2', v)} />
        <Counter label="L1" value={data.teleop.l1} onChange={(v) => updateTeleop('l1', v)} />
        
        {/* Aggregated Coral Misses */}
        <MissCounter label="Coral Missed" value={data.teleop.coralMissed} onChange={(v) => updateTeleop('coralMissed', v)} />
      </div>

      {/* Algae Section */}
      <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 space-y-3">
        <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-2">Algae Scoring</h3>
         <Counter label="PROCESSOR" value={data.teleop.processor} onChange={(v) => updateTeleop('processor', v)} />
         <Counter label="NET" value={data.teleop.net} onChange={(v) => updateTeleop('net', v)} />
         
         {/* Aggregated Algae Misses */}
         <MissCounter label="Algae Missed" value={data.teleop.algaeMissed} onChange={(v) => updateTeleop('algaeMissed', v)} />
      </div>
    </div>
  );
};

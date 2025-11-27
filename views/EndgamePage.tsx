
import React from 'react';
import { ScoutEntry, EndgameData, CageType } from '../types';
import { StarRating } from '../components/StarRating';
import { Button } from '../components/Button';

interface EndgamePageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
  onSubmit: () => void;
}

export const EndgamePage: React.FC<EndgamePageProps> = ({ data, updateData, onSubmit }) => {
  const updateEndgame = (key: keyof EndgameData, val: any) => {
    updateData({
      endgame: { ...data.endgame, [key]: val }
    });
  };

  const CageOption = ({ type, label }: { type: CageType, label: string }) => (
    <button
      onClick={() => updateEndgame('cage', type)}
      className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm transition-all border ${
        data.endgame.cage === type 
          ? 'bg-ga-accent text-white border-ga-accent shadow-md scale-105' 
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Cage / Climb Selection */}
      <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
        <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-3">Cage / Climb</h3>
        <div className="flex gap-2 w-full">
          <CageOption type={CageType.DEEP} label="Deep" />
          <CageOption type={CageType.SHALLOW} label="Shallow" />
          <CageOption type={CageType.PARK} label="Park" />
          <CageOption type={CageType.NONE} label="None" />
        </div>
      </div>

      <StarRating 
        label="Defence Level" 
        value={data.endgame.defenceLevel} 
        onChange={(v) => updateEndgame('defenceLevel', v)} 
      />

      <StarRating 
        label="Driving Level" 
        value={data.endgame.drivingLevel} 
        onChange={(v) => updateEndgame('drivingLevel', v)} 
      />

      <StarRating 
        label="Scouter Level" 
        value={data.endgame.scouterLevel} 
        onChange={(v) => updateEndgame('scouterLevel', v)} 
      />

       {/* Disabled Toggle */}
       <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-bold ml-1">Disabled</span>
        </div>
        <div className="flex w-full bg-gray-50 rounded-lg p-1 border border-gray-100">
           <button 
             onClick={() => updateEndgame('disabled', true)}
             className={`flex-1 py-3 rounded-md transition-all ${data.endgame.disabled ? 'bg-red-500 text-white font-bold shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
           >
             YES
           </button>
           <button 
             onClick={() => updateEndgame('disabled', false)}
             className={`flex-1 py-3 rounded-md transition-all ${!data.endgame.disabled ? 'bg-ga-accent text-white font-bold shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
           >
             NO
           </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
          <label className="text-gray-600 font-medium ml-1">Comments</label>
          <textarea 
            className="w-full h-24 bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-ga-accent focus:ring-1 focus:ring-ga-accent placeholder-gray-400"
            placeholder="Enter comments here..."
            value={data.endgame.comments}
            onChange={(e) => updateEndgame('comments', e.target.value)}
          />
      </div>

      <Button onClick={onSubmit} fullWidth className="mt-8 text-lg py-4 shadow-xl">
        SEND DATA
      </Button>
    </div>
  );
};

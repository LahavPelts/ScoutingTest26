import React from 'react';
import { StartPosition } from '../types';

interface FieldMapProps {
  selected: StartPosition | null;
  onChange: (pos: StartPosition) => void;
  alliance: 'Red' | 'Blue';
}

export const FieldMap: React.FC<FieldMapProps> = ({ selected, onChange, alliance }) => {
  const positions = [
    StartPosition.UP,
    StartPosition.MID_UP,
    StartPosition.MID,
    StartPosition.MID_BOT,
    StartPosition.BOT
  ];

  return (
    <div className="w-full aspect-[4/5] bg-white rounded-lg border border-gray-300 relative overflow-hidden flex flex-col shadow-inner">
       {/* Background Grid Lines to simulate map */}
       <div className="absolute inset-0 grid grid-cols-4 grid-rows-5 pointer-events-none opacity-20">
         {Array.from({length: 20}).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
         ))}
       </div>

       <div className="absolute inset-y-0 left-0 w-8 bg-gray-100 border-r border-gray-300 flex flex-col justify-center items-center text-xs text-gray-500 font-bold">
          <span>W</span><span>A</span><span>L</span><span>L</span>
       </div>
       
       {/* Position Selectors */}
       <div className="flex-1 flex flex-col z-10 pl-8">
         {positions.map((pos) => (
           <button
             key={pos}
             onClick={() => onChange(pos)}
             className={`flex-1 border-b border-gray-200 flex items-center pl-4 transition-colors duration-200
               ${selected === pos 
                 ? (alliance === 'Red' ? 'bg-red-100 text-red-900' : 'bg-blue-100 text-blue-900') 
                 : 'hover:bg-gray-50 text-gray-600'}`}
           >
             <div className={`w-3 h-3 rounded-full mr-3 border ${selected === pos ? (alliance === 'Red' ? 'bg-red-600 border-red-600' : 'bg-blue-600 border-blue-600') : 'bg-white border-gray-400'}`}></div>
             <span className="font-medium text-sm">{pos}</span>
           </button>
         ))}
       </div>
    </div>
  );
};
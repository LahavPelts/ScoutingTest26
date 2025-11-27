import React from 'react';

interface DualCounterProps {
  label: string;
  made: number;
  missed: number;
  onChangeMade: (val: number) => void;
  onChangeMissed: (val: number) => void;
}

export const DualCounter: React.FC<DualCounterProps> = ({ 
  label, 
  made, 
  missed, 
  onChangeMade, 
  onChangeMissed 
}) => {
  return (
    <div className="flex flex-col w-full shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-2 py-1 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
        {label}
      </div>
      <div className="flex h-14">
        {/* Made Section (Green/Blue/Accent) */}
        <div className="flex-1 flex bg-white relative group">
           <button 
             onClick={() => onChangeMade(Math.max(0, made - 1))}
             className="w-10 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg flex items-center justify-center transition-colors border-r border-gray-100"
           >
             -
           </button>
           <div className="flex-1 flex items-center justify-center font-bold text-xl text-ga-accent bg-blue-50/30">
             {made}
           </div>
           <button 
             onClick={() => onChangeMade(made + 1)}
             className="w-12 bg-ga-accent hover:bg-ga-accentHover text-white font-bold text-xl flex items-center justify-center transition-colors"
           >
             +
           </button>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300"></div>

        {/* Missed Section (Red) */}
        <div className="w-1/3 flex bg-red-50 relative">
           <div className="flex-1 flex items-center justify-center font-bold text-red-600">
              <span className="text-xs mr-1 text-red-400">miss</span>
              {missed}
           </div>
           <button 
             onClick={() => onChangeMissed(missed + 1)}
             className="w-10 bg-red-100 hover:bg-red-200 text-red-600 font-bold text-lg flex items-center justify-center transition-colors border-l border-red-200"
             onContextMenu={(e) => {
                e.preventDefault();
                onChangeMissed(Math.max(0, missed - 1));
             }}
           >
             +
           </button>
        </div>
      </div>
    </div>
  );
};

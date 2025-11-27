
import React from 'react';
import { StartPosition } from '../types';

interface FieldMapProps {
  selected: StartPosition | null;
  onChange: (pos: StartPosition) => void;
  alliance: 'Red' | 'Blue'; 
  imageUrl?: string;
}

const positions: { key: StartPosition; top: string; label: string }[] = [
  { key: StartPosition.UP, top: "0%", label: "Top" },
  { key: StartPosition.MID_UP, top: "20%", label: "Mid-Top" },
  { key: StartPosition.MID, top: "40%", label: "Middle" },
  { key: StartPosition.MID_BOT, top: "60%", label: "Mid-Bot" },
  { key: StartPosition.BOT, top: "80%", label: "Bottom" }
];

export const FieldMap: React.FC<FieldMapProps> = ({ 
  selected, 
  onChange, 
  // User must ensure field.png exists in public/ folder
  imageUrl = "/field.png" 
}) => {
  return (
    <div className="w-full max-w-[560px] mx-auto">
      <div 
        className="relative w-full rounded-lg overflow-hidden bg-white border border-gray-300 shadow-md"
        style={{ 
          aspectRatio: '2 / 1',
          backgroundImage: `url(${imageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay Grid */}
        {positions.map((p) => (
          <div
            key={p.key}
            role="button"
            onClick={() => onChange(p.key)}
            className="absolute left-0 w-full h-[20%] cursor-pointer outline-none group"
            style={{ top: p.top }}
          >
            {/* Hover Effect */}
            <div className={`absolute inset-0 transition-colors duration-200 ${selected === p.key ? '' : 'group-hover:bg-[#2196f3]/10'}`} />
            
            {/* Selection Highlight - "Lil Blue" */}
            {selected === p.key && (
              <div className="absolute inset-0 bg-[#2196f3]/40 border-y border-[#2196f3] flex items-center justify-center animate-pulse-slow">
                 <span className="bg-white/90 text-[#1e3a8a] px-2 py-0.5 rounded text-xs font-bold shadow-sm backdrop-blur-sm">
                   {p.label}
                 </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
        {selected ? `Selected: ${selected}` : "Select Starting Position"}
      </div>
    </div>
  );
};

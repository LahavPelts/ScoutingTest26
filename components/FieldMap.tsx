import React from 'react';
import { StartPosition } from '../types';

interface FieldMapProps {
  selected: StartPosition | null;
  onChange: (pos: StartPosition) => void;
  alliance: 'Red' | 'Blue'; // Kept for interface compatibility, though new visual is generic
  imageUrl?: string;
}

const positions: { key: StartPosition; top: string }[] = [
  { key: StartPosition.UP, top: "0%" },
  { key: StartPosition.MID_UP, top: "20%" },
  { key: StartPosition.MID, top: "40%" },
  { key: StartPosition.MID_BOT, top: "60%" },
  { key: StartPosition.BOT, top: "80%" }
];

export const FieldMap: React.FC<FieldMapProps> = ({ 
  selected, 
  onChange, 
  imageUrl = "/field.png" // Placeholder, in a real app ensure this image exists in public folder
}) => {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className="relative w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-300 shadow-inner"
        style={{ 
          aspectRatio: '2 / 1',
          backgroundImage: `url(${imageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {/* Fallback grid if image missing */}
        <div className="absolute inset-0 grid grid-rows-5 pointer-events-none opacity-10">
            {[...Array(5)].map((_, i) => <div key={i} className="border-b border-gray-500"></div>)}
        </div>

        {positions.map((p) => (
          <div
            key={p.key}
            role="button"
            onClick={() => onChange(p.key)}
            className="absolute left-0 w-full h-[20%] cursor-pointer outline-none transition-colors duration-200 hover:bg-blue-400/15"
            style={{ top: p.top }}
          >
            {selected === p.key && (
              <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-[1px] flex items-center justify-center">
                 <span className="text-white font-bold drop-shadow-md text-sm sm:text-base bg-black/20 px-2 rounded">
                    {p.key}
                 </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


import React from 'react';
import { StartPosition } from '../types';

interface FieldMapProps {
  selected: StartPosition | null;
  onChange: (pos: StartPosition) => void;
  alliance: 'Red' | 'Blue'; 
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
  imageUrl = "/field.png" 
}) => {
  return (
    <div className="w-full max-w-[560px] mx-auto">
      <div 
        className="relative w-full rounded-lg overflow-hidden bg-[#f3f3f3] border border-gray-300/50 shadow-inner"
        style={{ 
          aspectRatio: '2 / 1',
          backgroundImage: `url(${imageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {positions.map((p) => (
          <div
            key={p.key}
            role="button"
            onClick={() => onChange(p.key)}
            className="absolute left-0 w-full h-[20%] cursor-pointer outline-none transition-colors duration-200 hover:bg-[#2196f3]/15"
            style={{ top: p.top }}
          >
            {selected === p.key && (
              <div className="absolute inset-0 bg-[#2196f3]/25 flex items-center justify-center">
                 {/* Optional label if needed, or kept clean as per reference */}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-2 text-sm text-gray-500 font-medium">
        {selected ? selected : "Tap position on map"}
      </div>
    </div>
  );
};

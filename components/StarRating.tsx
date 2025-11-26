import React from 'react';

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ label, value, onChange, max = 5 }) => {
  return (
    <div className="flex flex-col gap-2 mb-4 px-1">
      <label className="text-gray-600 font-bold">{label}</label>
      <div className="flex gap-2">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={`text-3xl focus:outline-none transition-transform active:scale-125 ${i < value ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300'}`}
          >
            {i < value ? '★' : '★'}
          </button>
        ))}
      </div>
    </div>
  );
};
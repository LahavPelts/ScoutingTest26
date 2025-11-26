import React from 'react';

interface CounterProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

export const Counter: React.FC<CounterProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-2 w-full h-16">
      {/* Main Label and Count Box */}
      <button 
        onClick={() => onChange(value + 1)}
        className="flex-1 h-full bg-ga-accent hover:bg-ga-accentHover rounded-l-lg flex items-center justify-center text-white font-bold text-lg shadow-lg active:opacity-90 transition-all"
      >
        {label} = {value}
      </button>

      {/* Minus Button */}
      <button 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-16 h-full bg-ga-accent hover:bg-ga-accentHover rounded-r-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg active:opacity-90 transition-all"
      >
        -
      </button>
    </div>
  );
};
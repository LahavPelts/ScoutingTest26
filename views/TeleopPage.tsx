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

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex flex-col gap-4">
        <Counter label="L4" value={data.teleop.l4} onChange={(v) => updateTeleop('l4', v)} />
        <Counter label="L3" value={data.teleop.l3} onChange={(v) => updateTeleop('l3', v)} />
        <Counter label="L2" value={data.teleop.l2} onChange={(v) => updateTeleop('l2', v)} />
        <Counter label="L1" value={data.teleop.l1} onChange={(v) => updateTeleop('l1', v)} />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
         <div className="col-span-1">
            <Counter label="PROC" value={data.teleop.processor} onChange={(v) => updateTeleop('processor', v)} />
         </div>
         <div className="col-span-1">
             <Counter label="NET" value={data.teleop.net} onChange={(v) => updateTeleop('net', v)} />
         </div>
      </div>
    </div>
  );
};
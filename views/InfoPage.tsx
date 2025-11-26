import React from 'react';
import { ScoutEntry, MatchType, Alliance, StartPosition } from '../types';
import { Input, Select } from '../components/Input';
import { Button } from '../components/Button';
import { FieldMap } from '../components/FieldMap';
import { ISRAEL_TEAMS } from '../constants';

interface InfoPageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
  onNext: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ data, updateData, onNext }) => {
  const matchTypes = [
    { value: MatchType.QUALIFICATION, label: 'Q - Qualification' },
    { value: MatchType.PRACTICE, label: 'P - Practice' },
    { value: MatchType.ALLIANCE, label: 'A - Alliance' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <h2 className="text-xl font-bold text-ga-accent mb-4 border-b border-gray-200 pb-2">Match Info</h2>

      {/* Match Type and Number */}
      <div className="flex gap-2">
        <div className="w-1/3">
           <Select 
            value={data.matchType} 
            onChange={(e) => updateData({ matchType: e.target.value as MatchType })}
            options={matchTypes}
            className="text-sm font-medium"
          />
        </div>
        <div className="w-2/3">
          <Input 
            type="number" 
            placeholder="Match #"
            value={data.matchNumber}
            onChange={(e) => updateData({ matchNumber: e.target.value })}
            className="font-bold"
          />
        </div>
      </div>

      {/* Team Number */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-600 text-sm font-medium ml-1">Team Number</label>
        <div className="relative">
          <input
            list="teams"
            type="text"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-ga-accent focus:ring-1 focus:ring-ga-accent font-bold"
            value={data.teamNumber}
            onChange={(e) => updateData({ teamNumber: e.target.value })}
            placeholder="Select or type..."
          />
          <datalist id="teams">
            {ISRAEL_TEAMS.map(team => <option key={team} value={team} />)}
          </datalist>
        </div>
      </div>

      {/* Alliance Toggle */}
      <div className="flex gap-4">
        <Button 
          fullWidth
          className={`transition-colors shadow-none ${data.alliance === Alliance.RED ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600'}`}
          onClick={() => updateData({ alliance: Alliance.RED })}
        >
          Red
        </Button>
        <Button 
          fullWidth
          className={`transition-colors shadow-none ${data.alliance === Alliance.BLUE ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600'}`}
          onClick={() => updateData({ alliance: Alliance.BLUE })}
        >
          Blue
        </Button>
      </div>

      {/* Starting Position */}
      <div className="space-y-2">
        <label className="text-gray-600 text-sm font-medium ml-1">Starting Position</label>
        <FieldMap 
          selected={data.startPosition} 
          alliance={data.alliance === Alliance.RED ? 'Red' : 'Blue'}
          onChange={(pos) => updateData({ startPosition: pos })}
        />
      </div>

      {/* Navigation FAB */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={onNext}
          disabled={!data.matchNumber || !data.teamNumber}
          className="w-16 h-16 rounded-full bg-ga-accent hover:bg-ga-accentHover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-transform active:scale-90 text-white"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
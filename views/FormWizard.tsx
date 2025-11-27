
import React, { useState } from 'react';
import { ScoutEntry, MatchType, Alliance, CageType } from '../types';
import { InfoPage } from './InfoPage';
import { AutoPage } from './AutoPage';
import { TeleopPage } from './TeleopPage';
import { EndgamePage } from './EndgamePage';
import { saveEntry } from '../services/storageService';

interface FormWizardProps {
  onBack: () => void;
}

const INITIAL_DATA: ScoutEntry = {
  id: '',
  matchType: MatchType.QUALIFICATION,
  matchNumber: '',
  teamNumber: '',
  alliance: Alliance.RED,
  startPosition: null,
  timestamp: 0,
  auto: { 
    l4: 0, l3: 0, l2: 0, l1: 0, 
    coralMissed: 0,
    processor: 0, net: 0, 
    algaeMissed: 0,
    passedLine: false 
  },
  teleop: { 
    l4: 0, l3: 0, l2: 0, l1: 0, 
    coralMissed: 0,
    processor: 0, net: 0, 
    algaeMissed: 0,
    playedDefence: false 
  },
  endgame: { 
    defenceLevel: 0, 
    drivingLevel: 0, 
    scouterLevel: 0, 
    cage: CageType.NONE,
    disabled: false, 
    comments: '' 
  }
};

type Step = 'info' | 'auto' | 'teleop' | 'endgame';

export const FormWizard: React.FC<FormWizardProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('info');
  const [data, setData] = useState<ScoutEntry>(INITIAL_DATA);

  const updateData = (updates: Partial<ScoutEntry>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    const finalEntry = { ...data, id: crypto.randomUUID(), timestamp: Date.now() };
    saveEntry(finalEntry);
    onBack();
  };

  // Nav Chip
  const NavChip = ({ target, label }: { target: Step, label: string }) => (
    <button
      onClick={() => setStep(target)}
      disabled={step === 'info'} // Can't jump if not initialized
      className={`px-4 py-1 rounded-full text-sm font-bold transition-all duration-300 border 
        ${step === target 
          ? 'bg-ga-accent text-white border-ga-accent shadow-md scale-105' 
          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-ga-dark flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-gray-200">
      {/* Top Bar (Sticky) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 pb-3 pt-4 px-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
             <div className="bg-blue-50 px-3 py-1 rounded text-xs font-mono text-ga-accent border border-blue-200 font-bold">
               M{data.matchNumber || '-'} | T{data.teamNumber || '-'}
             </div>
             <button onClick={onBack} className="text-gray-500 hover:text-red-500 font-medium">✕ Exit</button>
        </div>

        {step !== 'info' && (
          <div className="flex justify-between px-2">
            <NavChip target="auto" label="Auto" />
            <NavChip target="teleop" label="Teleop" />
            <NavChip target="endgame" label="Endgame" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {step === 'info' && (
          <InfoPage data={data} updateData={updateData} onNext={() => setStep('auto')} />
        )}
        {step === 'auto' && (
          <AutoPage data={data} updateData={updateData} />
        )}
        {step === 'teleop' && (
          <TeleopPage data={data} updateData={updateData} />
        )}
        {step === 'endgame' && (
          <EndgamePage data={data} updateData={updateData} onSubmit={handleSubmit} />
        )}
      </div>

      {/* Floating Action Button for Next (only for Auto/Teleop) */}
      {(step === 'auto' || step === 'teleop') && (
         <div className="fixed bottom-6 right-6 z-50">
            <button 
              onClick={() => setStep(step === 'auto' ? 'teleop' : 'endgame')}
              className="w-16 h-16 rounded-full bg-ga-accent hover:bg-ga-accentHover flex items-center justify-center shadow-lg transition-transform active:scale-90 text-white"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
         </div>
      )}
    </div>
  );
};

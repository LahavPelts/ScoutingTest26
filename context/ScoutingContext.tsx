import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScoutEntry, MatchType, Alliance, CageType } from '../types';

interface ScoutingContextType {
  matchData: ScoutEntry;
  setMatchData: React.Dispatch<React.SetStateAction<ScoutEntry>>;
  updateByPath: (path: string, value: any) => void;
  resetForm: () => void;
}

const INITIAL_DATA: ScoutEntry = {
  id: '',
  matchType: MatchType.QUALIFICATION,
  matchNumber: '',
  teamNumber: '',
  alliance: Alliance.RED,
  startPosition: null,
  timestamp: 0,
  auto: { l4: 0, l3: 0, l2: 0, l1: 0, coralMissed: 0, processor: 0, net: 0, algaeMissed: 0, passedLine: false },
  teleop: { l4: 0, l3: 0, l2: 0, l1: 0, coralMissed: 0, processor: 0, net: 0, algaeMissed: 0, playedDefence: false },
  endgame: { defenceLevel: 0, drivingLevel: 0, scouterLevel: 0, cage: CageType.NONE, disabled: false, comments: '' }
};

const ScoutingContext = createContext<ScoutingContextType | undefined>(undefined);

export const ScoutingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matchData, setMatchData] = useState<ScoutEntry>(INITIAL_DATA);

  const updateByPath = useCallback((path: string, value: any) => {
    setMatchData((prev) => {
      const newData = { ...prev };
      const parts = path.split('.');
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  }, []);

  const resetForm = () => setMatchData(INITIAL_DATA);

  return (
    <ScoutingContext.Provider value={{ matchData, setMatchData, updateByPath, resetForm }}>
      {children}
    </ScoutingContext.Provider>
  );
};

export const useScouting = () => {
  const context = useContext(ScoutingContext);
  if (!context) throw new Error('useScouting must be used within a ScoutingProvider');
  return context;
};

import { ISRAEL_TEAMS } from '../constants';
import { overwriteEntries } from './storageService';
import { ScoutEntry, MatchType, Alliance, StartPosition, CageType } from '../types';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Simple ID generator compatible with older browsers/contexts
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const generateMockData = () => {
  // 1. Build all data in memory first
  const allEntries: ScoutEntry[] = [];
  
  const now = Date.now();
  let matchCounter = 1;

  // Assign a "Skill Tier" to each team so the data isn't pure noise
  const teamTiers: Record<string, number> = {};
  ISRAEL_TEAMS.forEach(t => {
    const rand = Math.random();
    if (rand > 0.8) teamTiers[t] = 1; // Elite
    else if (rand > 0.4) teamTiers[t] = 2; // Mid
    else teamTiers[t] = 3; // Rookie
  });

  ISRAEL_TEAMS.forEach(team => {
    // Generate 8-12 matches per team
    const numMatches = getRandomInt(8, 12);
    const tier = teamTiers[team];

    for (let i = 0; i < numMatches; i++) {
      const isRed = Math.random() > 0.5;
      const m = tier === 1 ? 1.5 : tier === 2 ? 1.0 : 0.6;
      
      const cageRoll = Math.random();
      let cage = CageType.NONE;
      if (cageRoll > 0.6) cage = CageType.DEEP;
      else if (cageRoll > 0.4) cage = CageType.SHALLOW;
      else if (cageRoll > 0.3) cage = CageType.PARK;

      // Defense Logic
      const playedDefence = Math.random() > 0.8;
      // If they played defense, give them a rating. If not, rating is 0 (N/A)
      const defenceLevel = playedDefence ? getRandomInt(2, 5) : 0;

      const entry: ScoutEntry = {
        id: generateId(),
        matchType: MatchType.QUALIFICATION,
        matchNumber: (matchCounter++).toString(),
        teamNumber: team,
        alliance: isRed ? Alliance.RED : Alliance.BLUE,
        startPosition: StartPosition.MID,
        timestamp: now - (i * 3600000), 
        auto: {
          passedLine: Math.random() > 0.1, 
          l4: getRandomInt(0, Math.ceil(1 * m)), 
          l3: getRandomInt(0, Math.ceil(2 * m)), 
          l2: getRandomInt(0, Math.ceil(2 * m)), 
          l1: getRandomInt(0, Math.ceil(3 * m)), 
          coralMissed: getRandomInt(0, 3), 
          processor: getRandomInt(0, 1), 
          net: getRandomInt(0, 1), 
          algaeMissed: getRandomInt(0, 2) 
        },
        teleop: {
          playedDefence: playedDefence, 
          l4: getRandomInt(0, Math.ceil(3 * m)), 
          l3: getRandomInt(0, Math.ceil(4 * m)), 
          l2: getRandomInt(1, Math.ceil(5 * m)), 
          l1: getRandomInt(2, Math.ceil(6 * m)), 
          coralMissed: getRandomInt(0, 5), 
          processor: getRandomInt(0, Math.ceil(2 * m)), 
          net: getRandomInt(0, Math.ceil(2 * m)), 
          algaeMissed: getRandomInt(0, 4) 
        },
        endgame: {
          defenceLevel: defenceLevel,
          drivingLevel: getRandomInt(2, 5),
          scouterLevel: 5,
          cage: cage,
          disabled: Math.random() > 0.95, 
          comments: "Generated mock data"
        }
      };
      
      allEntries.push(entry);
    }
  });
  
  overwriteEntries(allEntries);
  window.location.reload();
};

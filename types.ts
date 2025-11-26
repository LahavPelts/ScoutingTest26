
export enum MatchType {
  QUALIFICATION = 'q',
  PRACTICE = 'p',
  ALLIANCE = 'a'
}

export enum Alliance {
  RED = 'Red',
  BLUE = 'Blue'
}

export enum StartPosition {
  UP = 'Up',
  MID_UP = 'Middle Up',
  MID = 'Middle',
  MID_BOT = 'Middle Bottom',
  BOT = 'Bottom'
}

export interface MatchScore {
  l4: number;
  l3: number;
  l2: number;
  l1: number;
  processor: number;
  net: number;
}

export interface AutoData extends MatchScore {
  passedLine: boolean;
}

export interface TeleopData extends MatchScore {}

export interface EndgameData {
  defenceRobot: boolean;
  defenceLevel: number; // 0-5
  drivingLevel: number; // 0-5
  scouterLevel: number; // 0-5
  disabled: boolean;
  comments: string;
}

export interface ScoutEntry {
  id: string;
  matchType: MatchType;
  matchNumber: string;
  teamNumber: string;
  alliance: Alliance;
  startPosition: StartPosition | null;
  auto: AutoData;
  teleop: TeleopData;
  endgame: EndgameData;
  timestamp: number;
}

export interface TeamStats {
  teamNumber: string;
  matchesPlayed: number;
  
  // Averages
  avgTotalPoints: number;
  avgAutoPoints: number;
  avgTeleopPoints: number;
  
  avgL4: number;
  avgL3: number;
  avgL2: number;
  avgL1: number;
  avgProcessor: number;
  avgNet: number;
  avgDefenceRating: number;
  
  // Statbotics EPA
  epaTotal?: number;
  
  source: 'Local' | 'Hybrid';
}

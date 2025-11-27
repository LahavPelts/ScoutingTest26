
// A subset of Israeli FRC teams for the dropdown
export const ISRAEL_TEAMS = [
  "1574", "1576", "1577", "1657", "1690", "1937", "1942", "1943", "1954", 
  "2096", "2212", "2230", "2231", "2630", "2679", "3065", "3075", "3083", 
  "3211", "3316", "3339", "3388", "3835", "4319", "4320", "4338", "4416", 
  "4586", "4590", "4661", "4744", "5135", "5291", "5554", "5614", "5635", 
  "5654", "5715", "5928", "5951", "5987", "5990", "6104", "6168", "6230", 
  "6738", "6740", "6741", "7039", "7067", "7112", "7177", "7845", "8175", "8223"
];

// Scoring Constants
export const POINTS = {
  AUTO: {
    L4: 7,
    L3: 6,
    L2: 4,
    L1: 3,
    PROCESSOR: 6,
    NET: 4,
    PASSED_LINE: 3
  },
  TELEOP: {
    L4: 5,
    L3: 4,
    L2: 3,
    L1: 2,
    PROCESSOR: 6,
    NET: 4
  }
};

// Mock API data - No longer used, replaced by real Statbotics API
export const MOCK_API_STATS: Record<string, { auto: number; teleop: number }> = {
  // Deprecated
};
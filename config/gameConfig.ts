export interface FieldConfig {
  id: string;
  section: 'Match' | 'Auto' | 'Teleop' | 'Endgame';
  label: string;
  type: 'number' | 'boolean' | 'text' | 'select' | 'position';
  path: string;
  options?: string[];
}

export const GAME_CONFIG: FieldConfig[] = [
  // --- MATCH INFO ---
  { id: 'm1', section: 'Match', label: 'Match Type', type: 'select', path: 'matchType', options: ['Q', 'P', 'E', 'F'] },
  { id: 'm2', section: 'Match', label: 'Match Number', type: 'number', path: 'matchNumber' },
  { id: 'm3', section: 'Match', label: 'Team Number', type: 'number', path: 'teamNumber' },
  { id: 'm4', section: 'Match', label: 'Alliance', type: 'select', path: 'alliance', options: ['Red', 'Blue'] },
  { id: 'm5', section: 'Match', label: 'Starting Position', type: 'position', path: 'startPosition' },

  // --- AUTONOMOUS ---
  { id: 'a1', section: 'Auto', label: 'Crossed Line', type: 'boolean', path: 'auto.passedLine' },
  { id: 'a2', section: 'Auto', label: 'Auto Coral L4', type: 'number', path: 'auto.l4' },
  { id: 'a3', section: 'Auto', label: 'Auto Coral L3', type: 'number', path: 'auto.l3' },
  { id: 'a4', section: 'Auto', label: 'Auto Coral L2', type: 'number', path: 'auto.l2' },
  { id: 'a5', section: 'Auto', label: 'Auto Coral L1', type: 'number', path: 'auto.l1' },
  { id: 'a6', section: 'Auto', label: 'Missed Coral', type: 'number', path: 'auto.coralMissed' },
  { id: 'a8', section: 'Auto', label: 'Auto Processor', type: 'number', path: 'auto.processor' },
  { id: 'a9', section: 'Auto', label: 'Auto Net', type: 'number', path: 'auto.net' },

  // --- TELEOP ---
  { id: 't1', section: 'Teleop', label: 'Teleop Coral L4', type: 'number', path: 'teleop.l4' },
  { id: 't2', section: 'Teleop', label: 'Teleop Coral L3', type: 'number', path: 'teleop.l3' },
  { id: 't3', section: 'Teleop', label: 'Teleop Coral L2', type: 'number', path: 'teleop.l2' },
  { id: 't4', section: 'Teleop', label: 'Teleop Coral L1', type: 'number', path: 'teleop.l1' },
  { id: 't5', section: 'Teleop', label: 'Missed Coral', type: 'number', path: 'teleop.coralMissed' },
  { id: 't6', section: 'Teleop', label: 'Teleop Processor', type: 'number', path: 'teleop.processor' },
  { id: 't7', section: 'Teleop', label: 'Teleop Net', type: 'number', path: 'teleop.net' },
  { id: 't9', section: 'Teleop', label: 'Played Defense', type: 'boolean', path: 'teleop.playedDefence' },

  // --- ENDGAME ---
  { id: 'e1', section: 'Endgame', label: 'End State (0-4)', type: 'number', path: 'endgame.endState' },
  { id: 'e2', section: 'Endgame', label: 'Defense Level (1-5)', type: 'number', path: 'endgame.defenceLevel' },
  { id: 'e3', section: 'Endgame', label: 'Driving Level (1-5)', type: 'number', path: 'endgame.drivingLevel' },
  { id: 'e4', section: 'Endgame', label: 'Robot Disabled', type: 'boolean', path: 'endgame.disabled' },
  { id: 'e5', section: 'Endgame', label: 'Comments', type: 'text', path: 'endgame.comments' },
];
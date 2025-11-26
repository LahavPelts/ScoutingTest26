
export interface StatboticsTeamYear {
  team: number;
  year: number;
  epa_total: number;
  epa_auto: number;
  epa_teleop: number;
  epa_endgame: number;
  unitless_epa_endgame: number;
  norm_epa_endgame: number;
}

// Fetch EPA data for the 2025 season
// Falls back to empty object if fails
export const fetchEPAData = async (): Promise<Record<string, StatboticsTeamYear>> => {
  try {
    // Fetching for 2025 (Reefscape)
    // Using a limit of 3000 to cover all teams if necessary, though we filter locally
    const response = await fetch('https://api.statbotics.io/v3/team_years?year=2025&limit=3000');
    
    if (!response.ok) {
      console.warn("Failed to fetch Statbotics data");
      return {};
    }

    const data: StatboticsTeamYear[] = await response.json();
    
    const map: Record<string, StatboticsTeamYear> = {};
    data.forEach(d => {
      map[d.team.toString()] = d;
    });
    
    return map;
  } catch (error) {
    console.error("Error fetching EPA:", error);
    return {};
  }
};

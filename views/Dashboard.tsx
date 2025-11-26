import React, { useMemo, useState, useEffect } from 'react';
import { ScoutEntry, TeamStats } from '../types';
import { getEntries } from '../services/storageService';
import { fetchEPAData, StatboticsTeamYear } from '../services/apiService';
import { ISRAEL_TEAMS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface DashboardProps {
  onBack: () => void;
}

// Config for all available metrics
const METRICS: { key: keyof TeamStats; label: string; color: string; group?: string }[] = [
  { key: 'avgTotalPoints', label: 'Total', color: '#1e3a8a', group: 'Summary' },
  { key: 'avgAutoPoints', label: 'Auto', color: '#1e3a8a', group: 'Summary' },
  { key: 'avgTeleopPoints', label: 'Tele', color: '#42A5F5', group: 'Summary' },
  { key: 'avgL4', label: 'L4', color: '#00ACC1', group: 'Coral' },
  { key: 'avgL3', label: 'L3', color: '#26C6DA', group: 'Coral' },
  { key: 'avgL2', label: 'L2', color: '#4DD0E1', group: 'Coral' },
  { key: 'avgL1', label: 'L1', color: '#80DEEA', group: 'Coral' },
  { key: 'avgNet', label: 'Net', color: '#9575CD', group: 'Algae' },
  { key: 'avgProcessor', label: 'Proc', color: '#7E57C2', group: 'Algae' },
  { key: 'avgDefenceRating', label: 'Def', color: '#78909C', group: 'Misc' },
  { key: 'epaTotal', label: 'EPA', color: '#EF5350', group: 'API' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [view, setView] = useState<'leaderboard' | 'compare'>('leaderboard');
  const [filterDefence, setFilterDefence] = useState(false);
  const [useApiData, setUseApiData] = useState(false);
  
  // Multi-select for columns. If empty, show ALL.
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set());
  
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<keyof TeamStats>('avgTotalPoints');
  const [sortDesc, setSortDesc] = useState(true);

  const [epaData, setEpaData] = useState<Record<string, StatboticsTeamYear>>({});
  const [loadingEpa, setLoadingEpa] = useState(false);
  
  const entries = getEntries();

  // Fetch EPA data when API Data toggle is enabled
  useEffect(() => {
    if (useApiData && Object.keys(epaData).length === 0) {
      setLoadingEpa(true);
      fetchEPAData().then(data => {
        setEpaData(data);
        setLoadingEpa(false);
      });
    }
  }, [useApiData, epaData]);

  // Aggregate Data
  const stats = useMemo(() => {
    const teamMap: Record<string, ScoutEntry[]> = {};
    
    entries.forEach(e => {
      if (filterDefence && e.endgame.defenceRobot) return;
      if (!teamMap[e.teamNumber]) teamMap[e.teamNumber] = [];
      teamMap[e.teamNumber].push(e);
    });

    const calculatedStats: TeamStats[] = ISRAEL_TEAMS.map(team => {
      const matches = teamMap[team] || [];
      const count = matches.length;
      const teamEpa = epaData[team];

      // Pure Local Averages
      let rawStats = { auto: 0, teleop: 0, l4: 0, l3: 0, l2: 0, l1: 0, proc: 0, net: 0, def: 0 };
      
      if (count > 0) {
        rawStats = matches.reduce((acc, m) => ({
          auto: acc.auto + m.auto.l4*6 + m.auto.l3*4 + m.auto.l2*3 + m.auto.l1*2 + m.auto.processor*4 + m.auto.net*2 + (m.auto.passedLine ? 3 : 0),
          teleop: acc.teleop + m.teleop.l4*5 + m.teleop.l3*4 + m.teleop.l2*3 + m.teleop.l1*2 + m.teleop.processor*4 + m.teleop.net*2,
          l4: acc.l4 + m.auto.l4 + m.teleop.l4,
          l3: acc.l3 + m.auto.l3 + m.teleop.l3,
          l2: acc.l2 + m.auto.l2 + m.teleop.l2,
          l1: acc.l1 + m.auto.l1 + m.teleop.l1,
          proc: acc.proc + m.auto.processor + m.teleop.processor,
          net: acc.net + m.auto.net + m.teleop.net,
          def: acc.def + m.endgame.defenceLevel
        }), rawStats);
      }

      const safeDiv = (n: number) => count === 0 ? 0 : n / count;
      
      let avgAuto = safeDiv(rawStats.auto);
      let avgTeleop = safeDiv(rawStats.teleop);
      let avgTotal = avgAuto + avgTeleop;
      let source: 'Local' | 'Hybrid' = 'Local';

      if (useApiData && teamEpa) {
        source = 'Hybrid';
        if (count > 0) {
          avgAuto = (avgAuto * 3 + teamEpa.epa_auto * 2) / 5;
          avgTeleop = (avgTeleop * 3 + teamEpa.epa_teleop * 2) / 5;
          avgTotal = (avgTotal * 3 + teamEpa.epa_total * 2) / 5;
        } else {
          avgAuto = teamEpa.epa_auto;
          avgTeleop = teamEpa.epa_teleop;
          avgTotal = teamEpa.epa_total;
        }
      }

      return {
        teamNumber: team,
        matchesPlayed: count,
        avgTotalPoints: parseFloat(avgTotal.toFixed(1)),
        avgAutoPoints: parseFloat(avgAuto.toFixed(1)),
        avgTeleopPoints: parseFloat(avgTeleop.toFixed(1)),
        avgL4: parseFloat(safeDiv(rawStats.l4).toFixed(1)),
        avgL3: parseFloat(safeDiv(rawStats.l3).toFixed(1)),
        avgL2: parseFloat(safeDiv(rawStats.l2).toFixed(1)),
        avgL1: parseFloat(safeDiv(rawStats.l1).toFixed(1)),
        avgProcessor: parseFloat(safeDiv(rawStats.proc).toFixed(1)),
        avgNet: parseFloat(safeDiv(rawStats.net).toFixed(1)),
        avgDefenceRating: parseFloat(safeDiv(rawStats.def).toFixed(1)),
        epaTotal: teamEpa ? parseFloat(teamEpa.epa_total.toFixed(1)) : undefined,
        source
      };
    });

    return calculatedStats.sort((a, b) => {
      const valA = (a[sortKey] as number) || 0;
      const valB = (b[sortKey] as number) || 0;
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [entries, filterDefence, useApiData, epaData, sortKey, sortDesc]);

  const toggleTeamSelect = (team: string) => {
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter(t => t !== team));
    } else {
      if (selectedTeams.length < 8) {
        setSelectedTeams([...selectedTeams, team]);
      }
    }
  };

  const toggleMetric = (key: string) => {
    const newSet = new Set(visibleMetrics);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setVisibleMetrics(newSet);
  };

  const handleHeaderClick = (key: keyof TeamStats) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  // Determine which columns to show. If set is empty, show ALL.
  const activeMetrics = useMemo(() => {
    if (visibleMetrics.size === 0) return METRICS;
    return METRICS.filter(m => visibleMetrics.has(m.key));
  }, [visibleMetrics]);

  const selectedStats = stats.filter(s => selectedTeams.includes(s.teamNumber));

  // --- COMPARE VIEW ---
  if (view === 'compare') {
    return (
      <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
         <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center gap-4">
            <button onClick={() => setView('leaderboard')} className="text-gray-500 hover:text-ga-accent font-bold text-lg">
               ← Back
            </button>
            <h2 className="text-xl font-bold text-ga-accent">Comparison</h2>
         </div>

         <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
            {/* Total Points Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-64 flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 mb-2">Total Points {useApiData ? '(Hybrid)' : '(Avg)'}</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="teamNumber" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip cursor={{fill: '#F9FAFB'}} />
                  <Bar dataKey="avgTotalPoints" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Total" />
                  {useApiData && <Bar dataKey="epaTotal" fill="#EF5350" radius={[4, 4, 0, 0]} name="Statbotics EPA" />}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Auto/Teleop Stacked */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-64 flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 mb-2">Auto vs Teleop</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="teamNumber" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip cursor={{fill: '#F9FAFB'}} />
                  <Legend />
                  <Bar dataKey="avgAutoPoints" name="Auto" fill="#1e3a8a" stackId="a" />
                  <Bar dataKey="avgTeleopPoints" name="Teleop" fill="#60A5FA" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* L4 Breakdown */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-64 flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 mb-2">L4 & L3 Avg</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedStats}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="teamNumber" tick={{fontSize: 12}} />
                   <YAxis />
                   <Tooltip cursor={{fill: '#F9FAFB'}} />
                   <Legend />
                   <Bar dataKey="avgL4" name="L4" fill="#00ACC1" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="avgL3" name="L3" fill="#4DD0E1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
             {/* Net & Proc */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-64 flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 mb-2">Algae Avg</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedStats}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="teamNumber" tick={{fontSize: 12}} />
                   <YAxis />
                   <Tooltip cursor={{fill: '#F9FAFB'}} />
                   <Legend />
                   <Bar dataKey="avgNet" name="Net" fill="#9575CD" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="avgProcessor" name="Proc" fill="#7E57C2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    );
  }

  // --- LEADERBOARD VIEW ---
  return (
    <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
          <button onClick={onBack} className="text-gray-500 hover:text-ga-accent font-bold text-lg">
             ← Home
          </button>
          <h2 className="text-xl font-bold text-ga-accent hidden md:block">Leaderboard</h2>
          <div className="text-right text-xs font-bold text-gray-400">
             Selected: {selectedTeams.length}/8
          </div>
       </div>

       <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls Section */}
          <div className="bg-white p-4 border-b border-gray-200 space-y-4">
             {/* Global Filters */}
             <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterDefence(!filterDefence)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filterDefence ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  Ignore Def Matches
                </button>
                <button 
                  onClick={() => setUseApiData(!useApiData)}
                  disabled={loadingEpa}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${useApiData ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  {loadingEpa ? 'Loading...' : 'Include Statbotics EPA (Hybrid)'}
                </button>
             </div>

             {/* Column Selector */}
             <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  Columns (Select multiple, or none for all)
                </label>
                <div className="flex flex-wrap gap-2">
                   {METRICS.map(m => {
                     const isVisible = visibleMetrics.has(m.key as string);
                     return (
                       <button
                         key={m.key}
                         onClick={() => toggleMetric(m.key as string)}
                         className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                           isVisible 
                           ? 'bg-ga-accent text-white border-ga-accent shadow ring-2 ring-offset-1 ring-blue-100' 
                           : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                         }`}
                       >
                         {m.label}
                       </button>
                     )
                   })}
                   {visibleMetrics.size > 0 && (
                      <button 
                        onClick={() => setVisibleMetrics(new Set())}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 ml-2"
                      >
                        Clear
                      </button>
                   )}
                </div>
             </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-0 md:p-4">
             <div className="bg-white md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                         <th className="px-3 py-4 w-10 text-center sticky left-0 bg-gray-50 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">#</th>
                         <th className="px-3 py-4 sticky left-10 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Team</th>
                         
                         {activeMetrics.map(m => (
                           <th 
                             key={m.key}
                             onClick={() => handleHeaderClick(m.key)}
                             className="px-3 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors group select-none whitespace-nowrap min-w-[70px]"
                           >
                             <div className="flex items-center justify-end gap-1">
                               <span className={`${sortKey === m.key ? 'text-ga-accent font-bold' : ''}`}>{m.label}</span>
                               {sortKey === m.key && (
                                 <span className="text-ga-accent">{sortDesc ? '↓' : '↑'}</span>
                               )}
                             </div>
                           </th>
                         ))}
                         
                         <th className="px-3 py-4 text-right w-12 text-gray-400">Plays</th>
                         <th className="px-3 py-4 w-8"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {stats.map((s, idx) => {
                        const isSelected = selectedTeams.includes(s.teamNumber);
                        const hasData = s.matchesPlayed > 0 || (useApiData && s.epaTotal !== undefined);
                        
                        return (
                          <tr 
                            key={s.teamNumber} 
                            onClick={() => toggleTeamSelect(s.teamNumber)}
                            className={`transition-colors cursor-pointer select-none group ${
                              isSelected ? 'bg-blue-50/80 hover:bg-blue-100' : 'hover:bg-gray-50'
                            }`}
                          >
                             <td className="px-3 py-3 text-center font-mono text-gray-400 text-xs sticky left-0 bg-inherit z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{idx + 1}</td>
                             <td className="px-3 py-3 font-bold text-gray-900 sticky left-10 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{s.teamNumber}</td>
                             
                             {activeMetrics.map(m => (
                               <td key={m.key} className={`px-3 py-3 text-right whitespace-nowrap ${sortKey === m.key ? 'font-bold bg-gray-50/50' : 'text-gray-600'}`}>
                                 {hasData ? (s[m.key] as number) : '-'}
                               </td>
                             ))}

                             <td className="px-3 py-3 text-right text-gray-400 text-xs">
                               {s.matchesPlayed}
                             </td>
                             <td className="px-3 py-3 text-center">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-ga-accent border-ga-accent' : 'border-gray-200 bg-white group-hover:border-gray-300'
                                }`}>
                                   {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
                </div>
             </div>
          </div>
       </div>

       {/* Floating Action Button for Compare */}
       {selectedTeams.length >= 2 && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
             <button
               disabled={selectedTeams.length > 8}
               onClick={() => setView('compare')}
               className="h-14 px-6 rounded-full bg-ga-accent hover:bg-ga-accentHover text-white shadow-xl flex items-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
             >
                <span>Compare ({selectedTeams.length})</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
             </button>
             {selectedTeams.length > 8 && (
                <div className="absolute -top-8 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
                   Max 8
                </div>
             )}
          </div>
       )}
    </div>
  );
};
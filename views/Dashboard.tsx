import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScoutEntry, TeamStats } from '../types';
import { getEntries, importData } from '../services/storageService';
import { generateMockData } from '../services/mockData';
import { fetchEPAData, StatboticsTeamYear } from '../services/apiService';
import { ISRAEL_TEAMS, POINTS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, LabelList,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';

interface DashboardProps {
  onBack: () => void;
}

// Config for all available metrics
const METRICS: { key: keyof TeamStats; label: string; color: string; group?: string }[] = [
  { key: 'avgOverall', label: 'Overall', color: '#000000', group: 'Summary' },
  { key: 'avgTotalPoints', label: 'Total', color: '#1e3a8a', group: 'Summary' },
  { key: 'avgAutoPoints', label: 'Auto', color: '#1e3a8a', group: 'Summary' },
  { key: 'avgTeleopPoints', label: 'Tele', color: '#42A5F5', group: 'Summary' },
  { key: 'avgCoral', label: 'Coral', color: '#00ACC1', group: 'Coral' },
  { key: 'avgAlgae', label: 'Algae', color: '#7E57C2', group: 'Algae' },
  { key: 'avgL4', label: 'L4', color: '#26C6DA', group: 'Coral' },
  { key: 'avgL3', label: 'L3', color: '#4DD0E1', group: 'Coral' },
  { key: 'avgL2', label: 'L2', color: '#80DEEA', group: 'Coral' },
  { key: 'avgL1', label: 'L1', color: '#B2EBF2', group: 'Coral' },
  { key: 'avgNet', label: 'Net', color: '#9575CD', group: 'Algae' },
  { key: 'avgProcessor', label: 'Proc', color: '#B39DDB', group: 'Algae' },
  { key: 'avgDefenceRating', label: 'Def', color: '#78909C', group: 'Misc' },
  { key: 'epaTotal', label: 'EPA', color: '#EF5350', group: 'API' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [view, setView] = useState<'leaderboard' | 'analysis' | 'compare' | 'team_detail'>('leaderboard');
  const [filterDefence, setFilterDefence] = useState(false); 
  const [useApiData, setUseApiData] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set());
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<keyof TeamStats>('avgOverall');
  const [sortDesc, setSortDesc] = useState(true);
  const [epaData, setEpaData] = useState<Record<string, StatboticsTeamYear>>({});
  const [loadingEpa, setLoadingEpa] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const entries = getEntries();

  useEffect(() => {
    if (useApiData && Object.keys(epaData).length === 0) {
      setLoadingEpa(true);
      fetchEPAData().then(data => {
        setEpaData(data);
        setLoadingEpa(false);
      });
    }
  }, [useApiData, epaData]);

  const stats = useMemo(() => {
    const teamMap: Record<string, ScoutEntry[]> = {};
    
    entries.forEach(e => {
      if (filterDefence && e.teleop.playedDefence) return;
      if (!teamMap[e.teamNumber]) teamMap[e.teamNumber] = [];
      teamMap[e.teamNumber].push(e);
    });

    const calculatedStats: TeamStats[] = ISRAEL_TEAMS.map(team => {
      const matches = teamMap[team] || [];
      const count = matches.length;
      const teamEpa = epaData[team];

      let rawStats = { auto: 0, teleop: 0, l4: 0, l3: 0, l2: 0, l1: 0, proc: 0, net: 0, def: 0, coral: 0, algae: 0 };
      
      if (count > 0) {
        rawStats = matches.reduce((acc, m) => {
          const matchCoral = (m.auto.l4 + m.auto.l3 + m.auto.l2 + m.auto.l1) + (m.teleop.l4 + m.teleop.l3 + m.teleop.l2 + m.teleop.l1);
          const matchAlgae = (m.auto.processor + m.auto.net) + (m.teleop.processor + m.teleop.net);
          
          return {
            auto: acc.auto + 
                  m.auto.l4 * POINTS.AUTO.L4 + 
                  m.auto.l3 * POINTS.AUTO.L3 + 
                  m.auto.l2 * POINTS.AUTO.L2 + 
                  m.auto.l1 * POINTS.AUTO.L1 + 
                  m.auto.processor * POINTS.AUTO.PROCESSOR + 
                  m.auto.net * POINTS.AUTO.NET + 
                  (m.auto.passedLine ? POINTS.AUTO.PASSED_LINE : 0),
                  
            teleop: acc.teleop + 
                    m.teleop.l4 * POINTS.TELEOP.L4 + 
                    m.teleop.l3 * POINTS.TELEOP.L3 + 
                    m.teleop.l2 * POINTS.TELEOP.L2 + 
                    m.teleop.l1 * POINTS.TELEOP.L1 + 
                    m.teleop.processor * POINTS.TELEOP.PROCESSOR + 
                    m.teleop.net * POINTS.TELEOP.NET,
                    
            l4: acc.l4 + m.auto.l4 + m.teleop.l4,
            l3: acc.l3 + m.auto.l3 + m.teleop.l3,
            l2: acc.l2 + m.auto.l2 + m.teleop.l2,
            l1: acc.l1 + m.auto.l1 + m.teleop.l1,
            proc: acc.proc + m.auto.processor + m.teleop.processor,
            net: acc.net + m.auto.net + m.teleop.net,
            def: acc.def + m.endgame.defenceLevel,
            coral: acc.coral + matchCoral,
            algae: acc.algae + matchAlgae
          };
        }, rawStats);
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
      
      const overall = (avgAuto * 1.2) + avgTeleop + (safeDiv(rawStats.l4) * 2) + (safeDiv(rawStats.def) * 1.5);

      return {
        teamNumber: team,
        matchesPlayed: count,
        avgTotalPoints: parseFloat(avgTotal.toFixed(1)),
        avgAutoPoints: parseFloat(avgAuto.toFixed(1)),
        avgTeleopPoints: parseFloat(avgTeleop.toFixed(1)),
        avgOverall: parseFloat(overall.toFixed(1)),
        avgCoral: parseFloat(safeDiv(rawStats.coral).toFixed(1)),
        avgAlgae: parseFloat(safeDiv(rawStats.algae).toFixed(1)),
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
      if (selectedTeams.length < 8) setSelectedTeams([...selectedTeams, team]);
    }
  };

  const toggleMetric = (key: string) => {
    const newSet = new Set(visibleMetrics);
    if (newSet.has(key)) newSet.delete(key); else newSet.add(key);
    setVisibleMetrics(newSet);
  };

  const handleHeaderClick = (key: keyof TeamStats) => {
    if (sortKey === key) setSortDesc(!sortDesc); else { setSortKey(key); setSortDesc(true); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importData(event.target?.result as string, file.name.endsWith('.json') ? 'json' : 'csv');
      window.location.reload();
    };
    reader.readAsText(file);
  };

  const activeMetrics = useMemo(() => visibleMetrics.size === 0 ? METRICS : METRICS.filter(m => visibleMetrics.has(m.key)), [visibleMetrics]);
  const selectedStats = stats.filter(s => selectedTeams.includes(s.teamNumber));

  if (view === 'team_detail' && selectedTeams.length === 1) {
    const team = selectedTeams[0];
    const stat = stats.find(s => s.teamNumber === team);
    const teamMatches = entries.filter(e => e.teamNumber === team).sort((a, b) => a.timestamp - b.timestamp);
    const historyData = teamMatches.map(m => ({ match: `M${m.matchNumber}`, total: (m.auto.l4 * POINTS.AUTO.L4 + m.auto.l3 * POINTS.AUTO.L3 + m.auto.l2 * POINTS.AUTO.L2 + m.auto.l1 * POINTS.AUTO.L1 + m.auto.processor * POINTS.AUTO.PROCESSOR + m.auto.net * POINTS.AUTO.NET + (m.auto.passedLine ? POINTS.AUTO.PASSED_LINE : 0)) + (m.teleop.l4 * POINTS.TELEOP.L4 + m.teleop.l3 * POINTS.TELEOP.L3 + m.teleop.l2 * POINTS.TELEOP.L2 + m.teleop.l1 * POINTS.TELEOP.L1 + m.teleop.processor * POINTS.TELEOP.PROCESSOR + m.teleop.net * POINTS.TELEOP.NET), auto: (m.auto.l4 * POINTS.AUTO.L4 + m.auto.l3 * POINTS.AUTO.L3 + m.auto.l2 * POINTS.AUTO.L2 + m.auto.l1 * POINTS.AUTO.L1 + m.auto.processor * POINTS.AUTO.PROCESSOR + m.auto.net * POINTS.AUTO.NET + (m.auto.passedLine ? POINTS.AUTO.PASSED_LINE : 0)) }));
    const radarData = stat ? [ { subject: 'Auto', A: Math.min(stat.avgAutoPoints / 2, 10), fullMark: 10 }, { subject: 'Teleop', A: Math.min(stat.avgTeleopPoints / 3, 10), fullMark: 10 }, { subject: 'Coral', A: Math.min(stat.avgCoral, 10), fullMark: 10 }, { subject: 'Algae', A: Math.min(stat.avgAlgae, 10), fullMark: 10 }, { subject: 'L4', A: Math.min(stat.avgL4 * 2, 10), fullMark: 10 }, { subject: 'Defense', A: stat.avgDefenceRating * 2, fullMark: 10 }, ] : [];

    return (
        <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center gap-4">
                <button onClick={() => setView('leaderboard')} className="text-gray-500 hover:text-ga-accent font-bold text-lg">← Back</button>
                <h2 className="text-2xl font-bold text-ga-accent flex-1">Team {team} Analysis</h2>
                <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Score: {stat?.avgOverall}</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
                <div className="bg-white p-4 rounded-xl shadow-sm border h-80 flex flex-col items-center justify-center">
                    <h4 className="text-sm font-bold text-gray-500 mb-2 w-full">Robot Profile</h4>
                    <ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}><PolarGrid /><PolarAngleAxis dataKey="subject" tick={{fontSize:10}} /><PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} /><Radar name={team} dataKey="A" stroke="#00ACC1" fill="#00ACC1" fillOpacity={0.6} /></RadarChart></ResponsiveContainer>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border h-80 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-500 mb-2">Performance Trend</h4>
                    <ResponsiveContainer width="100%" height="100%"><LineChart data={historyData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="match" tick={{fontSize:10}} /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="total" stroke="#1e3a8a" strokeWidth={3} dot={{r:4}} /><Line type="monotone" dataKey="auto" stroke="#4DD0E1" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
                </div>
            </div>
        </div>
    );
  }

  // --- COMPARE VIEW ---
  if (view === 'compare') {
    // Prepare data for Radar Chart
    const comparisonRadarData = ['Auto', 'Tele', 'Coral', 'Algae', 'Def'].map(subject => {
        const entry: Record<string, string | number> = { subject, fullMark: 10 };
        selectedStats.forEach(s => {
           let val = 0;
           switch(subject) {
              case 'Auto': val = Math.min(s.avgAutoPoints / 2, 10); break;
              case 'Tele': val = Math.min(s.avgTeleopPoints / 3, 10); break;
              case 'Coral': val = Math.min(s.avgCoral, 10); break;
              case 'Algae': val = Math.min(s.avgAlgae, 10); break;
              case 'Def': val = s.avgDefenceRating * 2; break;
           }
           entry[s.teamNumber] = val;
        });
        return entry;
    });

    return (
      <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
         <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center gap-4">
            <button onClick={() => setView('leaderboard')} className="text-gray-500 hover:text-ga-accent font-bold text-lg">← Back</button>
            <h2 className="text-xl font-bold text-ga-accent">Comparison</h2>
         </div>

         <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto">
            {/* Coral L1-L4 Breakdown (Stacked) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 mb-2">Coral Level Breakdown</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="teamNumber" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip cursor={{fill: '#F9FAFB'}} />
                  <Legend />
                  <Bar dataKey="avgL4" name="L4" fill="#26C6DA" stackId="coral" />
                  <Bar dataKey="avgL3" name="L3" fill="#4DD0E1" stackId="coral" />
                  <Bar dataKey="avgL2" name="L2" fill="#80DEEA" stackId="coral" />
                  <Bar dataKey="avgL1" name="L1" fill="#B2EBF2" stackId="coral" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Comparison */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col">
               <h4 className="text-sm font-bold text-gray-500 mb-2">Profile Comparison</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={comparisonRadarData}>
                     <PolarGrid />
                     <PolarAngleAxis dataKey="subject" />
                     {selectedStats.map((s, i) => (
                        <Radar 
                           key={s.teamNumber}
                           name={s.teamNumber} 
                           dataKey={s.teamNumber}
                           stroke={['#1e3a8a', '#EF5350', '#00ACC1', '#7E57C2', '#FBC02D'][i % 5]} 
                           fill={['#1e3a8a', '#EF5350', '#00ACC1', '#7E57C2', '#FBC02D'][i % 5]} 
                           fillOpacity={0.1} 
                        />
                     ))}
                     <Legend />
                  </RadarChart>
               </ResponsiveContainer>
            </div>

            {/* Detailed Stats Table */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Team</th>
                                <th className="px-4 py-3">Matches</th>
                                <th className="px-4 py-3">Avg Total</th>
                                <th className="px-4 py-3">Avg Auto</th>
                                <th className="px-4 py-3">Avg Teleop</th>
                                <th className="px-4 py-3">L4</th>
                                <th className="px-4 py-3">L3</th>
                                <th className="px-4 py-3">L2</th>
                                <th className="px-4 py-3">L1</th>
                                <th className="px-4 py-3">Proc</th>
                                <th className="px-4 py-3">Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedStats.map(s => (
                                <tr key={s.teamNumber} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-bold">{s.teamNumber}</td>
                                    <td className="px-4 py-3">{s.matchesPlayed}</td>
                                    <td className="px-4 py-3 font-bold text-blue-800">{s.avgTotalPoints}</td>
                                    <td className="px-4 py-3">{s.avgAutoPoints}</td>
                                    <td className="px-4 py-3">{s.avgTeleopPoints}</td>
                                    <td className="px-4 py-3 font-bold text-cyan-600">{s.avgL4}</td>
                                    <td className="px-4 py-3">{s.avgL3}</td>
                                    <td className="px-4 py-3">{s.avgL2}</td>
                                    <td className="px-4 py-3">{s.avgL1}</td>
                                    <td className="px-4 py-3">{s.avgProcessor}</td>
                                    <td className="px-4 py-3">{s.avgNet}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
         </div>
      </div>
    );
  }

  // --- ANALYSIS (SCATTER) VIEW ---
  if (view === 'analysis') {
    return (
        <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
           <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center justify-between">
              <button onClick={() => setView('leaderboard')} className="text-gray-500 hover:text-ga-accent font-bold text-lg">← Leaderboard</button>
              <h2 className="text-xl font-bold text-ga-accent">Global Analysis</h2>
              <div className="w-8"></div>
           </div>
           <div className="flex-1 p-4 flex flex-col items-center justify-center bg-gray-50">
               <div className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-4xl h-[600px] flex flex-col">
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Auto vs Teleop Distribution</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="avgAutoPoints" name="Auto" label={{ value: 'Auto Points', position: 'bottom' }} />
                      <YAxis type="number" dataKey="avgTeleopPoints" name="Teleop" label={{ value: 'Teleop Points', angle: -90, position: 'insideLeft' }} />
                      <ZAxis type="number" dataKey="avgOverall" range={[60, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Teams" data={stats.filter(s => s.matchesPlayed > 0)} fill="#1e3a8a">
                         <LabelList dataKey="teamNumber" position="top" style={{fontSize: 10, fontWeight: 'bold'}} />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
               </div>
           </div>
        </div>
    );
  }

  // --- LEADERBOARD VIEW ---
  return (
    <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
       <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
          <button onClick={onBack} className="text-gray-500 hover:text-ga-accent font-bold text-lg">← Home</button>
          <div className="flex bg-gray-100 rounded-lg p-1">
             <button onClick={() => setView('leaderboard')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${view === 'leaderboard' ? 'bg-white shadow text-ga-accent' : 'text-gray-400'}`}>List</button>
             <button onClick={() => setView('analysis')} className="px-3 py-1 rounded-md text-sm font-bold transition-all text-gray-400">Scatter</button>
          </div>
          <div className="text-right text-xs font-bold text-gray-400">Selected: {selectedTeams.length}/8</div>
       </div>

       <div className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-white p-4 border-b border-gray-200 space-y-4">
             <div className="flex flex-wrap gap-2 items-center">
                <button onClick={() => setFilterDefence(!filterDefence)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filterDefence ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>{filterDefence ? 'Def Filter ON' : 'Def Filter OFF'}</button>
                <button onClick={() => setUseApiData(!useApiData)} disabled={loadingEpa} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${useApiData ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{loadingEpa ? 'Loading...' : 'Include Statbotics EPA'}</button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json,.csv" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg text-xs font-bold border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 ml-auto flex items-center gap-1"><span>📥 Import</span></button>
                <button onClick={generateMockData} className="px-4 py-2 rounded-lg text-xs font-bold border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 flex items-center gap-1"><span>⚡ Mock</span></button>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Columns</label>
                <div className="flex flex-wrap gap-2">
                   {METRICS.map(m => ( <button key={m.key} onClick={() => toggleMetric(m.key as string)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${visibleMetrics.has(m.key as string) ? 'bg-ga-accent text-white border-ga-accent shadow' : 'bg-white text-gray-600 border-gray-200'}`}>{m.label}</button> ))}
                   {visibleMetrics.size > 0 && ( <button onClick={() => setVisibleMetrics(new Set())} className="px-3 py-1.5 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 ml-2">Clear</button> )}
                </div>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 p-0 md:p-4">
             <div className="bg-white md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                         <th className="px-3 py-4 w-10 text-center sticky left-0 bg-gray-50 z-20">#</th>
                         <th className="px-3 py-4 sticky left-10 bg-gray-50 z-20">Team</th>
                         {activeMetrics.map(m => ( <th key={m.key} onClick={() => handleHeaderClick(m.key)} className="px-3 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap min-w-[70px]"><div className="flex items-center justify-end gap-1"><span className={`${sortKey === m.key ? 'text-ga-accent font-bold' : ''}`}>{m.label}</span>{sortKey === m.key && <span className="text-ga-accent">{sortDesc ? '↓' : '↑'}</span>}</div></th> ))}
                         <th className="px-3 py-4 text-right w-12 text-gray-400">Plays</th>
                         <th className="px-3 py-4 w-8"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {stats.map((s, idx) => {
                        const isSelected = selectedTeams.includes(s.teamNumber);
                        const hasData = s.matchesPlayed > 0 || (useApiData && s.epaTotal !== undefined);
                        return (
                          <tr key={s.teamNumber} onClick={() => toggleTeamSelect(s.teamNumber)} className={`transition-colors cursor-pointer select-none group ${isSelected ? 'bg-blue-50/80 hover:bg-blue-100' : 'hover:bg-gray-50'}`}>
                             <td className="px-3 py-3 text-center font-mono text-gray-400 text-xs sticky left-0 bg-inherit z-10">{idx + 1}</td>
                             <td className="px-3 py-3 font-bold text-gray-900 sticky left-10 bg-inherit z-10">{s.teamNumber}</td>
                             {activeMetrics.map(m => ( <td key={m.key} className={`px-3 py-3 text-right whitespace-nowrap ${sortKey === m.key ? 'font-bold bg-gray-50/50' : 'text-gray-600'}`}>{hasData ? (s[m.key] as number) : '-'}</td> ))}
                             <td className="px-3 py-3 text-right text-gray-400 text-xs">{s.matchesPlayed}</td>
                             <td className="px-3 py-3 text-center"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-ga-accent border-ga-accent' : 'border-gray-200 bg-white group-hover:border-gray-300'}`}>{isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}</div></td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
                </div>
             </div>
          </div>
       </div>

       {selectedTeams.length >= 1 && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
             <button disabled={selectedTeams.length > 8} onClick={() => selectedTeams.length === 1 ? setView('team_detail') : setView('compare')} className="h-14 px-6 rounded-full bg-ga-accent hover:bg-ga-accentHover text-white shadow-xl flex items-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                {selectedTeams.length === 1 ? ( <><span>View Team {selectedTeams[0]}</span></> ) : ( <><span>Compare ({selectedTeams.length})</span></> )}
             </button>
          </div>
       )}
    </div>
  );
};

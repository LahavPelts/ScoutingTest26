
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScoutEntry, TeamStats, CageType } from '../types';
import { getEntries, importData } from '../services/storageService';
import { generateMockData } from '../services/mockData';
import { fetchEPAData, StatboticsTeamYear } from '../services/apiService';
import { ISRAEL_TEAMS, POINTS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';
import { Button } from '../components/Button';

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
  { key: 'avgCoralAccuracy', label: 'Acc %', color: '#006064', group: 'Coral' },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set());
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<keyof TeamStats>('avgOverall');
  const [sortDesc, setSortDesc] = useState(true);
  const [epaData, setEpaData] = useState<Record<string, StatboticsTeamYear>>({});
  const [loadingEpa, setLoadingEpa] = useState(false);
  const [showCoralBreakdown, setShowCoralBreakdown] = useState(false);
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
      // If filter is ON, only include entries where they did NOT play defense
      if (filterDefence && e.teleop.playedDefence) return;
      if (!teamMap[e.teamNumber]) teamMap[e.teamNumber] = [];
      teamMap[e.teamNumber].push(e);
    });

    const calculatedStats: TeamStats[] = ISRAEL_TEAMS.map(team => {
      const matches = teamMap[team] || [];
      const count = matches.length;
      const teamEpa = epaData[team];

      let rawStats = { 
        auto: 0, teleop: 0, 
        l4: 0, l3: 0, l2: 0, l1: 0, 
        proc: 0, net: 0, 
        defSum: 0, defCount: 0, // Separate counter for defense
        coralMade: 0, coralMissed: 0,
        algae: 0 
      };
      
      if (count > 0) {
        rawStats = matches.reduce((acc, m) => {
          const matchCoral = (m.auto.l4 + m.auto.l3 + m.auto.l2 + m.auto.l1) + (m.teleop.l4 + m.teleop.l3 + m.teleop.l2 + m.teleop.l1);
          const matchCoralMissed = m.auto.coralMissed + m.teleop.coralMissed;
          const matchAlgae = (m.auto.processor + m.auto.net) + (m.teleop.processor + m.teleop.net);
          
          let defRating = 0;
          let defPlayed = 0;
          if (m.teleop.playedDefence) {
             defRating = m.endgame.defenceLevel;
             defPlayed = 1;
          }

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
            defSum: acc.defSum + defRating,
            defCount: acc.defCount + defPlayed,
            coralMade: acc.coralMade + matchCoral,
            coralMissed: acc.coralMissed + matchCoralMissed,
            algae: acc.algae + matchAlgae
          };
        }, rawStats);
      }

      const safeDiv = (n: number) => count === 0 ? 0 : n / count;
      let avgAuto = safeDiv(rawStats.auto);
      let avgTeleop = safeDiv(rawStats.teleop);
      let avgTotal = avgAuto + avgTeleop;
      let source: 'Local' | 'Hybrid' = 'Local';

      // Coral Accuracy Calculation
      const totalAttempts = rawStats.coralMade + rawStats.coralMissed;
      const coralAccuracy = totalAttempts > 0 ? (rawStats.coralMade / totalAttempts) * 100 : 0;

      // Defense Calculation (Avg of ONLY matches where they played defense)
      const avgDef = rawStats.defCount > 0 ? rawStats.defSum / rawStats.defCount : 0;

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
      
      const overall = (avgAuto * 1.2) + avgTeleop + (safeDiv(rawStats.l4) * 2) + (avgDef * 1.5);

      return {
        teamNumber: team,
        matchesPlayed: count,
        avgTotalPoints: parseFloat(avgTotal.toFixed(1)),
        avgAutoPoints: parseFloat(avgAuto.toFixed(1)),
        avgTeleopPoints: parseFloat(avgTeleop.toFixed(1)),
        avgOverall: parseFloat(overall.toFixed(1)),
        avgCoral: parseFloat(safeDiv(rawStats.coralMade).toFixed(1)),
        avgCoralAccuracy: parseFloat(coralAccuracy.toFixed(1)),
        avgAlgae: parseFloat(safeDiv(rawStats.algae).toFixed(1)),
        avgL4: parseFloat(safeDiv(rawStats.l4).toFixed(1)),
        avgL3: parseFloat(safeDiv(rawStats.l3).toFixed(1)),
        avgL2: parseFloat(safeDiv(rawStats.l2).toFixed(1)),
        avgL1: parseFloat(safeDiv(rawStats.l1).toFixed(1)),
        avgProcessor: parseFloat(safeDiv(rawStats.proc).toFixed(1)),
        avgNet: parseFloat(safeDiv(rawStats.net).toFixed(1)),
        avgDefenceRating: parseFloat(avgDef.toFixed(1)),
        epaTotal: teamEpa ? parseFloat(teamEpa.epa_total.toFixed(1)) : undefined,
        source
      };
    });

    let result = calculatedStats;

    // Filter by search
    if (searchTerm) {
      result = result.filter(s => s.teamNumber.includes(searchTerm));
    }

    // Sort
    return result.sort((a, b) => {
      const valA = (a[sortKey] as number) || 0;
      const valB = (b[sortKey] as number) || 0;
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [entries, filterDefence, useApiData, epaData, sortKey, sortDesc, searchTerm]);

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
    if (key === 'avgCoral') {
      setShowCoralBreakdown(!showCoralBreakdown);
      return;
    }
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

  // Logic to show/hide L1-L4 based on toggle
  const activeMetrics = useMemo(() => {
    const base = visibleMetrics.size === 0 ? METRICS : METRICS.filter(m => visibleMetrics.has(m.key));
    // Filter out L1-L4 if breakdown is hidden
    return base.filter(m => {
      if (!showCoralBreakdown && ['avgL1','avgL2','avgL3','avgL4'].includes(m.key)) return false;
      return true;
    });
  }, [visibleMetrics, showCoralBreakdown]);

  const selectedStats = stats.filter(s => selectedTeams.includes(s.teamNumber));

  if (view === 'team_detail' && selectedTeams.length === 1) {
    const team = selectedTeams[0];
    const stat = stats.find(s => s.teamNumber === team);
    const teamMatches = entries.filter(e => e.teamNumber === team).sort((a, b) => a.timestamp - b.timestamp);
    const historyData = teamMatches.map(m => ({ match: `M${m.matchNumber}`, total: (m.auto.l4 * POINTS.AUTO.L4 + m.auto.l3 * POINTS.AUTO.L3 + m.auto.l2 * POINTS.AUTO.L2 + m.auto.l1 * POINTS.AUTO.L1 + m.auto.processor * POINTS.AUTO.PROCESSOR + m.auto.net * POINTS.AUTO.NET + (m.auto.passedLine ? POINTS.AUTO.PASSED_LINE : 0)) + (m.teleop.l4 * POINTS.TELEOP.L4 + m.teleop.l3 * POINTS.TELEOP.L3 + m.teleop.l2 * POINTS.TELEOP.L2 + m.teleop.l1 * POINTS.TELEOP.L1 + m.teleop.processor * POINTS.TELEOP.PROCESSOR + m.teleop.net * POINTS.TELEOP.NET), auto: (m.auto.l4 * POINTS.AUTO.L4 + m.auto.l3 * POINTS.AUTO.L3 + m.auto.l2 * POINTS.AUTO.L2 + m.auto.l1 * POINTS.AUTO.L1 + m.auto.processor * POINTS.AUTO.PROCESSOR + m.auto.net * POINTS.AUTO.NET + (m.auto.passedLine ? POINTS.AUTO.PASSED_LINE : 0)) }));
    const radarData = stat ? [ { subject: 'Auto', A: Math.min(stat.avgAutoPoints / 2, 10), fullMark: 10 }, { subject: 'Teleop', A: Math.min(stat.avgTeleopPoints / 3, 10), fullMark: 10 }, { subject: 'Coral', A: Math.min(stat.avgCoral, 10), fullMark: 10 }, { subject: 'Algae', A: Math.min(stat.avgAlgae, 10), fullMark: 10 }, { subject: 'L4', A: Math.min(stat.avgL4 * 2, 10), fullMark: 10 }, { subject: 'Defense', A: stat.avgDefenceRating * 2, fullMark: 10 }, ] : [];

    // Calculate Capabilities for ID Card
    const hasL1 = teamMatches.some(m => (m.auto.l1 + m.teleop.l1) > 0);
    const hasL2 = teamMatches.some(m => (m.auto.l2 + m.teleop.l2) > 0);
    const hasL3 = teamMatches.some(m => (m.auto.l3 + m.teleop.l3) > 0);
    const hasL4 = teamMatches.some(m => (m.auto.l4 + m.teleop.l4) > 0);
    
    const hasProcessor = teamMatches.some(m => (m.auto.processor + m.teleop.processor) > 0);
    const hasNet = teamMatches.some(m => (m.auto.net + m.teleop.net) > 0);

    const hasDeep = teamMatches.some(m => m.endgame.cage === CageType.DEEP);
    const hasShallow = teamMatches.some(m => m.endgame.cage === CageType.SHALLOW);
    const hasPark = teamMatches.some(m => m.endgame.cage === CageType.PARK);

    const CapabilityRow = ({ label, items }: { label: string, items: { text: string, active: boolean, color: string }[] }) => (
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-gray-500 w-12 uppercase">{label}</span>
        <div className="flex flex-wrap gap-1">
          {items.map(item => (
            <span key={item.text} className={`px-2 py-0.5 rounded text-xs font-bold border ${item.active ? item.color : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    );

    return (
        <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center gap-4">
                <button onClick={() => setView('leaderboard')} className="text-gray-500 hover:text-ga-accent font-bold text-lg">← Back</button>
                <h2 className="text-2xl font-bold text-ga-accent flex-1">Team {team} Analysis</h2>
                <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Score: {stat?.avgOverall}</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
                {/* Robot ID Card */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-200 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Robot ID</h3>
                    
                    <CapabilityRow 
                        label="Coral" 
                        items={[
                            { text: 'L1', active: hasL1, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
                            { text: 'L2', active: hasL2, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
                            { text: 'L3', active: hasL3, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
                            { text: 'L4', active: hasL4, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
                        ]} 
                    />
                    <CapabilityRow 
                        label="Algae" 
                        items={[
                            { text: 'Processor', active: hasProcessor, color: 'bg-purple-100 text-purple-800 border-purple-200' },
                            { text: 'Net', active: hasNet, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                        ]} 
                    />
                    <CapabilityRow 
                        label="Climb" 
                        items={[
                            { text: 'Deep', active: hasDeep, color: 'bg-amber-100 text-amber-800 border-amber-200' },
                            { text: 'Shallow', active: hasShallow, color: 'bg-orange-100 text-orange-800 border-orange-200' },
                            { text: 'Park', active: hasPark, color: 'bg-gray-100 text-gray-800 border-gray-200' },
                        ]} 
                    />
                     <CapabilityRow 
                        label="Other" 
                        items={[
                            { text: 'High Auto', active: stat ? stat.avgAutoPoints > 12 : false, color: 'bg-green-100 text-green-800 border-green-200' },
                            { text: 'Defender', active: stat ? stat.avgDefenceRating > 2 : false, color: 'bg-slate-100 text-slate-800 border-slate-200' },
                        ]} 
                    />
                    
                    <div className="mt-auto grid grid-cols-2 gap-4 text-center pt-2">
                        <div className="bg-gray-50 p-2 rounded">
                            <div className="text-xs text-gray-500 uppercase">Avg Coral Acc</div>
                            <div className="text-xl font-bold text-teal-600">{stat?.avgCoralAccuracy}%</div>
                        </div>
                         <div className="bg-gray-50 p-2 rounded">
                            <div className="text-xs text-gray-500 uppercase">Avg Def</div>
                            <div className="text-xl font-bold text-gray-600">{stat?.avgDefenceRating > 0 ? stat?.avgDefenceRating : '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border h-80 flex flex-col items-center justify-center">
                    <h4 className="text-sm font-bold text-gray-500 mb-2 w-full">Robot Profile</h4>
                    <ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}><PolarGrid /><PolarAngleAxis dataKey="subject" tick={{fontSize:10}} /><PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} /><Radar name={team} dataKey="A" stroke="#00ACC1" fill="#00ACC1" fillOpacity={0.6} /></RadarChart></ResponsiveContainer>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border h-80 md:col-span-2 lg:col-span-3">
                    <h4 className="text-sm font-bold text-gray-500 mb-2">Performance Trend</h4>
                    <ResponsiveContainer width="100%" height="100%"><LineChart data={historyData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="match" tick={{fontSize:10}} /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="total" stroke="#1e3a8a" strokeWidth={3} dot={{r:4}} /><Line type="monotone" dataKey="auto" stroke="#4DD0E1" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
                </div>

                {/* Detailed Match History Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:col-span-2 lg:col-span-3">
                    <div className="px-4 py-3 border-b border-gray-200 font-bold text-gray-700 bg-gray-50">Match History</div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2">Match</th>
                                <th className="px-3 py-2">Auto Pts</th>
                                <th className="px-3 py-2">Tele Pts</th>
                                <th className="px-3 py-2">Coral Stats (Total)</th>
                                <th className="px-3 py-2">Algae Stats</th>
                                <th className="px-3 py-2">Climb</th>
                                <th className="px-3 py-2">Def</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMatches.map(m => {
                                const autoPts = (m.auto.l4 * POINTS.AUTO.L4 + m.auto.l3 * POINTS.AUTO.L3 + m.auto.l2 * POINTS.AUTO.L2 + m.auto.l1 * POINTS.AUTO.L1 + m.auto.processor * POINTS.AUTO.PROCESSOR + m.auto.net * POINTS.AUTO.NET + (m.auto.passedLine ? POINTS.AUTO.PASSED_LINE : 0));
                                const telePts = (m.teleop.l4 * POINTS.TELEOP.L4 + m.teleop.l3 * POINTS.TELEOP.L3 + m.teleop.l2 * POINTS.TELEOP.L2 + m.teleop.l1 * POINTS.TELEOP.L1 + m.teleop.processor * POINTS.TELEOP.PROCESSOR + m.teleop.net * POINTS.TELEOP.NET);
                                
                                return (
                                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-3 py-2 font-bold">{m.matchType.toUpperCase()}{m.matchNumber}</td>
                                        <td className="px-3 py-2">{autoPts}</td>
                                        <td className="px-3 py-2">{telePts}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex gap-2 text-xs">
                                                <span className={m.auto.l4 + m.teleop.l4 > 0 ? "font-bold text-cyan-700" : "text-gray-400"}>L4:{m.auto.l4 + m.teleop.l4}</span>
                                                <span className={m.auto.l3 + m.teleop.l3 > 0 ? "font-bold text-cyan-600" : "text-gray-400"}>L3:{m.auto.l3 + m.teleop.l3}</span>
                                                <span className={m.auto.l2 + m.teleop.l2 > 0 ? "font-bold text-cyan-500" : "text-gray-400"}>L2:{m.auto.l2 + m.teleop.l2}</span>
                                                <span className={m.auto.l1 + m.teleop.l1 > 0 ? "font-bold text-cyan-400" : "text-gray-400"}>L1:{m.auto.l1 + m.teleop.l1}</span>
                                            </div>
                                        </td>
                                         <td className="px-3 py-2">
                                            <div className="flex gap-2 text-xs">
                                                <span className={m.auto.processor + m.teleop.processor > 0 ? "font-bold text-purple-700" : "text-gray-400"}>Proc:{m.auto.processor + m.teleop.processor}</span>
                                                <span className={m.auto.net + m.teleop.net > 0 ? "font-bold text-purple-500" : "text-gray-400"}>Net:{m.auto.net + m.teleop.net}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">{m.endgame.cage}</td>
                                        <td className="px-3 py-2">{m.teleop.playedDefence ? `${m.endgame.defenceLevel}★` : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Comparison View
  if (view === 'compare' && selectedTeams.length > 1) {
    const chartData = selectedStats.map(s => ({
       name: s.teamNumber,
       L1: s.avgL1, L2: s.avgL2, L3: s.avgL3, L4: s.avgL4,
       Auto: s.avgAutoPoints, Teleop: s.avgTeleopPoints,
       Accuracy: s.avgCoralAccuracy
    }));

    return (
      <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center gap-4">
             <button onClick={() => setView('leaderboard')} className="text-gray-500 hover:text-ga-accent font-bold text-lg">← Back</button>
             <h2 className="text-2xl font-bold text-ga-accent">Comparison ({selectedTeams.join(', ')})</h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
           {/* Coral L1-L4 Breakdown */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col">
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase text-center">Avg Coral Breakdown</h3>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Legend />
                    <Bar dataKey="L1" stackId="a" fill="#B2EBF2" />
                    <Bar dataKey="L2" stackId="a" fill="#80DEEA" />
                    <Bar dataKey="L3" stackId="a" fill="#4DD0E1" />
                    <Bar dataKey="L4" stackId="a" fill="#26C6DA" />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           
           {/* Coral Accuracy Chart */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col">
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase text-center">Avg Coral Accuracy (%)</h3>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="Accuracy" fill="#006064" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>

           {/* Spider Chart comparison (First 3 teams only for readability) */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-80 md:col-span-2 flex flex-col items-center">
               <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">Robot Profiles (Top 3)</h3>
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                      { subject: 'Auto', fullMark: 15 },
                      { subject: 'Teleop', fullMark: 25 },
                      { subject: 'L4', fullMark: 5 },
                      { subject: 'Algae', fullMark: 6 },
                  ].map((dim, i) => {
                      const point: any = { subject: dim.subject, fullMark: dim.fullMark };
                      selectedStats.slice(0, 3).forEach((s, idx) => {
                          if (dim.subject === 'Auto') point[`t${idx}`] = s.avgAutoPoints;
                          if (dim.subject === 'Teleop') point[`t${idx}`] = s.avgTeleopPoints;
                          if (dim.subject === 'L4') point[`t${idx}`] = s.avgL4;
                          if (dim.subject === 'Algae') point[`t${idx}`] = s.avgAlgae;
                      });
                      return point;
                  })}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      {selectedStats.slice(0, 3).map((s, idx) => (
                          <Radar key={s.teamNumber} name={s.teamNumber} dataKey={`t${idx}`} stroke={['#FF5722', '#2196F3', '#4CAF50'][idx]} fill={['#FF5722', '#2196F3', '#4CAF50'][idx]} fillOpacity={0.3} />
                      ))}
                      <Legend />
                  </RadarChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white p-6 m-4 mt-0 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
             <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Detailed Stats Comparison</h3>
             <table className="w-full text-sm text-center">
                 <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                     <tr>
                         <th className="px-4 py-3 text-left">Team</th>
                         <th className="px-4 py-3">Matches</th>
                         <th className="px-4 py-3">Auto</th>
                         <th className="px-4 py-3">Teleop</th>
                         <th className="px-4 py-3 font-bold text-cyan-600">Coral</th>
                         <th className="px-4 py-3 text-cyan-600">Acc %</th>
                         <th className="px-4 py-3 text-purple-600">Algae</th>
                         <th className="px-4 py-3">Def Rating</th>
                     </tr>
                 </thead>
                 <tbody>
                     {selectedStats.map(s => (
                         <tr key={s.teamNumber} className="border-b last:border-0 hover:bg-gray-50">
                             <td className="px-4 py-3 text-left font-bold text-lg text-ga-accent">{s.teamNumber}</td>
                             <td className="px-4 py-3">{s.matchesPlayed}</td>
                             <td className="px-4 py-3">{s.avgAutoPoints}</td>
                             <td className="px-4 py-3">{s.avgTeleopPoints}</td>
                             <td className="px-4 py-3 font-bold bg-cyan-50/50">{s.avgCoral}</td>
                             <td className="px-4 py-3">{s.avgCoralAccuracy}%</td>
                             <td className="px-4 py-3 bg-purple-50/50">{s.avgAlgae}</td>
                             <td className="px-4 py-3">{s.avgDefenceRating > 0 ? s.avgDefenceRating : '-'}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
      </div>
    );
  }

  // Leaderboard / Main View
  return (
    <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex flex-col gap-4 shadow-sm">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="ghost" className="px-2">←</Button>
                <h1 className="text-2xl font-bold tracking-tight text-ga-accent">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                 />
                 <Button variant="ghost" className="text-xs" onClick={() => fileInputRef.current?.click()}>
                   Import
                 </Button>
                 <Button variant="ghost" className="text-xs text-yellow-600 bg-yellow-50" onClick={generateMockData}>
                   ⚡ Mock
                 </Button>
            </div>
         </div>
         
         {/* Controls */}
         <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search Team..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-ga-accent focus:outline-none w-32 md:w-48"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>

             <div className="h-8 w-px bg-gray-300 mx-1"></div>

             {/* Metric Toggles */}
             <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-full pb-1">
               <button 
                  onClick={() => setVisibleMetrics(new Set())}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${visibleMetrics.size === 0 ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border-gray-200'}`}
               >
                 All
               </button>
               {['Summary', 'Coral', 'Algae'].map(grp => (
                  <button 
                    key={grp}
                    onClick={() => {
                       const groupMetrics = METRICS.filter(m => m.group === grp).map(m => m.key);
                       setVisibleMetrics(new Set(groupMetrics));
                    }}
                    className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    {grp}
                  </button>
               ))}
             </div>
         </div>

         {/* Filters & Actions Row */}
         <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
             <div className="flex gap-2">
                 {/* Defense Toggle: Green if Active (True), Red if Inactive (False) */}
                 <button 
                    onClick={() => setFilterDefence(!filterDefence)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-2 ${
                        filterDefence 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-600 border-red-100'
                    }`}
                 >
                    <span className={`w-2 h-2 rounded-full ${filterDefence ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    Defense Filter: {filterDefence ? 'ON' : 'OFF'}
                 </button>

                 <button 
                    onClick={() => setUseApiData(!useApiData)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${useApiData ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                 >
                    {useApiData ? 'API: Hybrid (3:2)' : 'API: Off'} {loadingEpa && '...'}
                 </button>
             </div>

             <div className="flex gap-2">
                 <button 
                    onClick={() => setView(view === 'analysis' ? 'leaderboard' : 'analysis')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-300 hover:bg-gray-50"
                 >
                    {view === 'analysis' ? 'List View' : 'Scatter View'}
                 </button>
                 {selectedTeams.length > 0 && (
                     <button 
                       onClick={() => selectedTeams.length === 1 ? setView('team_detail') : setView('compare')}
                       className="px-4 py-1.5 rounded-lg text-xs font-bold bg-ga-accent text-white shadow-md animate-pulse-slow"
                     >
                       {selectedTeams.length === 1 ? 'View Team' : `Compare (${selectedTeams.length})`}
                     </button>
                 )}
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
          {view === 'analysis' ? (
              <div className="w-full h-full p-4 bg-gray-50">
                  <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="avgAutoPoints" name="Auto" unit="pts" label={{ value: 'Auto Points', position: 'bottom' }} />
                          <YAxis type="number" dataKey="avgTeleopPoints" name="Teleop" unit="pts" label={{ value: 'Teleop Points', angle: -90, position: 'left' }} />
                          <ZAxis type="number" dataKey="avgOverall" range={[50, 400]} name="Score" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                      <div className="bg-white p-2 border border-gray-200 shadow-lg rounded text-xs">
                                          <p className="font-bold text-ga-accent">Team {data.teamNumber}</p>
                                          <p>Auto: {data.avgAutoPoints}</p>
                                          <p>Tele: {data.avgTeleopPoints}</p>
                                          <p>Overall: {data.avgOverall}</p>
                                      </div>
                                  );
                              }
                              return null;
                          }} />
                          <Scatter name="Teams" data={stats} fill="#1e3a8a" />
                      </ScatterChart>
                  </ResponsiveContainer>
              </div>
          ) : (
             <div className="w-full h-full overflow-auto">
                <table className="w-full text-sm text-left border-collapse relative">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b sticky top-0 z-40">
                        <tr>
                            {/* Sticky Rank Column */}
                            <th className="px-4 py-3 sticky left-0 z-50 bg-gray-50 w-12 text-center border-b">#</th>
                            
                            {/* Sticky Team Column with Shadow */}
                            <th className="px-4 py-3 sticky left-12 z-50 bg-gray-50 w-24 border-b border-r shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)]">Team</th>
                            
                            {activeMetrics.map(m => (
                                <th 
                                    key={m.key} 
                                    className={`px-4 py-3 cursor-pointer hover:text-ga-accent hover:bg-gray-100 transition-colors whitespace-nowrap ${sortKey === m.key ? 'text-ga-accent font-bold bg-blue-50' : ''}`}
                                    onClick={() => handleHeaderClick(m.key)}
                                >
                                    {m.label} {sortKey === m.key ? (sortDesc ? '↓' : '↑') : ''}
                                    {m.key === 'avgCoral' && <span className="ml-1 text-[10px] text-gray-400">({showCoralBreakdown ? '-' : '+'})</span>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.map((s, idx) => (
                           <tr 
                             key={s.teamNumber} 
                             className={`hover:bg-blue-50/30 transition-colors ${selectedTeams.includes(s.teamNumber) ? 'bg-blue-50' : 'bg-white'}`}
                             onClick={() => toggleTeamSelect(s.teamNumber)}
                           >
                               {/* Sticky Rank Cell */}
                               <td className={`px-4 py-3 font-mono text-gray-400 text-center sticky left-0 z-30 w-12 ${selectedTeams.includes(s.teamNumber) ? 'bg-blue-50' : 'bg-white'}`}>
                                 {idx + 1}
                               </td>

                               {/* Sticky Team Cell with Shadow */}
                               <td className={`px-4 py-3 font-bold text-gray-900 sticky left-12 z-30 w-24 border-r shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)] ${selectedTeams.includes(s.teamNumber) ? 'bg-blue-50' : 'bg-white'}`}>
                                 {s.teamNumber}
                                 {s.source === 'Hybrid' && <span className="ml-1 text-[9px] text-blue-500 bg-blue-100 px-1 rounded">API</span>}
                               </td>

                               {activeMetrics.map(m => (
                                   <td key={m.key} className={`px-4 py-3 font-medium ${m.key === 'avgOverall' ? 'text-ga-accent font-bold bg-blue-50/30' : 'text-gray-600'}`}>
                                       {s[m.key]}
                                   </td>
                               ))}
                           </tr>
                        ))}
                        {stats.length === 0 && (
                            <tr>
                                <td colSpan={METRICS.length + 2} className="p-8 text-center text-gray-400">
                                    No data available. Add matches or click "⚡ Mock".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
          )}
      </div>
    </div>
  );
};

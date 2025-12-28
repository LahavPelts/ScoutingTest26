import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScoutEntry, TeamStats, CageType } from '../types';
import { getEntries, importData } from '../services/storageService';
import { generateMockData } from '../services/mockData';
import { fetchEPAData, StatboticsTeamYear } from '../services/apiService';
import { ISRAEL_TEAMS, POINTS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';
import { 
    Box, AppBar, Toolbar, Typography, IconButton, Button, TextField, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Chip, Switch, FormControlLabel, InputAdornment, Grid, Card, CardContent, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import BoltIcon from '@mui/icons-material/Bolt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

interface DashboardProps {
  onBack: () => void;
}

const METRICS: { key: keyof TeamStats; label: string; color: string; group?: string }[] = [
  { key: 'avgOverall', label: 'Overall', color: '#1e3a8a', group: 'Summary' },
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
      if (!teamMap[e.teamNumber]) teamMap[e.teamNumber] = [];
      teamMap[e.teamNumber].push(e);
    });

    const calculatedStats: TeamStats[] = ISRAEL_TEAMS.map(team => {
      const matches = teamMap[team] || [];
      const count = matches.length;
      const teamEpa = epaData[team];

      let rawStats = { 
        auto: 0, teleop: 0, l4: 0, l3: 0, l2: 0, l1: 0, 
        proc: 0, net: 0, defSum: 0, defCount: 0, coralMade: 0, coralMissed: 0, algae: 0 
      };
      
      if (count > 0) {
        rawStats = matches.reduce((acc, m) => {
          const matchCoral = (m.auto.l4 + m.auto.l3 + m.auto.l2 + m.auto.l1) + (m.teleop.l4 + m.teleop.l3 + m.teleop.l2 + m.teleop.l1);
          const matchCoralMissed = m.auto.coralMissed + m.teleop.coralMissed;
          const matchAlgae = (m.auto.processor + m.auto.net) + (m.teleop.processor + m.teleop.net);
          const defRating = m.teleop.playedDefence ? m.endgame.defenceLevel : 0;
          const defPlayed = m.teleop.playedDefence ? 1 : 0;

          return {
            auto: acc.auto + (m.auto.l4 * POINTS.AUTO.L4) + (m.auto.l3 * POINTS.AUTO.L3) + (m.auto.l2 * POINTS.AUTO.L2) + (m.auto.l1 * POINTS.AUTO.L1) + (m.auto.processor * POINTS.AUTO.PROCESSOR) + (m.auto.net * POINTS.AUTO.NET) + (m.auto.passedLine ? POINTS.AUTO.PASSED_LINE : 0),
            teleop: acc.teleop + (m.teleop.l4 * POINTS.TELEOP.L4) + (m.teleop.l3 * POINTS.TELEOP.L3) + (m.teleop.l2 * POINTS.TELEOP.L2) + (m.teleop.l1 * POINTS.TELEOP.L1) + (m.teleop.processor * POINTS.TELEOP.PROCESSOR) + (m.teleop.net * POINTS.TELEOP.NET),
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
      const coralAccuracy = (rawStats.coralMade + rawStats.coralMissed) > 0 ? (rawStats.coralMade / (rawStats.coralMade + rawStats.coralMissed)) * 100 : 0;
      const avgDef = rawStats.defCount > 0 ? rawStats.defSum / rawStats.defCount : 0;

      let avgAuto = safeDiv(rawStats.auto);
      let avgTeleop = safeDiv(rawStats.teleop);
      let avgTotal = avgAuto + avgTeleop;

      if (useApiData && teamEpa) {
        avgAuto = (avgAuto * 2 + teamEpa.epa_auto) / 3;
        avgTeleop = (avgTeleop * 2 + teamEpa.epa_teleop) / 3;
        avgTotal = avgAuto + avgTeleop;
      }
      
      const overall = (avgAuto * 1.5) + avgTeleop + (safeDiv(rawStats.l4) * 5) + (avgDef * 2);

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
        source: useApiData && teamEpa ? 'Hybrid' : 'Local'
      };
    });

    return calculatedStats.filter(s => s.teamNumber.includes(searchTerm)).sort((a, b) => {
      const valA = (a[sortKey] as number) || 0;
      const valB = (b[sortKey] as number) || 0;
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [entries, useApiData, epaData, sortKey, sortDesc, searchTerm]);

  const activeMetrics = useMemo(() => {
    return visibleMetrics.size === 0 ? METRICS.filter(m => m.group === 'Summary' || m.key === 'avgOverall') : METRICS.filter(m => visibleMetrics.has(m.key));
  }, [visibleMetrics]);

  const toggleTeamSelect = (team: string) => {
    setSelectedTeams(prev => prev.includes(team) ? prev.filter(t => t !== team) : (prev.length < 8 ? [...prev, team] : prev));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importData(event.target?.result as string, 'json');
      window.location.reload();
    };
    reader.readAsText(file);
  };

  if (view === 'compare' && selectedTeams.length > 0) {
    const comparisonStats = stats.filter(s => selectedTeams.includes(s.teamNumber));
    const comparisonMetrics = METRICS.filter(m => ['avgOverall', 'avgTotalPoints', 'avgAutoPoints', 'avgCoral', 'avgAlgae', 'avgDefenceRating'].includes(m.key));

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="sticky" color="inherit" elevation={1}>
          <Toolbar>
            <IconButton onClick={() => setView('leaderboard')} edge="start" sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">Comparison</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2, overflowX: 'auto' }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Metric</TableCell>
                  {comparisonStats.map(s => (
                    <TableCell key={s.teamNumber} align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {s.teamNumber}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonMetrics.map(m => (
                  <TableRow key={m.key}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{m.label}</TableCell>
                    {comparisonStats.map(s => (
                      <TableCell key={s.teamNumber} align="center">
                        {s[m.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'rgba(0, 172, 193, 0.05)' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Max Level</TableCell>
                  {comparisonStats.map(s => {
                    let maxL = 'None';
                    if (s.avgL4 > 0.1) maxL = 'L4';
                    else if (s.avgL3 > 0.1) maxL = 'L3';
                    else if (s.avgL2 > 0.1) maxL = 'L2';
                    else if (s.avgL1 > 0.1) maxL = 'L1';
                    return <TableCell key={s.teamNumber} align="center"><Chip size="small" label={maxL} color="secondary" /></TableCell>
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
             {/* Added item prop back as it is required for layout props like xs in standard MUI Grid */}
             <Grid item xs={12}>
                <Card variant="outlined">
                   <CardContent sx={{ height: 400 }}>
                      <Typography variant="h6" gutterBottom>Performance Comparison</Typography>
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={comparisonStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="teamNumber" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="avgAutoPoints" name="Auto" fill="#1e3a8a" />
                            <Bar dataKey="avgTeleopPoints" name="Teleop" fill="#42A5F5" />
                         </BarChart>
                      </ResponsiveContainer>
                   </CardContent>
                </Card>
             </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  if (view === 'team_detail' && selectedTeams.length === 1) {
    const teamNum = selectedTeams[0];
    const stat = stats.find(s => s.teamNumber === teamNum);
    const teamEntries = entries.filter(e => e.teamNumber === teamNum).sort((a,b) => a.timestamp - b.timestamp);
    const chartData = teamEntries.map((e, idx) => ({ 
      match: `M${e.matchNumber}`, 
      score: (e.auto.l4 * POINTS.AUTO.L4 + e.teleop.l4 * POINTS.TELEOP.L4) 
    }));

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="sticky" color="inherit" elevation={1}>
          <Toolbar>
            <IconButton onClick={() => setView('leaderboard')} edge="start" sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">Team {teamNum}</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Added item prop back as it is required for layout props in standard MUI Grid */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Profile</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">OVERALL SCORE</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary">{stat?.avgOverall}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">ACCURACY</Typography>
                      <Typography variant="h4" fontWeight="bold" color="secondary">{stat?.avgCoralAccuracy}%</Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>Capability Checklist</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['avgL1', 'avgL2', 'avgL3', 'avgL4'].map(l => (
                      <Chip 
                        key={l} 
                        label={l.replace('avg', '')} 
                        variant={stat && (stat[l] as number) > 0.1 ? 'filled' : 'outlined'} 
                        color={stat && (stat[l] as number) > 0.1 ? 'primary' : 'default'}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Added item prop back as it is required for layout props in standard MUI Grid */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ height: 300 }}>
                  <Typography variant="h6" gutterBottom>Scoring Trend</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="match" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={1}>
         <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={onBack} edge="start" sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Leaderboard
                </Typography>
            </Box>
            <Box>
                 <IconButton onClick={() => fileInputRef.current?.click()} color="primary">
                   <UploadIcon />
                   <input type="file" ref={fileInputRef} hidden accept=".json" onChange={handleFileUpload} />
                 </IconButton>
                 <Button variant="outlined" size="small" startIcon={<BoltIcon />} onClick={generateMockData} color="warning" sx={{ ml: 1 }}>
                   Mock
                 </Button>
            </Box>
         </Toolbar>
         <Box sx={{ px: 2, pb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField 
                    size="small" 
                    fullWidth
                    placeholder="Search Team..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    }}
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
                <Button 
                  variant={view === 'analysis' ? 'contained' : 'outlined'} 
                  onClick={() => setView(view === 'analysis' ? 'leaderboard' : 'analysis')}
                >
                  Analysis
                </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {['Summary', 'Coral', 'Algae'].map(grp => (
                        <Chip 
                            key={grp} 
                            label={grp} 
                            size="small"
                            onClick={() => {
                                const groupMetrics = METRICS.filter(m => m.group === grp || m.key === 'avgOverall').map(m => m.key);
                                setVisibleMetrics(new Set(groupMetrics));
                            }} 
                            variant={visibleMetrics.has(METRICS.find(m => m.group === grp)?.key || '') ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>
                <FormControlLabel
                    control={<Switch size="small" checked={useApiData} onChange={(e) => setUseApiData(e.target.checked)} />}
                    label={<Typography variant="caption" fontWeight="bold">Statbotics</Typography>}
                />
            </Box>
         </Box>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {view === 'analysis' ? (
          <Box sx={{ p: 2, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="avgAutoPoints" name="Auto" unit="pts" />
                <YAxis type="number" dataKey="avgTeleopPoints" name="Teleop" unit="pts" />
                <ZAxis type="number" dataKey="avgOverall" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Teams" data={stats} fill="#1e3a8a" />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <TableContainer sx={{ height: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                  {activeMetrics.map(m => (
                    <TableCell 
                      key={m.key} 
                      align="right" 
                      onClick={() => { setSortKey(m.key); setSortDesc(!sortDesc); }}
                      sx={{ cursor: 'pointer', whiteSpace: 'nowrap', color: sortKey === m.key ? 'primary.main' : 'inherit' }}
                    >
                      {m.label} {sortKey === m.key && (sortDesc ? '↓' : '↑')}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map(s => (
                  <TableRow 
                    key={s.teamNumber} 
                    hover 
                    selected={selectedTeams.includes(s.teamNumber)}
                    onClick={() => toggleTeamSelect(s.teamNumber)}
                  >
                    <TableCell padding="checkbox">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: selectedTeams.includes(s.teamNumber) ? 'secondary.main' : 'transparent' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{s.teamNumber}</TableCell>
                    {activeMetrics.map(m => (
                      <TableCell key={m.key} align="right">{s[m.key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {selectedTeams.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<CompareArrowsIcon />}
            onClick={() => selectedTeams.length === 1 ? setView('team_detail') : setView('compare')}
            sx={{ borderRadius: 20, px: 3, boxShadow: 4 }}
          >
            {selectedTeams.length === 1 ? `View ${selectedTeams[0]}` : `Compare ${selectedTeams.length} Teams`}
          </Button>
          <Button 
            variant="contained" 
            color="inherit" 
            onClick={() => setSelectedTeams([])}
            sx={{ borderRadius: 20, minWidth: 0, px: 2, bgcolor: 'white', color: 'text.secondary' }}
          >
            Clear
          </Button>
        </Box>
      )}
    </Box>
  );
};
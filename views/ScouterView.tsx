import React, { useState } from 'react';
import { Box, Container, Fab, Chip, Tabs, Tab } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FormGenerator } from '../components/FormGenerator';
import { useScouting } from '../context/ScoutingContext';
import { saveEntry } from '../services/storageService';

interface ScouterViewProps {
  onBack: () => void;
}

export const ScouterView: React.FC<ScouterViewProps> = ({ onBack }) => {
  const [tab, setTab] = useState(0);
  const { matchData, resetForm } = useScouting();
  
  const sections: ('Match' | 'Auto' | 'Teleop' | 'Endgame')[] = ['Match', 'Auto', 'Teleop', 'Endgame'];

  const handleNext = () => {
    if (tab < sections.length - 1) {
      setTab(tab + 1);
    } else {
      // Submit
      saveEntry({ ...matchData, id: crypto.randomUUID(), timestamp: Date.now() });
      resetForm();
      onBack();
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', position: 'sticky', top: 0, zIndex: 5 }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          variant="scrollable" 
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          {sections.map(s => <Tab key={s} label={s} />)}
        </Tabs>
        <Box sx={{ p: 1, display: 'flex', gap: 1, bgcolor: 'action.hover' }}>
          <Chip size="small" label={`Match: ${matchData.matchNumber || '?'}`} variant="outlined" />
          <Chip size="small" label={`Team: ${matchData.teamNumber || '?'}`} color="primary" />
        </Box>
      </Box>

      <Container maxWidth="sm">
        <FormGenerator section={sections[tab]} />
      </Container>

      {/* Circle arrow fab as requested in Page 20 */}
      <Fab 
        color="secondary" 
        onClick={handleNext}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: 4
        }}
      >
        <ArrowForwardIcon />
      </Fab>
    </Box>
  );
};
import React, { useState } from 'react';
import { ScoutEntry, MatchType, Alliance, CageType } from '../types';
import { InfoPage } from './InfoPage';
import { AutoPage } from './AutoPage';
import { TeleopPage } from './TeleopPage';
import { EndgamePage } from './EndgamePage';
import { saveEntry } from '../services/storageService';
import { 
  Box, AppBar, Toolbar, Typography, IconButton, Chip, 
  Container, Fab, useTheme 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface FormWizardProps {
  onBack: () => void;
}

const INITIAL_DATA: ScoutEntry = {
  id: '',
  matchType: MatchType.QUALIFICATION,
  matchNumber: '',
  teamNumber: '',
  alliance: Alliance.RED,
  startPosition: null,
  timestamp: 0,
  auto: { 
    l4: 0, l3: 0, l2: 0, l1: 0, 
    coralMissed: 0,
    processor: 0, net: 0, 
    algaeMissed: 0,
    passedLine: false 
  },
  teleop: { 
    l4: 0, l3: 0, l2: 0, l1: 0, 
    coralMissed: 0,
    processor: 0, net: 0, 
    algaeMissed: 0,
    playedDefence: false 
  },
  endgame: { 
    defenceLevel: 0, 
    drivingLevel: 0, 
    scouterLevel: 0, 
    cage: CageType.NONE,
    disabled: false, 
    comments: '' 
  }
};

type Step = 'info' | 'auto' | 'teleop' | 'endgame';

export const FormWizard: React.FC<FormWizardProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('info');
  const [data, setData] = useState<ScoutEntry>(INITIAL_DATA);
  const theme = useTheme();

  const updateData = (updates: Partial<ScoutEntry>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    const finalEntry = { ...data, id: crypto.randomUUID(), timestamp: Date.now() };
    saveEntry(finalEntry);
    onBack();
  };

  // Nav Chip
  const NavChip = ({ target, label }: { target: Step, label: string }) => (
    <Chip 
        label={label}
        onClick={() => setStep(target)}
        disabled={step === 'info'} 
        color={step === target ? 'secondary' : 'default'}
        variant={step === target ? 'filled' : 'outlined'}
        sx={{ fontWeight: 'bold' }}
    />
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Chip 
                label={`M${data.matchNumber || '-'} | T${data.teamNumber || '-'}`} 
                color="primary" 
                size="small" 
                variant="outlined" 
                sx={{ fontWeight: 'bold' }}
             />
          </Box>
          <IconButton onClick={onBack} color="inherit">
            <CloseIcon />
          </IconButton>
        </Toolbar>
        {step !== 'info' && (
          <Box sx={{ display: 'flex', justifyContent: 'space-around', pb: 2, px: 1 }}>
            <NavChip target="auto" label="Auto" />
            <NavChip target="teleop" label="Teleop" />
            <NavChip target="endgame" label="Endgame" />
          </Box>
        )}
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, pt: 3, pb: 4 }}>
        {step === 'info' && (
          <InfoPage data={data} updateData={updateData} onNext={() => setStep('auto')} />
        )}
        {step === 'auto' && (
          <AutoPage data={data} updateData={updateData} />
        )}
        {step === 'teleop' && (
          <TeleopPage data={data} updateData={updateData} />
        )}
        {step === 'endgame' && (
          <EndgamePage data={data} updateData={updateData} onSubmit={handleSubmit} />
        )}
      </Container>

      {/* Floating Action Button for Next (only for Auto/Teleop) */}
      {(step === 'auto' || step === 'teleop') && (
         <Fab 
            color="secondary" 
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
            onClick={() => setStep(step === 'auto' ? 'teleop' : 'endgame')}
         >
            <NavigateNextIcon />
         </Fab>
      )}
    </Box>
  );
};
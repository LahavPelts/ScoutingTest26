import React from 'react';
import { ScoutEntry, EndgameData, CageType } from '../types';
import { StarRating } from '../components/StarRating';
import { 
  Box, Button, Typography, Card, CardContent, ToggleButton, 
  ToggleButtonGroup, TextField, Switch, FormControlLabel 
} from '@mui/material';

interface EndgamePageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
  onSubmit: () => void;
}

export const EndgamePage: React.FC<EndgamePageProps> = ({ data, updateData, onSubmit }) => {
  const updateEndgame = (key: keyof EndgameData, val: any) => {
    updateData({
      endgame: { ...data.endgame, [key]: val }
    });
  };

  const handleCageChange = (_: React.MouseEvent<HTMLElement>, newCage: CageType | null) => {
    if (newCage) updateEndgame('cage', newCage);
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Cage / Climb Selection */}
      <Card variant="outlined" sx={{ mb: 3, bgcolor: '#fff3e0', borderColor: '#ffcc80' }}>
        <CardContent>
            <Typography variant="subtitle2" color="warning.dark" gutterBottom fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                Cage / Climb
            </Typography>
            <ToggleButtonGroup
                value={data.endgame.cage}
                exclusive
                onChange={handleCageChange}
                fullWidth
                size="small"
                color="warning"
                sx={{ bgcolor: 'white' }}
            >
                <ToggleButton value={CageType.DEEP}>Deep</ToggleButton>
                <ToggleButton value={CageType.SHALLOW}>Shallow</ToggleButton>
                <ToggleButton value={CageType.PARK}>Park</ToggleButton>
                <ToggleButton value={CageType.NONE}>None</ToggleButton>
            </ToggleButtonGroup>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
        <StarRating 
            label="Defence Level" 
            value={data.endgame.defenceLevel} 
            onChange={(v) => updateEndgame('defenceLevel', v)} 
        />
        <StarRating 
            label="Driving Level" 
            value={data.endgame.drivingLevel} 
            onChange={(v) => updateEndgame('drivingLevel', v)} 
        />
        <StarRating 
            label="Scouter Level" 
            value={data.endgame.scouterLevel} 
            onChange={(v) => updateEndgame('scouterLevel', v)} 
        />
      </Card>

      {/* Disabled Toggle */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={data.endgame.disabled}
                        onChange={(e) => updateEndgame('disabled', e.target.checked)}
                        color="error"
                    />
                }
                label={<Typography fontWeight="bold">Robot Disabled?</Typography>}
            />
        </CardContent>
      </Card>

      <TextField
        label="Comments"
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        placeholder="Enter comments here..."
        value={data.endgame.comments}
        onChange={(e) => updateEndgame('comments', e.target.value)}
        sx={{ mb: 4, bgcolor: 'background.paper' }}
      />

      <Button 
        variant="contained" 
        color="secondary" 
        size="large" 
        fullWidth 
        onClick={onSubmit}
        sx={{ height: 56, fontSize: '1.1rem', fontWeight: 'bold' }}
      >
        SEND DATA
      </Button>
    </Box>
  );
};
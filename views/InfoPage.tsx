import { ScoutEntry, MatchType, Alliance } from '../types';
import { Input, Select } from '../components/Input';
import { FieldMap } from '../components/FieldMap';
import { ISRAEL_TEAMS } from '../constants';
import { 
  Box, Typography, ToggleButton, ToggleButtonGroup, 
  Autocomplete, TextField, Stack, Fab
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface InfoPageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
  onNext: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ data, updateData, onNext }) => {
  const handleMatchTypeChange = (_: React.MouseEvent<HTMLElement>, newType: MatchType | null) => {
    if (newType) updateData({ matchType: newType });
  };

  const handleAllianceChange = (_: React.MouseEvent<HTMLElement>, newAlliance: Alliance | null) => {
    if (newAlliance) updateData({ alliance: newAlliance });
  };

  return (
    <Stack spacing={3} sx={{ pb: 10 }}>
      <Typography variant="h6" color="primary" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
        Match Info
      </Typography>

      {/* Match Type and Number */}
      <Stack direction="row" spacing={2}>
        <Box sx={{ width: '40%' }}>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <ToggleButtonGroup
                value={data.matchType}
                exclusive
                onChange={handleMatchTypeChange}
                fullWidth
                size="small"
                color="primary"
            >
                <ToggleButton value={MatchType.QUALIFICATION}>Q</ToggleButton>
                <ToggleButton value={MatchType.PRACTICE}>P</ToggleButton>
                <ToggleButton value={MatchType.ALLIANCE}>A</ToggleButton>
            </ToggleButtonGroup>
        </Box>
        <Box sx={{ flex: 1 }}>
            <Input 
                label="Match Number"
                type="number" 
                value={data.matchNumber}
                onChange={(e) => updateData({ matchNumber: e.target.value })}
            />
        </Box>
      </Stack>

      {/* Team Number */}
      <Autocomplete
        freeSolo
        options={ISRAEL_TEAMS}
        value={data.teamNumber}
        onChange={(_, newValue) => updateData({ teamNumber: newValue || '' })}
        onInputChange={(_, newInputValue) => updateData({ teamNumber: newInputValue })}
        // Use any for params to bypass Ref type mismatch in the current environment
        renderInput={(params: any) => (
          <TextField 
            {...params} 
            label="Team Number" 
            variant="outlined" 
            fullWidth 
          />
        )}
      />

      {/* Alliance Toggle */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Alliance</Typography>
        <ToggleButtonGroup
            value={data.alliance}
            exclusive
            onChange={handleAllianceChange}
            fullWidth
            sx={{ height: 48 }}
        >
            <ToggleButton 
                value={Alliance.RED} 
                sx={{ 
                    color: 'error.main', 
                    '&.Mui-selected': { bgcolor: '#ffebee', color: '#d32f2f' } 
                }}
            >
                Red
            </ToggleButton>
            <ToggleButton 
                value={Alliance.BLUE} 
                sx={{ 
                    color: 'primary.main',
                    '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#1976d2' }
                }}
            >
                Blue
            </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Starting Position */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Starting Position</Typography>
        <FieldMap 
          selected={data.startPosition} 
          alliance={data.alliance === Alliance.RED ? 'Red' : 'Blue'}
          onChange={(pos) => updateData({ startPosition: pos })}
        />
      </Box>

      {/* Navigation FAB */}
      <Fab 
        color="secondary" 
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={onNext}
        disabled={!data.matchNumber || !data.teamNumber}
      >
        <NavigateNextIcon />
      </Fab>
    </Stack>
  );
};
import React from 'react';
import { Box, Typography, Switch, FormControlLabel, TextField, MenuItem, Stack } from '@mui/material';
import { GAME_CONFIG, FieldConfig } from '../config/gameConfig';
import { useScouting } from '../context/ScoutingContext';
import { DualCounter } from './DualCounter';
import { PositionSelector } from './PositionSelector';

interface FormGeneratorProps {
  section: 'Match' | 'Auto' | 'Teleop' | 'Endgame';
}

export const FormGenerator: React.FC<FormGeneratorProps> = ({ section }) => {
  const { matchData, updateByPath } = useScouting();
  const fields = GAME_CONFIG.filter(f => f.section === section);

  const getValue = (path: string) => {
    const parts = path.split('.');
    let current: any = matchData;
    for (const part of parts) {
      if (!current) return undefined;
      current = current[part];
    }
    return current;
  };

  const renderField = (field: FieldConfig) => {
    const val = getValue(field.path);

    switch (field.type) {
      case 'number':
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <DualCounter 
              label={field.label}
              made={val || 0}
              missed={0} // Config could be expanded to support linked misses
              onChangeMade={(v) => updateByPath(field.path, v)}
              onChangeMissed={() => {}} 
            />
          </Box>
        );
      case 'boolean':
        return (
          <FormControlLabel
            key={field.id}
            control={<Switch checked={!!val} onChange={(e) => updateByPath(field.path, e.target.checked)} />}
            label={field.label}
            sx={{ mb: 2, display: 'block' }}
          />
        );
      case 'select':
        return (
          <TextField
            key={field.id}
            select
            label={field.label}
            value={val || ''}
            onChange={(e) => updateByPath(field.path, e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          >
            {field.options?.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
        );
      case 'position':
        return (
          <Box key={field.id} sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              {field.label}
            </Typography>
            <PositionSelector value={val} onChange={(v) => updateByPath(field.path, v)} />
          </Box>
        );
      case 'text':
        return (
          <TextField
            key={field.id}
            label={field.label}
            value={val || ''}
            onChange={(e) => updateByPath(field.path, e.target.value)}
            multiline
            rows={4}
            fullWidth
            margin="normal"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" color="primary" sx={{ mb: 2, borderBottom: '2px solid', borderColor: 'primary.light', pb: 0.5 }}>
        {section}
      </Typography>
      <Stack spacing={1}>
        {fields.map(renderField)}
      </Stack>
    </Box>
  );
};
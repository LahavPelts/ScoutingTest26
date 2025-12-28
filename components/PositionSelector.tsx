import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { StartPosition } from '../types';

interface PositionSelectorProps {
  value: StartPosition | null;
  onChange: (val: StartPosition) => void;
}

const POSITIONS = [
  { key: StartPosition.UP, label: 'Up' },
  { key: StartPosition.MID_UP, label: 'Mid-Up' },
  { key: StartPosition.MID, label: 'Middle' },
  { key: StartPosition.MID_BOT, label: 'Mid-Bot' },
  { key: StartPosition.BOT, label: 'Bottom' }
];

export const PositionSelector: React.FC<PositionSelectorProps> = ({ value, onChange }) => {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', display: 'flex', flexDirection: 'column' }}>
        {POSITIONS.map((pos) => (
          <Box
            key={pos.key}
            onClick={() => onChange(pos.key)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              bgcolor: value === pos.key ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(33, 150, 243, 0.1)',
                '& .pos-label': { opacity: 1 }
              },
              '&:last-child': { borderBottom: 'none' }
            }}
          >
            <Typography 
              variant="caption" 
              className="pos-label"
              sx={{ 
                opacity: value === pos.key ? 1 : 0.4, 
                fontWeight: 'bold', 
                color: value === pos.key ? 'primary.main' : 'text.secondary' 
              }}
            >
              {pos.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
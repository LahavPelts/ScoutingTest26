import React from 'react';
import { Paper, IconButton, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface CounterProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

export const Counter: React.FC<CounterProps> = ({ label, value, onChange }) => {
  return (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 0.5, 
        bgcolor: 'background.paper',
        borderColor: 'primary.light',
        borderWidth: 1,
        borderRadius: 2
      }}
    >
      <Box 
        sx={{ 
          flexGrow: 1, 
          pl: 2, 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: 'primary.main', 
          borderRadius: 1.5,
          py: 1,
          boxShadow: 1
        }}
        onClick={() => onChange(value + 1)}
      >
        <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', ml: 'auto', mr: 2 }}>
          {value}
        </Typography>
      </Box>

      <IconButton 
        onClick={() => onChange(Math.max(0, value - 1))}
        color="primary"
        sx={{ ml: 1, border: '1px solid', borderColor: 'divider' }}
      >
        <RemoveIcon />
      </IconButton>
    </Paper>
  );
};
import React from 'react';
import { Box, Typography, IconButton, Paper, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface DualCounterProps {
  label: string;
  made: number;
  missed: number;
  onChangeMade: (val: number) => void;
  onChangeMissed: (val: number) => void;
}

export const DualCounter: React.FC<DualCounterProps> = ({ 
  label, 
  made, 
  missed, 
  onChangeMade, 
  onChangeMissed 
}) => {
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 1
      }}
    >
      <Box sx={{ bgcolor: 'action.hover', py: 0.25, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
          {label}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', height: 48 }}>
        {/* Success Section */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={() => onChangeMade(Math.max(0, made - 1))}
            sx={{ borderRadius: 0, height: '100%', width: 40 }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">{made}</Typography>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={() => onChangeMade(made + 1)}
            sx={{ borderRadius: 0, height: '100%', width: 44, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Miss Section */}
        <Box sx={{ width: '35%', display: 'flex', alignItems: 'center', bgcolor: 'error.light', color: 'white' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ lineHeight: 1, opacity: 0.8 }}>MISS</Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>{missed}</Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => onChangeMissed(missed + 1)}
            onContextMenu={(e) => {
                e.preventDefault();
                onChangeMissed(Math.max(0, missed - 1));
            }}
            sx={{ borderRadius: 0, height: '100%', width: 40, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};
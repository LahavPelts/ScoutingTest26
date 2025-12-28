import React from 'react';
import { Box, Typography } from '@mui/material';
import { StartPosition } from '../types';

interface FieldMapProps {
  selected: StartPosition | null;
  onChange: (pos: StartPosition) => void;
  alliance: 'Red' | 'Blue'; 
  imageUrl?: string;
}

const positions: { key: StartPosition; top: string; label: string }[] = [
  { key: StartPosition.UP, top: "0%", label: "Top" },
  { key: StartPosition.MID_UP, top: "20%", label: "Mid-Top" },
  { key: StartPosition.MID, top: "40%", label: "Middle" },
  { key: StartPosition.MID_BOT, top: "60%", label: "Mid-Bot" },
  { key: StartPosition.BOT, top: "80%", label: "Bottom" }
];

export const FieldMap: React.FC<FieldMapProps> = ({ 
  selected, 
  onChange, 
  imageUrl = "/field.png" 
}) => {
  return (
    <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto', mt: 1 }}>
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 1',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: `url(${imageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 1
        }}
      >
        {/* Overlay Grid */}
        {positions.map((p) => (
          <Box
            key={p.key}
            role="button"
            onClick={() => onChange(p.key)}
            sx={{
              position: 'absolute',
              left: 0,
              top: p.top,
              width: '100%',
              height: '20%',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: selected === p.key ? 'transparent' : 'rgba(33, 150, 243, 0.1)'
              }
            }}
          >
            {/* Selection Highlight */}
            {selected === p.key && (
              <Box 
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(33, 150, 243, 0.4)',
                  borderTop: '1px solid #2196f3',
                  borderBottom: '1px solid #2196f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                 <Typography 
                   variant="caption" 
                   sx={{ 
                     bgcolor: 'rgba(255,255,255,0.9)', 
                     color: 'primary.main', 
                     px: 1, 
                     borderRadius: 1, 
                     fontWeight: 'bold' 
                   }}
                 >
                   {p.label}
                 </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Typography align="center" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
        {selected ? `Selected: ${selected}` : "Select Starting Position"}
      </Typography>
    </Box>
  );
};
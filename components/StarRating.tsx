import React from 'react';
import { Typography, Box, Rating } from '@mui/material';

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ label, value, onChange, max = 5 }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography component="legend" variant="subtitle2" color="text.secondary" fontWeight="bold">
        {label}
      </Typography>
      <Rating
        name={label}
        value={value}
        max={max}
        onChange={(_, newValue) => {
          onChange(newValue || 0);
        }}
        size="large"
      />
    </Box>
  );
};
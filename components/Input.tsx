import React from 'react';
import { TextField, MenuItem, TextFieldProps } from '@mui/material';

type InputProps = TextFieldProps & { label?: string };

export const Input: React.FC<InputProps> = ({ label, sx, ...props }) => {
  return (
    <TextField 
      label={label} 
      variant="outlined" 
      fullWidth 
      sx={{ bgcolor: 'background.paper', ...sx }}
      {...props}
    />
  );
};

type SelectProps = TextFieldProps & {
  label?: string;
  options: { value: string | number; label: string }[];
};

export const Select: React.FC<SelectProps> = ({ label, options, sx, ...props }) => {
  return (
    <TextField 
      select
      label={label} 
      variant="outlined" 
      fullWidth 
      sx={{ bgcolor: 'background.paper', ...sx }}
      {...props}
    >
      {options.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
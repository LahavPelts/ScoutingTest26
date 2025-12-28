import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  sx,
  ...props 
}) => {
  let muiVariant: MuiButtonProps['variant'] = 'contained';
  let color: MuiButtonProps['color'] = 'primary';
  
  if (variant === 'secondary') {
    muiVariant = 'outlined';
    color = 'primary';
  } else if (variant === 'danger') {
    muiVariant = 'contained';
    color = 'error';
  } else if (variant === 'ghost') {
    muiVariant = 'text';
    color = 'inherit';
  }

  return (
    <MuiButton 
      variant={muiVariant} 
      color={color} 
      fullWidth={fullWidth}
      sx={{ 
        boxShadow: variant === 'primary' ? 2 : 0,
        ...sx 
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
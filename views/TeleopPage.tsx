import React from 'react';
import { ScoutEntry, TeleopData } from '../types';
import { DualCounter } from '../components/DualCounter';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';

interface TeleopPageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
}

export const TeleopPage: React.FC<TeleopPageProps> = ({ data, updateData }) => {
  const updateTeleop = (key: keyof TeleopData, val: any) => {
    updateData({
      teleop: { ...data.teleop, [key]: val }
    });
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Defense Toggle */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="subtitle1" fontWeight="bold">Played Defence</Typography>
            <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 1, p: 0.5, flex: 1, ml: 2, maxWidth: 160 }}>
                <Button 
                    fullWidth
                    size="small"
                    variant={data.teleop.playedDefence ? 'contained' : 'text'} 
                    color="secondary"
                    onClick={() => updateTeleop('playedDefence', true)}
                >
                    YES
                </Button>
                <Button 
                    fullWidth
                    size="small"
                    variant={!data.teleop.playedDefence ? 'contained' : 'text'} 
                    color="inherit"
                    sx={{ bgcolor: !data.teleop.playedDefence ? 'grey.600' : 'transparent', color: !data.teleop.playedDefence ? 'white' : 'inherit' }}
                    onClick={() => updateTeleop('playedDefence', false)}
                >
                    NO
                </Button>
            </Box>
        </CardContent>
      </Card>

      {/* Coral Section */}
      <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold" sx={{ textTransform: 'uppercase', ml: 1 }}>
              Coral Scoring
          </Typography>
          <Grid container spacing={1}>
              {/* Added item prop back as it is required for layout props like xs in standard MUI Grid */}
              <Grid item xs={12}>
                <DualCounter 
                  label="L4 Coral" 
                  made={data.teleop.l4} 
                  missed={data.teleop.coralMissed} 
                  onChangeMade={(v) => updateTeleop('l4', v)}
                  onChangeMissed={(v) => updateTeleop('coralMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="L3 Coral" 
                  made={data.teleop.l3} 
                  missed={data.teleop.coralMissed} 
                  onChangeMade={(v) => updateTeleop('l3', v)}
                  onChangeMissed={(v) => updateTeleop('coralMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="L2 Coral" 
                  made={data.teleop.l2} 
                  missed={data.teleop.coralMissed} 
                  onChangeMade={(v) => updateTeleop('l2', v)}
                  onChangeMissed={(v) => updateTeleop('coralMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="L1 Coral" 
                  made={data.teleop.l1} 
                  missed={data.teleop.coralMissed} 
                  onChangeMade={(v) => updateTeleop('l1', v)}
                  onChangeMissed={(v) => updateTeleop('coralMissed', v)}
                />
              </Grid>
          </Grid>
      </Box>

      {/* Algae Section */}
      <Box>
          <Typography variant="subtitle2" sx={{ color: 'secondary.main', textTransform: 'uppercase', ml: 1 }} gutterBottom fontWeight="bold">
              Algae Scoring
          </Typography>
          <Grid container spacing={1}>
              <Grid item xs={12}>
                <DualCounter 
                  label="Processor" 
                  made={data.teleop.processor} 
                  missed={data.teleop.algaeMissed} 
                  onChangeMade={(v) => updateTeleop('processor', v)}
                  onChangeMissed={(v) => updateTeleop('algaeMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="Net" 
                  made={data.teleop.net} 
                  missed={data.teleop.algaeMissed} 
                  onChangeMade={(v) => updateTeleop('net', v)}
                  onChangeMissed={(v) => updateTeleop('algaeMissed', v)}
                />
              </Grid>
          </Grid>
      </Box>
    </Box>
  );
};
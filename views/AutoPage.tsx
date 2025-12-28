import React from 'react';
import { ScoutEntry, AutoData } from '../types';
import { DualCounter } from '../components/DualCounter';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';

interface AutoPageProps {
  data: ScoutEntry;
  updateData: (updates: Partial<ScoutEntry>) => void;
}

export const AutoPage: React.FC<AutoPageProps> = ({ data, updateData }) => {
  const updateAuto = (key: keyof AutoData, val: any) => {
    updateData({
      auto: { ...data.auto, [key]: val }
    });
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Passed Line Toggle */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="subtitle1" fontWeight="bold">Passed Line</Typography>
            <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 1, p: 0.5 }}>
                <Button 
                    size="small"
                    variant={data.auto.passedLine ? 'contained' : 'text'} 
                    color={data.auto.passedLine ? 'secondary' : 'inherit'}
                    onClick={() => updateAuto('passedLine', true)}
                >
                    YES
                </Button>
                <Button 
                    size="small"
                    variant={!data.auto.passedLine ? 'contained' : 'text'} 
                    color="inherit"
                    sx={{ 
                      bgcolor: !data.auto.passedLine ? 'grey.600' : 'transparent', 
                      color: !data.auto.passedLine ? 'white' : 'inherit' 
                    }}
                    onClick={() => updateAuto('passedLine', false)}
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
                  made={data.auto.l4} 
                  missed={data.auto.coralMissed} 
                  onChangeMade={(v) => updateAuto('l4', v)}
                  onChangeMissed={(v) => updateAuto('coralMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="L3 Coral" 
                  made={data.auto.l3} 
                  missed={data.auto.coralMissed} 
                  onChangeMade={(v) => updateAuto('l3', v)}
                  onChangeMissed={(v) => updateAuto('coralMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="L2 Coral" 
                  made={data.auto.l2} 
                  missed={data.auto.coralMissed} 
                  onChangeMade={(v) => updateAuto('l2', v)}
                  onChangeMissed={(v) => updateAuto('coralMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="L1 Coral" 
                  made={data.auto.l1} 
                  missed={data.auto.coralMissed} 
                  onChangeMade={(v) => updateAuto('l1', v)}
                  onChangeMissed={(v) => updateAuto('coralMissed', v)}
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
                  made={data.auto.processor} 
                  missed={data.auto.algaeMissed} 
                  onChangeMade={(v) => updateAuto('processor', v)}
                  onChangeMissed={(v) => updateAuto('algaeMissed', v)}
                />
              </Grid>
              <Grid item xs={12}>
                <DualCounter 
                  label="Net" 
                  made={data.auto.net} 
                  missed={data.auto.algaeMissed} 
                  onChangeMade={(v) => updateAuto('net', v)}
                  onChangeMissed={(v) => updateAuto('algaeMissed', v)}
                />
              </Grid>
          </Grid>
      </Box>
    </Box>
  );
};
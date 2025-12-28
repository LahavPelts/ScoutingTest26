import React, { useState } from 'react';
import { 
  createTheme, ThemeProvider, CssBaseline, Box, Paper, Typography, 
  Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  IconButton, AppBar, Toolbar, Breadcrumbs, Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StorageIcon from '@mui/icons-material/Storage';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import { ScoutingProvider } from './context/ScoutingContext';
import { FormWizard } from './views/FormWizard';
import { Dashboard } from './views/Dashboard';
import { ScouterView } from './views/ScouterView';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e3a8a' },
    secondary: { main: '#00ACC1' },
    background: { default: '#F3F4F6' },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h4: { fontWeight: 700 },
  },
});

function App() {
  const [view, setView] = useState<'home' | 'scouter' | 'dashboard' | 'history' | 'data'>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const renderContent = () => {
    switch(view) {
      case 'scouter': return <ScouterView onBack={() => setView('home')} />;
      case 'dashboard': return <Dashboard onBack={() => setView('home')} />;
      default: return <HomeView setView={setView} />;
    }
  };

  return (
    <ScoutingProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static" color="inherit" elevation={1}>
            <Toolbar>
              <IconButton onClick={() => setMenuOpen(true)} edge="start" sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" onClick={() => setView('home')} sx={{ cursor: 'pointer' }}>
                  2230
                </Link>
                <Typography color="text.primary" sx={{ textTransform: 'capitalize' }}>{view}</Typography>
              </Breadcrumbs>
            </Toolbar>
          </AppBar>

          <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
            <Box sx={{ width: 250, p: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                General Angels 2230
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {[
                  { text: 'Scouter', icon: <AssignmentIcon />, view: 'scouter' },
                  { text: 'My Forms', icon: <HistoryIcon />, view: 'history' },
                  { text: 'Dashboard', icon: <AssessmentIcon />, view: 'dashboard' },
                  { text: 'Achievements', icon: <EmojiEventsIcon />, view: 'achievements' },
                  { text: 'Data Manager', icon: <StorageIcon />, view: 'data' },
                ].map((item) => (
                  /* Updated to MUI v5 recommended pattern: ListItem with disablePadding + ListItemButton */
                  <ListItem disablePadding key={item.text}>
                    <ListItemButton onClick={() => { setView(item.view as any); setMenuOpen(false); }}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>

          <Box sx={{ flex: 1 }}>
            {renderContent()}
          </Box>
        </Box>
      </ThemeProvider>
    </ScoutingProvider>
  );
}

const HomeView = ({ setView }: { setView: any }) => (
  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
    <Box sx={{ width: 120, height: 120, mb: 4, bgcolor: 'rgba(30,58,138,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <svg style={{ width: 60, height: 60, color: '#1e3a8a' }} fill="currentColor" viewBox="0 0 24 24">
         <path d="M12 2C12 2 15 8 18 8C21 8 22 10 22 12C22 16 19 19 19 19C19 19 18 16 15 16C12 16 12 12 12 12V2Z" />
         <path d="M12 2C12 2 9 8 6 8C3 8 2 10 2 12C2 16 5 19 5 19C5 19 6 16 9 16C12 16 12 12 12 12V2Z" opacity="0.7"/>
       </svg>
    </Box>
    <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">General Scouter</Typography>
    <Typography variant="subtitle1" color="secondary" sx={{ mb: 6, letterSpacing: 4 }}>TEAM 2230</Typography>
    
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%', maxWidth: 400 }}>
      <Button variant="contained" size="large" fullWidth onClick={() => setView('scouter')} sx={{ height: 100, fontSize: '1.2rem' }}>Scouter</Button>
      <Button variant="outlined" size="large" fullWidth onClick={() => setView('dashboard')} sx={{ height: 100, fontSize: '1.2rem' }}>Dashboard</Button>
    </Box>
  </Box>
);

export default App;
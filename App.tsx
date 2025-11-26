import React, { useState } from 'react';
import { FormWizard } from './views/FormWizard';
import { Dashboard } from './views/Dashboard';
import { Button } from './components/Button';

function App() {
  const [view, setView] = useState<'home' | 'form' | 'dashboard'>('home');

  if (view === 'form') {
    return <FormWizard onBack={() => setView('home')} />;
  }

  if (view === 'dashboard') {
    return <Dashboard onBack={() => setView('home')} />;
  }

  return (
    <div className="min-h-screen bg-ga-dark text-gray-900 font-sans w-full shadow-2xl overflow-hidden flex flex-col">
      
      {/* Container for Home View - Centered and constrained */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col border-x border-gray-200 shadow-xl">
        {/* Header */}
        <header className="p-6 pt-12 flex flex-col items-center justify-center bg-white border-b border-gray-200 shadow-sm">
           <div className="w-20 h-20 bg-ga-accent/10 rounded-full flex items-center justify-center mb-4 ring-2 ring-ga-accent ring-offset-4 ring-offset-white">
               {/* Simple Angel Wing Icon SVG */}
               <svg className="w-10 h-10 text-ga-accent" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2C12 2 15 8 18 8C21 8 22 10 22 12C22 16 19 19 19 19C19 19 18 16 15 16C12 16 12 12 12 12V2Z" />
                 <path d="M12 2C12 2 9 8 6 8C3 8 2 10 2 12C2 16 5 19 5 19C5 19 6 16 9 16C12 16 12 12 12 12V2Z" opacity="0.7"/>
               </svg>
           </div>
           <h1 className="text-3xl font-bold tracking-tight mb-1 text-gray-900">General Scouter</h1>
           <p className="text-ga-accent font-mono text-sm tracking-widest font-bold">TEAM 2230</p>
        </header>

        {/* Main Content */}
        <main className="p-6 flex-1 flex flex-col justify-center gap-6 bg-ga-dark/20">
          <Button 
            fullWidth 
            onClick={() => setView('form')}
            className="h-24 text-2xl shadow-blue-900/10 shadow-xl"
          >
            Fill Form
          </Button>
          
          <Button 
            fullWidth 
            variant="secondary"
            onClick={() => setView('dashboard')}
            className="h-24 text-2xl shadow-lg border-2 border-gray-200"
          >
            Dashboard
          </Button>
        </main>
        
        <footer className="p-4 text-center text-gray-400 text-xs bg-white">
           &copy; 2025 General Angels 2230
        </footer>
      </div>

    </div>
  );
}

export default App;
import React, { useState } from 'react';
import ParallelApp from './ParallelApp';
import UserInterface from './UserInterface';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Dashboard, Person } from '@mui/icons-material';

function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');

  return (
    <Box>
      {/* View Toggle - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3
        }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="user">
              <Person sx={{ mr: 1 }} />
              User
            </ToggleButton>
            <ToggleButton value="admin">
              <Dashboard sx={{ mr: 1 }} />
              Admin
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      
      {view === 'user' ? <UserInterface /> : <ParallelApp />}
    </Box>
  );
}

export default App;
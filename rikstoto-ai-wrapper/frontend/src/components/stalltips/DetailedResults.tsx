import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Collapse, 
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp
} from '@mui/icons-material';

export interface RaceResult {
  race: number;
  horseName: string;
  horseNumber: number;
  value: number;
  choice: number;
  isWinner: boolean;
}

interface DetailedResultsProps {
  results: RaceResult[];
  fullRaceData?: any[]; // Full race data from generated JSON
}

/**
 * DetailedResults component - Shows full race results with numbered avatars
 * Matches Figma design nodes 12:7602 & 12:12189
 */
export default function DetailedResults({ results, fullRaceData }: DetailedResultsProps) {
  const [open, setOpen] = useState(false);
  
  // Use full race data if available, otherwise fall back to simple results
  const displayData = fullRaceData ? fullRaceData.map((race, index) => {
    const winner = race.results?.find((h: any) => h.position === 1);
    const userPicks = race.results?.filter((h: any) => h.marked === "true");
    // Use hit field from backend to determine if we got this race correct
    const isWinner = race.hit !== undefined ? race.hit : userPicks?.some((h: any) => h.position === 1) || false;
    
    return {
      race: race.race,
      raceName: race.name || `V75-${race.race}`,
      horseName: race.winnerName || winner?.name || 'Ukjent vinner', // Prefer winnerName from backend
      horseNumber: race.winner || winner?.horse || 0, // Prefer winner number from backend
      driver: winner?.driver || '',
      odds: winner?.odds || race.winnerOdds || 0, // Include winnerOdds from backend
      distance: race.distance || 0,
      userPicks: userPicks?.map((h: any) => h.horse).join(', ') || '',
      isWinner: isWinner,
      value: results[index]?.value || 0 // Get value from results array
    };
  }) : results;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Header */}
      <Box 
        onClick={() => setOpen(!open)}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 1.5,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.02)'
          }
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Fullstendig resultat
        </Typography>
        <IconButton size="small">
          {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>
      
      {/* Content */}
      <Collapse in={open}>
        <List sx={{ p: 0 }}>
          {displayData.map((result: any, index) => (
            <ListItem
              key={result.race}
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: '#FAFAFA',
                mb: 0.5,
                borderRadius: '8px',
                border: '1px solid #E0E0E0'
              }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: result.isWinner ? '#4CAF50' : '#E0E0E0',
                    color: result.isWinner ? 'white' : '#333',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {result.horseNumber || result.race}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {result.raceName || `Løp ${result.race}`}
                      </Typography>
                      {result.distance > 0 && (
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {result.distance}m
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Vinner: {result.horseName}
                      </Typography>
                      {result.isWinner && (
                        <Box sx={{ 
                          bgcolor: '#4CAF50',
                          color: 'white',
                          px: 1,
                          py: 0.25,
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          TREFF!
                        </Box>
                      )}
                    </Box>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {result.driver && (
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        Kusk: {result.driver}
                      </Typography>
                    )}
                    {result.odds > 0 && (
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        Odds: {result.odds.toFixed(2)}
                      </Typography>
                    )}
                    {result.userPicks && (
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        Dine valg: {result.userPicks}
                      </Typography>
                    )}
                  </Box>
                }
              />
              
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: result.isWinner ? '#6B3EFF' : '#999',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              >
                Løp {result.race}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
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
}

/**
 * DetailedResults component - Shows full race results with numbered avatars
 * Matches Figma design nodes 12:7602 & 12:12189
 */
export default function DetailedResults({ results }: DetailedResultsProps) {
  const [open, setOpen] = useState(false);

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
          {results.map((result, index) => (
            <ListItem
              key={result.race}
              sx={{
                px: 2,
                py: 1,
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
                    bgcolor: result.isWinner ? '#FFD700' : '#E0E0E0',
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {result.horseNumber}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {result.horseName}
                    </Typography>
                    {result.isWinner && (
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: '#4CAF50' 
                      }} />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Verdi: {result.value.toLocaleString('nb-NO')} • Valg: {result.choice}
                  </Typography>
                }
              />
              
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: result.isWinner ? '#6B3EFF' : '#999',
                  color: 'white',
                  px: 1,
                  py: 0.25,
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              >
                {result.race}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
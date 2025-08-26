import React from 'react';
import { Box, Typography } from '@mui/material';

interface StalltipsHeaderProps {
  location?: string;
  datetime?: string;
}

/**
 * StalltipsHeader component - V75 Stalltips branding
 * Matches Figma design nodes 12:7458, 12:7459
 */
export default function StalltipsHeader({ 
  location = "Klosterskogen", 
  datetime = "lørdag 16:30" 
}: StalltipsHeaderProps) {
  return (
    <Box sx={{ 
      p: 2, 
      textAlign: 'center', 
      bgcolor: '#FFFFFF',
      borderBottom: '1px solid rgba(0,0,0,0.05)'
    }}>
      {/* V75 Stalltips Logo - Exact Figma styling */}
      <Typography 
        component="div"
        sx={{ 
          color: '#6B3EFF', 
          fontWeight: 700,
          fontSize: '22px',
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
          mb: 0.25,
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}
      >
        V75 <span style={{ fontWeight: 900, fontStyle: 'normal' }}>Stalltips</span>
      </Typography>
      
      {/* Location and time */}
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#4C4C4C', 
          fontSize: '14px',
          fontFamily: 'Roboto',
          fontWeight: 400
        }}
      >
        {location}, {datetime}
      </Typography>
    </Box>
  );
}
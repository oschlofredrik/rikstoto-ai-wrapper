import React from 'react';
import { Box, Typography } from '@mui/material';

interface PhoneEmulatorProps {
  children: React.ReactNode;
}

/**
 * PhoneEmulator component - iPhone 13 mini frame (375x812px)
 * Matches Figma design node 12:7455
 */
export default function PhoneEmulator({ children }: PhoneEmulatorProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 4
      }}
    >
      {/* iPhone 13 mini Frame - exact Figma dimensions */}
      <Box
        sx={{
          width: '375px',
          height: '812px',
          bgcolor: '#000000',
          borderRadius: '32px',
          padding: '8px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      >
        {/* Screen */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Status Bar with Notch */}
          <Box
            sx={{
              height: '42px',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* Time */}
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '14px',
                color: '#000',
                zIndex: 11
              }}
            >
              9:41
            </Typography>
            
            {/* Notch - exact dimensions from Figma */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: '50%', 
              transform: 'translateX(-50%)',
              width: '219px',
              height: '30px',
              bgcolor: 'black',
              borderRadius: '0 0 16px 16px',
              zIndex: 9
            }} />
            
            {/* Battery and signal icons */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', zIndex: 11 }}>
              {/* Signal bars */}
              <Box sx={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
                <Box sx={{ width: 3, height: 4, bgcolor: 'black', borderRadius: '1px' }} />
                <Box sx={{ width: 3, height: 6, bgcolor: 'black', borderRadius: '1px' }} />
                <Box sx={{ width: 3, height: 8, bgcolor: 'black', borderRadius: '1px' }} />
                <Box sx={{ width: 3, height: 10, bgcolor: 'black', borderRadius: '1px' }} />
              </Box>
              {/* WiFi icon */}
              <Box sx={{ ml: 0.5 }}>
                <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                  <path d="M7.5 10C8.32843 10 9 9.32843 9 8.5C9 7.67157 8.32843 7 7.5 7C6.67157 7 6 7.67157 6 8.5C6 9.32843 6.67157 10 7.5 10Z" fill="black"/>
                  <path d="M10.5 5.5C10.5 5.5 9.5 4.5 7.5 4.5C5.5 4.5 4.5 5.5 4.5 5.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12.5 3C12.5 3 10.5 1 7.5 1C4.5 1 2.5 3 2.5 3" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M14 0.5C14 0.5 11 -1.5 7.5 -1.5C4 -1.5 1 0.5 1 0.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Box>
              {/* Battery */}
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                <Box sx={{ 
                  width: 22, 
                  height: 11, 
                  border: '1.5px solid black', 
                  borderRadius: '2px',
                  position: 'relative',
                  p: '1px'
                }}>
                  <Box sx={{ 
                    width: '70%', 
                    height: '100%', 
                    bgcolor: 'black',
                    borderRadius: '1px'
                  }} />
                </Box>
                <Box sx={{ 
                  width: 1.5, 
                  height: 4, 
                  bgcolor: 'black', 
                  borderRadius: '0 1px 1px 0',
                  ml: '-1px'
                }} />
              </Box>
            </Box>
          </Box>
          
          {/* Content Area */}
          <Box
            sx={{
              height: 'calc(100% - 42px)',
              overflow: 'auto',
              position: 'relative',
              bgcolor: '#FFFFFF',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none'
            }}
          >
            {children}
          </Box>
        </Box>

        {/* Home Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '4px',
            bgcolor: '#333',
            borderRadius: '100px'
          }}
        />
      </Box>
    </Box>
  );
}
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { 
  Download,
  PhoneIphone
} from '@mui/icons-material';

interface AppDownloadCTAProps {
  onDownload?: () => void;
}

/**
 * AppDownloadCTA component - Bottom call-to-action for app download
 * Matches Figma design node 57:4568 (Frame 427319412)
 */
export default function AppDownloadCTA({ onDownload }: AppDownloadCTAProps) {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: 4,
      px: 2,
      borderTop: '1px solid #E0E0E0',
      bgcolor: '#FFFFFF'
    }}>
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#666', 
          mb: 2,
          fontWeight: 700,
          fontSize: '14px'
        }}
      >
        Har du ikke Stalltips-appen?
      </Typography>
      
      <Button
        variant="contained"
        startIcon={<PhoneIphone />}
        endIcon={<Download />}
        onClick={onDownload}
        sx={{
          bgcolor: '#7B3FF2',
          color: 'white',
          borderRadius: '24px',
          px: 4,
          py: 1.5,
          fontWeight: 'bold',
          fontSize: '14px',
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(123, 63, 242, 0.3)',
          '&:hover': {
            bgcolor: '#6A2FE0',
            boxShadow: '0 6px 16px rgba(123, 63, 242, 0.4)'
          }
        }}
      >
        Last den ned her!
      </Button>
    </Box>
  );
}
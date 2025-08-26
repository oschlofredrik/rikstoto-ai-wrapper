import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { 
  AutoAwesome,
  Replay
} from '@mui/icons-material';

interface SubscriptionCTAProps {
  subscriptionPrice?: number;
  onSubscribe?: () => void;
  onRepeatPurchase?: () => void;
}

/**
 * SubscriptionCTA component - Call-to-action buttons for subscription
 * Matches Figma design node 12:7590 (Frame 427319410)
 */
export default function SubscriptionCTA({ 
  subscriptionPrice = 198,
  onSubscribe,
  onRepeatPurchase
}: SubscriptionCTAProps) {
  return (
    <Box sx={{ mb: 3, px: 1 }}>
      {/* Question */}
      <Typography 
        variant="body1" 
        sx={{ 
          fontWeight: 700,
          fontSize: '14px',
          mb: 1.5,
          color: '#000000'
        }}
      >
        Vil du gjenta suksessen?
      </Typography>
      
      {/* Buttons */}
      <Stack spacing={1}>
        {/* Primary subscription button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<AutoAwesome />}
          onClick={onSubscribe}
          sx={{ 
            bgcolor: '#6B3EFF',
            color: 'white',
            height: '48px',
            px: 3,
            borderRadius: '24px',
            fontWeight: 600,
            fontSize: '15px',
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(107, 62, 255, 0.25)',
            '&:hover': {
              bgcolor: '#5A2FD0',
              boxShadow: '0 4px 12px rgba(107, 62, 255, 0.35)'
            },
            '& .MuiButton-startIcon': {
              mr: 0.75
            }
          }}
        >
          Start abonnement {subscriptionPrice} kr/uke
        </Button>
        
        {/* Secondary repeat purchase button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Replay />}
          onClick={onRepeatPurchase}
          sx={{ 
            height: '48px',
            px: 3,
            borderRadius: '24px',
            borderColor: '#DDD',
            borderWidth: '1.5px',
            color: '#333',
            fontWeight: 500,
            fontSize: '15px',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#6B3EFF',
              borderWidth: '1.5px',
              bgcolor: 'rgba(107, 62, 255, 0.04)'
            },
            '& .MuiButton-startIcon': {
              mr: 0.75
            }
          }}
        >
          Gjenta kjøp til {subscriptionPrice} kr
        </Button>
      </Stack>
    </Box>
  );
}
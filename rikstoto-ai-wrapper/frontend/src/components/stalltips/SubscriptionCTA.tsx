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
            bgcolor: '#7B3FF2',
            color: 'white',
            py: 1.5,
            px: 2,
            borderRadius: '24px',
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
          Start abonnement {subscriptionPrice} kr/uke
        </Button>
        
        {/* Secondary repeat purchase button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Replay />}
          onClick={onRepeatPurchase}
          sx={{ 
            py: 1.5,
            px: 2,
            borderRadius: '24px',
            borderColor: '#E0E0E0',
            color: '#333',
            fontWeight: 500,
            fontSize: '14px',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#7B3FF2',
              bgcolor: 'rgba(123, 63, 242, 0.04)'
            }
          }}
        >
          Gjenta kjøp til {subscriptionPrice} kr
        </Button>
      </Stack>
    </Box>
  );
}
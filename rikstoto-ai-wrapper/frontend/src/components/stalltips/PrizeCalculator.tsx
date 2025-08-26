import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Collapse, 
  IconButton, 
  Button,
  Stack,
  Divider
} from '@mui/material';
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp,
  Calculate
} from '@mui/icons-material';

interface PrizeCalculatorProps {
  prizes?: {
    sevenCorrect: { amount: number; count: number };
    sixCorrect: { amount: number; count: number };
    fiveCorrect: { amount: number; count: number };
  };
}

/**
 * PrizeCalculator component - Shows prize breakdown and calculations
 * Matches Figma design node 12:7594 (Frame 12155)
 */
export default function PrizeCalculator({ prizes }: PrizeCalculatorProps) {
  const [open, setOpen] = useState(false);

  const defaultPrizes = {
    sevenCorrect: { amount: 1234, count: 1 },
    sixCorrect: { amount: 123, count: 10 },
    fiveCorrect: { amount: 12, count: 20 }
  };

  const actualPrizes = prizes || defaultPrizes;

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
          Gevinnsutregning og premiekalkulator
        </Typography>
        <IconButton size="small">
          {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>
      
      {/* Content */}
      <Collapse in={open}>
        <Box sx={{ 
          p: 2, 
          bgcolor: '#FAFAFA', 
          borderRadius: '8px',
          border: '1px solid #E0E0E0'
        }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
            Din utregning:
          </Typography>
          
          <Stack spacing={1}>
            {/* 7 rette */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Utbetaling for 7 rette: {actualPrizes.sevenCorrect.amount} kr × {actualPrizes.sevenCorrect.count} = 
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {(actualPrizes.sevenCorrect.amount * actualPrizes.sevenCorrect.count).toLocaleString('nb-NO')} kr
              </Typography>
            </Box>
            
            {/* 6 rette */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Utbetaling for 6 rette: {actualPrizes.sixCorrect.amount} kr × {actualPrizes.sixCorrect.count} = 
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {(actualPrizes.sixCorrect.amount * actualPrizes.sixCorrect.count).toLocaleString('nb-NO')} kr
              </Typography>
            </Box>
            
            {/* 5 rette */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Utbetaling for 5 rette: {actualPrizes.fiveCorrect.amount} kr × {actualPrizes.fiveCorrect.count} = 
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {(actualPrizes.fiveCorrect.amount * actualPrizes.fiveCorrect.count).toLocaleString('nb-NO')} kr
              </Typography>
            </Box>
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Total gevinst:
            </Typography>
            <Typography variant="h6" sx={{ color: '#7B3FF2', fontWeight: 'bold' }}>
              {(
                actualPrizes.sevenCorrect.amount * actualPrizes.sevenCorrect.count +
                actualPrizes.sixCorrect.amount * actualPrizes.sixCorrect.count +
                actualPrizes.fiveCorrect.amount * actualPrizes.fiveCorrect.count
              ).toLocaleString('nb-NO')} kr
            </Typography>
          </Box>
          
          {/* Calculator button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<Calculate />}
            sx={{
              bgcolor: '#7B3FF2',
              borderRadius: '16px',
              py: 1,
              '&:hover': {
                bgcolor: '#6A2FE0'
              }
            }}
          >
            Premiekalkulator
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
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
    sevenCorrect?: { amount: number; winners?: number; count?: number };
    sixCorrect?: { amount: number; winners?: number; count?: number };
    fiveCorrect?: { amount: number; winners?: number; count?: number };
  };
  betDetails?: {
    rows?: number;
    totalCost?: number;
    costPerRow?: number;
  };
}

/**
 * PrizeCalculator component - Shows prize breakdown and calculations
 * Matches Figma design node 12:7594 (Frame 12155)
 */
export default function PrizeCalculator({ prizes, betDetails }: PrizeCalculatorProps) {
  const [open, setOpen] = useState(false);

  const defaultPrizes = {
    sevenCorrect: { amount: 1234, winners: 1 },
    sixCorrect: { amount: 123, winners: 10 },
    fiveCorrect: { amount: 12, winners: 20 }
  };

  const actualPrizes = prizes || defaultPrizes;
  const rows = betDetails?.rows || 1;
  const totalCost = betDetails?.totalCost || 198;

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
            {actualPrizes.sevenCorrect && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  7 rette: {actualPrizes.sevenCorrect.amount?.toLocaleString('nb-NO')} kr/rekke × {rows} rekker
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {((actualPrizes.sevenCorrect.amount || 0) * rows).toLocaleString('nb-NO')} kr
                </Typography>
              </Box>
            )}
            
            {/* 6 rette */}
            {actualPrizes.sixCorrect && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  6 rette: {actualPrizes.sixCorrect.amount?.toLocaleString('nb-NO')} kr/rekke × {rows} rekker
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {((actualPrizes.sixCorrect.amount || 0) * rows).toLocaleString('nb-NO')} kr
                </Typography>
              </Box>
            )}
            
            {/* 5 rette */}
            {actualPrizes.fiveCorrect && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  5 rette: {actualPrizes.fiveCorrect.amount?.toLocaleString('nb-NO')} kr/rekke × {rows} rekker
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {((actualPrizes.fiveCorrect.amount || 0) * rows).toLocaleString('nb-NO')} kr
                </Typography>
              </Box>
            )}
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Total gevinst:
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Innsats: {totalCost.toLocaleString('nb-NO')} kr ({rows} rekker)
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: '#6B3EFF', fontWeight: 'bold' }}>
                {(() => {
                  const sevenTotal = (actualPrizes.sevenCorrect?.amount || 0) * rows;
                  const sixTotal = (actualPrizes.sixCorrect?.amount || 0) * rows;
                  const fiveTotal = (actualPrizes.fiveCorrect?.amount || 0) * rows;
                  return (sevenTotal + sixTotal + fiveTotal).toLocaleString('nb-NO');
                })()} kr
              </Typography>
              {prizes && (
                <Typography variant="caption" sx={{ 
                  color: (() => {
                    const total = 
                      ((actualPrizes.sevenCorrect?.amount || 0) * rows) +
                      ((actualPrizes.sixCorrect?.amount || 0) * rows) +
                      ((actualPrizes.fiveCorrect?.amount || 0) * rows);
                    return total > totalCost ? '#4CAF50' : '#F44336';
                  })()
                }}>
                  ROI: {(() => {
                    const total = 
                      ((actualPrizes.sevenCorrect?.amount || 0) * rows) +
                      ((actualPrizes.sixCorrect?.amount || 0) * rows) +
                      ((actualPrizes.fiveCorrect?.amount || 0) * rows);
                    return Math.round((total / totalCost * 100) - 100);
                  })()}%
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Calculator button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<Calculate />}
            sx={{
              bgcolor: '#6B3EFF',
              borderRadius: '16px',
              py: 1,
              '&:hover': {
                bgcolor: '#5A2FD0'
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
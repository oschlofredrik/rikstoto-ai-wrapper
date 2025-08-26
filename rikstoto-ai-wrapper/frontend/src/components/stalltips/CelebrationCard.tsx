import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import confettiBg from '../../assets/images/confetti-group.png';
import horseGraphic from '../../assets/images/horse-graphic.svg';

interface CelebrationCardProps {
  amount: number;
  correctRaces: number;
  totalRaces: number;
}

/**
 * CelebrationCard component - Yellow celebration card with horse and confetti
 * Matches Figma design node 12:12787 (Frame 427319428)
 */
export default function CelebrationCard({ 
  amount, 
  correctRaces, 
  totalRaces 
}: CelebrationCardProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  return (
    <Box
      sx={{
        mx: 2,
        mb: 2,
        p: 4,
        bgcolor: '#FFF155', // Yellow from Figma
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        height: '280px', // Exact height from Figma
        animation: showAnimation ? 'celebrationPulse 0.5s ease-out' : 'none',
        '@keyframes celebrationPulse': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: 1 }
        }
      }}
    >
      {/* Confetti Pattern from Figma */}
      <Box sx={{
        position: 'absolute',
        top: '-40px',
        left: '-80px',
        right: '-80px',
        height: '300px',
        backgroundImage: `url(${confettiBg})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        opacity: 0.8,
        pointerEvents: 'none',
        animation: showAnimation ? 'confettiFloat 3s ease-in-out infinite' : 'none',
        '@keyframes confettiFloat': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-5px) rotate(1deg)' }
        }
      }} />


      {/* Horse Graphic from Figma */}
      <Box sx={{
        position: 'absolute',
        left: '-20px',
        bottom: '-30px',
        width: '200px',
        height: '200px',
        backgroundImage: `url(${horseGraphic})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        opacity: 0.8,
        transform: 'rotate(-5deg)',
        animation: showAnimation ? 'horseJump 2s ease-out' : 'none',
        '@keyframes horseJump': {
          '0%': { transform: 'translateY(50px) rotate(-5deg)' },
          '50%': { transform: 'translateY(-10px) rotate(0deg)' },
          '100%': { transform: 'translateY(0) rotate(-5deg)' }
        }
      }} />

      {/* Content */}
      <Stack spacing={2} sx={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        {/* Congratulations message */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#1A1A1A', 
            fontSize: '16px',
            fontWeight: 600,
            animation: showAnimation ? 'fadeInDown 0.6s ease-out' : 'none',
            '@keyframes fadeInDown': {
              '0%': { opacity: 0, transform: 'translateY(-20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          Gratulerer, du fikk {correctRaces} av {totalRaces} rette!
        </Typography>
        
        {/* Win amount */}
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#6B3EFF', // Exact purple from Figma
            fontWeight: 800,
            fontSize: '52px',
            textShadow: '0 2px 8px rgba(107, 62, 255, 0.15)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            animation: showAnimation ? 'fadeInUp 0.8s ease-out' : 'none',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          +{amount.toLocaleString('nb-NO').replace(',', ' ')} kr
        </Typography>
      </Stack>
    </Box>
  );
}
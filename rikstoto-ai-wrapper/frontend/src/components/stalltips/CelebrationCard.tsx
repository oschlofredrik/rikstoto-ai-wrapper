import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';

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
        mx: 1,
        mb: 2,
        p: 3,
        bgcolor: '#FFF155', // Yellow from Figma
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '264px', // Height from Figma
        animation: showAnimation ? 'celebrationPulse 0.5s ease-out' : 'none',
        '@keyframes celebrationPulse': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: 1 }
        }
      }}
    >
      {/* Confetti Pattern Overlay */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.15,
        background: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 15px,
            rgba(123, 63, 242, 0.1) 15px,
            rgba(123, 63, 242, 0.1) 30px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 15px,
            rgba(255, 0, 100, 0.1) 15px,
            rgba(255, 0, 100, 0.1) 30px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 20px,
            rgba(0, 150, 255, 0.1) 20px,
            rgba(0, 150, 255, 0.1) 40px
          )
        `,
        pointerEvents: 'none',
        animation: showAnimation ? 'confettiFloat 3s ease-in-out infinite' : 'none',
        '@keyframes confettiFloat': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-5px) rotate(2deg)' }
        }
      }} />

      {/* Scattered confetti pieces */}
      {showAnimation && Array.from({ length: 15 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${8 + (i % 3) * 4}px`,
            height: `${4 + (i % 2) * 2}px`,
            bgcolor: ['#7B3FF2', '#FF0064', '#00BFFF', '#FFD700'][i % 4],
            opacity: 0.3,
            left: `${5 + (i * 23) % 85}%`,
            top: `${10 + (i * 17) % 80}%`,
            transform: `rotate(${i * 25}deg)`,
            animation: `confettiFall ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            '@keyframes confettiFall': {
              '0%': { transform: `translateY(0) rotate(${i * 25}deg)`, opacity: 0 },
              '10%': { opacity: 0.3 },
              '90%': { opacity: 0.3 },
              '100%': { transform: `translateY(20px) rotate(${i * 25 + 180}deg)`, opacity: 0 }
            }
          }}
        />
      ))}

      {/* Horse Graphic SVG - positioned like in Figma */}
      <Box sx={{
        position: 'absolute',
        left: '-50px',
        bottom: '-50px',
        width: '250px',
        height: '250px',
        opacity: 0.15,
        transform: 'rotate(-10deg)',
        animation: showAnimation ? 'horseJump 2s ease-out' : 'none',
        '@keyframes horseJump': {
          '0%': { transform: 'translateY(50px) rotate(-10deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-5deg)' },
          '100%': { transform: 'translateY(0) rotate(-10deg)' }
        }
      }}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M60 150 Q50 140 55 130 T70 120 Q80 110 90 115 L95 100 Q100 95 105 100 L100 115 Q110 120 115 130 T110 145 L105 150 L100 145 L95 150 L90 145 L85 150 L80 145 L75 150 L70 145 Z M95 115 L93 90 Q92 85 88 83 L85 70 Q83 65 80 63 L78 60 Q77 58 78 56 L80 55 Q82 55 84 57 L86 60 Q88 62 90 65 L92 70 Q94 73 96 75 L98 80 Q99 85 98 90 L97 100 M70 120 Q65 115 60 115 T50 120 Q48 122 48 125 T50 130 Q52 132 55 132 T60 130 Q62 128 65 128 T70 130 M90 115 Q92 113 95 113 T100 115 Q102 117 102 120 T100 125 Q98 127 95 127 T90 125 Q88 123 88 120 T90 115"
            fill="#000000"
            opacity="0.5"
          />
          {/* Horse body */}
          <ellipse cx="75" cy="135" rx="20" ry="15" fill="#000000" opacity="0.5"/>
          {/* Horse legs in jumping position */}
          <path d="M65 135 L60 155 M65 135 L62 155 M85 135 L90 155 M85 135 L87 155" stroke="#000000" strokeWidth="3" opacity="0.5"/>
          {/* Tail */}
          <path d="M55 130 Q45 125 40 130 Q35 135 40 140 Q45 145 50 140" stroke="#000000" strokeWidth="2" fill="none" opacity="0.5"/>
        </svg>
      </Box>

      {/* Content */}
      <Stack spacing={2} sx={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        {/* Congratulations message */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#333', 
            fontSize: '14px',
            fontWeight: 500,
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
            color: '#7B3FF2', // Purple from Figma
            fontWeight: 'bold',
            fontSize: '42px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            animation: showAnimation ? 'fadeInUp 0.8s ease-out' : 'none',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          +{amount.toLocaleString('nb-NO')} kr
        </Typography>
      </Stack>
    </Box>
  );
}
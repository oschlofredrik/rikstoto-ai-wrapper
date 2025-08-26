import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import {
  PhoneEmulator,
  StalltipsHeader,
  CelebrationCard,
  RikstotoInnsiktCard,
  PrizeCalculator,
  DetailedResults,
  SubscriptionCTA,
  AppDownloadCTA,
  type RaceResult
} from './components/stalltips';

/**
 * MobileResultsView - Complete V75 Stalltips results experience
 * Implements the full Figma design with all layers and components
 */
export default function MobileResultsView() {
  // Mock data matching the Figma screenshot
  const betResult = {
    totalWon: 11497,
    correctRaces: 6,
    totalRaces: 7,
    prizeLevel: "6 av 7 rette"
  };

  const raceResults: RaceResult[] = [
    { race: 1, horseName: "Tangen Bork", horseNumber: 11, value: 53, choice: 1, isWinner: true },
    { race: 2, horseName: "One Moment in Time", horseNumber: 8, value: 456, choice: 5, isWinner: false },
    { race: 3, horseName: "Facethewine", horseNumber: 7, value: 3456, choice: 6, isWinner: false },
    { race: 4, horseName: "Chantecler", horseNumber: 3, value: 4775, choice: 2, isWinner: true },
    { race: 5, horseName: "Alm Kevin", horseNumber: 8, value: 7879, choice: 3, isWinner: true },
    { race: 6, horseName: "Chantecler", horseNumber: 7, value: 10847, choice: 1, isWinner: true },
    { race: 7, horseName: "Clodrique", horseNumber: 10, value: 11497, choice: 2, isWinner: false }
  ];

  // Race data for AI analysis
  const raceDataForAI = {
    betResult,
    raceResults,
    totalStake: 198,
    poolSize: 8900000,
    numberOfPlayers: 45892
  };

  const handleSubscribe = () => {
    console.log('Subscribe clicked');
    // Implement subscription logic
  };

  const handleRepeatPurchase = () => {
    console.log('Repeat purchase clicked');
    // Implement repeat purchase logic
  };

  const handleDownloadApp = () => {
    console.log('Download app clicked');
    window.open('https://apps.apple.com/no/app/rikstoto/id409632979', '_blank');
  };

  return (
    <PhoneEmulator>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF' }}>
        {/* Header with V75 Stalltips branding */}
        <StalltipsHeader 
          location="Klosterskogen" 
          datetime="lørdag 16:30" 
        />

        {/* Scrollable content area - Light purple background from Figma */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          bgcolor: '#F7F4FF', // Light purple from Figma node 12:7587
          pb: 2
        }}>
          {/* Yellow celebration card with confetti and horse */}
          <CelebrationCard
            amount={betResult.totalWon}
            correctRaces={betResult.correctRaces}
            totalRaces={betResult.totalRaces}
          />

          {/* CTA buttons section */}
          <SubscriptionCTA
            subscriptionPrice={198}
            onSubscribe={handleSubscribe}
            onRepeatPurchase={handleRepeatPurchase}
          />

          <Divider sx={{ mx: 2, mb: 2 }} />

          {/* Result summary */}
          <Box sx={{ px: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Resultat
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Du fikk <strong>{betResult.correctRaces} av {betResult.totalRaces} rette</strong> og vinner <strong>{betResult.totalWon.toLocaleString('nb-NO')} kr!</strong>
            </Typography>
          </Box>

          {/* AI-powered Rikstoto Innsikt section - THE KEY DIFFERENTIATOR */}
          <Box sx={{ px: 2 }}>
            <RikstotoInnsiktCard 
              raceData={raceDataForAI}
              defaultOpen={true}
            />
          </Box>

          {/* Prize calculator */}
          <Box sx={{ px: 2 }}>
            <PrizeCalculator
              prizes={{
                sevenCorrect: { amount: 1234, count: 1 },
                sixCorrect: { amount: 1437, count: 8 },
                fiveCorrect: { amount: 123, count: 15 }
              }}
            />
          </Box>

          {/* Detailed results */}
          <Box sx={{ px: 2 }}>
            <DetailedResults results={raceResults} />
          </Box>

          {/* App download CTA */}
          <AppDownloadCTA onDownload={handleDownloadApp} />
        </Box>
      </Box>
    </PhoneEmulator>
  );
}
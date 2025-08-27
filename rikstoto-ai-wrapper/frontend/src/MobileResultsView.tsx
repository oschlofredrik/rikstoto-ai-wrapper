import React, { useState, useCallback } from 'react';
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
import ControlPanel from './components/stalltips/ControlPanel';
import JsonGenerator from './components/JsonGenerator';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

// Default mock data
const DEFAULT_BET_RESULT = {
  totalWon: 11497,
  correctRaces: 6,
  totalRaces: 7,
  prizeLevel: "6 av 7 rette"
};

const DEFAULT_RACE_RESULTS: RaceResult[] = [
  { race: 1, horseName: "Tangen Bork", horseNumber: 11, value: 53, choice: 1, isWinner: true },
  { race: 2, horseName: "One Moment in Time", horseNumber: 8, value: 456, choice: 5, isWinner: false },
  { race: 3, horseName: "Facethewine", horseNumber: 7, value: 3456, choice: 6, isWinner: false },
  { race: 4, horseName: "Chantecler", horseNumber: 3, value: 4775, choice: 2, isWinner: true },
  { race: 5, horseName: "Alm Kevin", horseNumber: 8, value: 7879, choice: 3, isWinner: true },
  { race: 6, horseName: "Chantecler", horseNumber: 7, value: 10847, choice: 1, isWinner: true },
  { race: 7, horseName: "Clodrique", horseNumber: 10, value: 11497, choice: 2, isWinner: false }
];

/**
 * MobileResultsView - Complete V75 Stalltips results experience
 * Now with dynamic JSON generation and AI analysis integration
 */
export default function MobileResultsView() {
  // State management
  const [betResult, setBetResult] = useState(DEFAULT_BET_RESULT);
  const [raceResults, setRaceResults] = useState<RaceResult[]>(DEFAULT_RACE_RESULTS);
  const [raceDataForAI, setRaceDataForAI] = useState<any>(null);
  const [showJsonGenerator, setShowJsonGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisKey, setAiAnalysisKey] = useState(0); // Force re-render of AI component

  // Generate initial race data for AI
  const generateRaceDataForAI = useCallback((betRes: any, raceRes: RaceResult[]) => {
    return {
      betResult: betRes,
      raceResults: raceRes,
      totalStake: 198,
      poolSize: 8900000,
      numberOfPlayers: 45892,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Handle JSON generation
  const handleGenerateJson = () => {
    setShowJsonGenerator(true);
  };

  // Process generated JSON
  const handleJsonGenerated = async (jsonString: string) => {
    setIsGenerating(true);
    setShowJsonGenerator(false);
    
    try {
      const data = JSON.parse(jsonString);
      
      // Extract bet results from generated data
      let newBetResult = betResult;
      let newRaceResults = raceResults;
      
      // This depends on the structure of your generated JSON
      if (data.result) {
        const correctRaces = data.result.correct || 6;
        const totalRaces = 7;
        const totalWon = data.result.payout || Math.floor(Math.random() * 50000) + 1000;
        
        newBetResult = {
          totalWon,
          correctRaces,
          totalRaces,
          prizeLevel: `${correctRaces} av ${totalRaces} rette`
        };
        setBetResult(newBetResult);
      }
      
      // Extract race results if available
      if (data.races && Array.isArray(data.races)) {
        newRaceResults = data.races.slice(0, 7).map((race: any, index: number) => ({
          race: index + 1,
          horseName: race.winner?.name || `Hest ${index + 1}`,
          horseNumber: race.winner?.number || (index + 1),
          value: Math.floor(Math.random() * 10000) + 100,
          choice: Math.floor(Math.random() * 6) + 1,
          isWinner: race.hit || Math.random() > 0.3
        }));
        setRaceResults(newRaceResults);
      }
      
      // Update AI race data with the DISPLAY data, not the full generated JSON
      // This ensures AI analyzes what's shown in the UI
      const newRaceData = generateRaceDataForAI(newBetResult, newRaceResults);
      setRaceDataForAI(newRaceData);
      
      // Force AI component to re-analyze
      setAiAnalysisKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error processing generated JSON:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate AI analysis
  const handleRegenerateAnalysis = () => {
    setIsAnalyzing(true);
    // Update the key to force RikstotoInnsiktCard to re-render and fetch new analysis
    setAiAnalysisKey(prev => prev + 1);
    // The RikstotoInnsiktCard component will handle the actual API call
    setTimeout(() => setIsAnalyzing(false), 2000); // Estimate 2 seconds for analysis
  };

  // Reset to default data
  const handleReset = () => {
    setBetResult(DEFAULT_BET_RESULT);
    setRaceResults(DEFAULT_RACE_RESULTS);
    setRaceDataForAI(generateRaceDataForAI(DEFAULT_BET_RESULT, DEFAULT_RACE_RESULTS));
    setAiAnalysisKey(prev => prev + 1);
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

  // Initialize race data for AI on mount
  React.useEffect(() => {
    setRaceDataForAI(generateRaceDataForAI(betResult, raceResults));
  }, []);

  return (
    <>
      {/* Control Panel - Outside the phone emulator */}
      <ControlPanel
        onGenerateJson={handleGenerateJson}
        onRegenerateAnalysis={handleRegenerateAnalysis}
        onReset={handleReset}
        isGenerating={isGenerating}
        isAnalyzing={isAnalyzing}
      />

      {/* JSON Generator Dialog */}
      <JsonGenerator
        open={showJsonGenerator}
        onClose={() => setShowJsonGenerator(false)}
        onGenerated={handleJsonGenerated}
        apiUrl={API_URL}
      />

      {/* Phone Emulator with Results */}
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
                key={aiAnalysisKey} // Force re-render when key changes
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
    </>
  );
}
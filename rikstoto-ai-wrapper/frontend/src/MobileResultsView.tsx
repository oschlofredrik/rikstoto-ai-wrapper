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
import SystemPromptModal from './components/SystemPromptModal';
import axios from 'axios';
import { DEFAULT_SYSTEM_PROMPT, PROMPT_STORAGE_KEY } from './constants/systemPrompt';

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
  const [generatedJsonData, setGeneratedJsonData] = useState<any>(null); // Full JSON data for detailed views
  const [showJsonGenerator, setShowJsonGenerator] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisKey, setAiAnalysisKey] = useState(0); // Force re-render of AI component
  const [trackName, setTrackName] = useState("Klosterskogen");
  const [raceDateTime, setRaceDateTime] = useState("lørdag 16:30");
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('rikstoto_selected_model') || 'gpt-4o-mini';
  });
  
  // Load system prompt from localStorage or use default
  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    const savedPrompt = localStorage.getItem(PROMPT_STORAGE_KEY);
    return savedPrompt || DEFAULT_SYSTEM_PROMPT;
  });

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
      
      // Store full JSON for detailed components
      setGeneratedJsonData(data);
      
      // Update track and datetime if available
      if (data.track) {
        setTrackName(data.track);
      }
      if (data.raceDateTime) {
        // Format datetime nicely
        const date = new Date(data.raceDateTime);
        const dayNames = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
        const dayName = dayNames[date.getDay()];
        const time = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        setRaceDateTime(`${dayName} ${time}`);
      }
      
      // Extract result summary
      if (data.result) {
        const correctRaces = data.result.correctRaces || 0;
        const totalRaces = data.result.totalRaces || 7;
        // Use actual payout from backend - it will be 0 for less than 5 correct
        const totalWon = data.result.payout || 0;
        
        newBetResult = {
          totalWon,
          correctRaces,
          totalRaces,
          prizeLevel: data.result.prizeLevel || `${correctRaces} av ${totalRaces} rette`
        };
        setBetResult(newBetResult);
      }
      
      // Extract race results from the new structure
      if (data.raceResults && Array.isArray(data.raceResults)) {
        let runningTotal = 0;
        newRaceResults = data.raceResults.map((race: any, index: number) => {
          // Find the winning horse (position 1)
          const winner = race.results?.find((h: any) => h.position === 1);
          const marked = race.results?.filter((h: any) => h.marked === "true");
          // Use the hit field from backend - this tells us if we got this race correct
          const isWinner = race.hit !== undefined ? race.hit : marked?.some((h: any) => h.position === 1) || false;
          
          // Calculate cumulative value only for correct races
          if (isWinner && data.result?.payout) {
            // Distribute the total payout across winning races
            const payoutPerWin = Math.floor(data.result.payout / (data.result.correctRaces || 1));
            runningTotal += payoutPerWin;
          }
          
          return {
            race: race.race,
            horseName: race.winnerName || winner?.name || `Ukjent vinner`,
            horseNumber: winner?.horse || race.winner || 0,
            value: runningTotal, // Cumulative payout value
            choice: marked?.length || 1,
            isWinner: isWinner
          };
        });
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
    // Toggle forceRegenerate to trigger new analysis without cache
    setForceRegenerate(prev => !prev);
    // The RikstotoInnsiktCard component will handle the actual API call
    setTimeout(() => setIsAnalyzing(false), 2000); // Estimate 2 seconds for analysis
  };

  // Reset to default data
  const handleReset = () => {
    setBetResult(DEFAULT_BET_RESULT);
    setRaceResults(DEFAULT_RACE_RESULTS);
    setRaceDataForAI(generateRaceDataForAI(DEFAULT_BET_RESULT, DEFAULT_RACE_RESULTS));
    setGeneratedJsonData(null);
    setTrackName("Klosterskogen");
    setRaceDateTime("lørdag 16:30");
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

  const handleEditPrompt = () => {
    setShowPromptModal(true);
  };

  const handleSavePrompt = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
    // Save to localStorage for persistence
    localStorage.setItem(PROMPT_STORAGE_KEY, newPrompt);
    // Force re-analysis with new prompt
    setAiAnalysisKey(prev => prev + 1);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    // Save to localStorage for persistence
    localStorage.setItem('rikstoto_selected_model', model);
    // Force re-analysis with new model
    setForceRegenerate(prev => !prev);
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
        onEditPrompt={handleEditPrompt}
        onModelChange={handleModelChange}
        selectedModel={selectedModel}
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

      {/* System Prompt Editor Modal */}
      <SystemPromptModal
        open={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        currentPrompt={systemPrompt}
        onSave={handleSavePrompt}
      />

      {/* Phone Emulator with Results */}
      <PhoneEmulator>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF' }}>
          {/* Header with V75 Stalltips branding */}
          <StalltipsHeader 
            location={trackName} 
            datetime={raceDateTime} 
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
                Du fikk <strong>{betResult.correctRaces} av {betResult.totalRaces} rette</strong>
                {betResult.totalWon > 0 && (
                  <> og vinner <strong>{betResult.totalWon.toLocaleString('nb-NO')} kr!</strong></>
                )}
                {betResult.totalWon === 0 && betResult.correctRaces < 5 && (
                  <> - minimum 5 rette kreves for gevinst i V75.</>
                )}
              </Typography>
            </Box>

            {/* AI-powered Rikstoto Innsikt section - THE KEY DIFFERENTIATOR */}
            <Box sx={{ px: 2 }}>
              <RikstotoInnsiktCard 
                key={aiAnalysisKey} // Force re-render when key changes
                raceData={raceDataForAI}
                systemPrompt={systemPrompt}
                defaultOpen={true}
                modelName={selectedModel}
                forceRegenerate={forceRegenerate}
              />
            </Box>

            {/* Prize calculator */}
            <Box sx={{ px: 2 }}>
              <PrizeCalculator
                prizes={generatedJsonData?.prizes || {
                  sevenCorrect: { amount: 1234, winners: 1 },
                  sixCorrect: { amount: 1437, winners: 8 },
                  fiveCorrect: { amount: 123, winners: 15 }
                }}
                betDetails={generatedJsonData?.betDetails}
              />
            </Box>

            {/* Detailed results */}
            <Box sx={{ px: 2 }}>
              <DetailedResults 
                results={raceResults} 
                fullRaceData={generatedJsonData?.raceResults}
              />
            </Box>

            {/* App download CTA */}
            <AppDownloadCTA onDownload={handleDownloadApp} />
          </Box>
        </Box>
      </PhoneEmulator>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Collapse, 
  IconButton, 
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp, 
  Casino,
  AutoAwesome
} from '@mui/icons-material';
import axios from 'axios';

interface RikstotoInnsiktCardProps {
  raceData?: any;
  systemPrompt?: string;
  defaultOpen?: boolean;
  modelName?: string;
  forceRegenerate?: boolean;
}

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

/**
 * RikstotoInnsiktCard component - AI-powered race analysis
 * Matches Figma design node 12:7593 (Bong frame)
 * This is the key differentiator - integrates with backend AI analysis
 */
export default function RikstotoInnsiktCard({ 
  raceData,
  systemPrompt,
  defaultOpen = false,
  modelName = 'gpt-4o-mini',
  forceRegenerate = false
}: RikstotoInnsiktCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastRegenerate, setLastRegenerate] = useState(forceRegenerate);

  useEffect(() => {
    // Only generate analysis when explicitly requested via forceRegenerate
    if (raceData && forceRegenerate !== lastRegenerate) {
      setOpen(true); // Automatically open the card when generating analysis
      generateAIAnalysis(true); // Always skip cache when manually triggered
      setLastRegenerate(forceRegenerate);
    }
  }, [forceRegenerate]); // Trigger only on forceRegenerate change

  const generateAIAnalysis = async (skipCache = false) => {
    setLoading(true);
    // Clear any existing analysis to show loading state
    setAiAnalysis('');
    
    // Small delay to ensure UI updates and loading state is visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Prepare the race data with timestamp to avoid caching
      const dataToAnalyze = raceData || {
        results: "6 av 7 rette, vinnere: Tangen Bork, Chantecler, Alm Kevin, etc.",
        analysis: "Favorittene dominerte, men en outsider på løp 7 ødela for 7 rette."
      };
      
      // Use custom system prompt if provided, otherwise use default
      const promptToUse = systemPrompt || `Du er Rikstoto Innsikt, en ekspert på norsk travsport og hesteveddeløp. Du analyserer V75-resultater for spillere.

Spilldata:
{{json}}

Gi en kort analyse (maks 3-4 setninger) som fokuserer på:
- Hva som gikk bra med spillet (treff på outsidere, gode valg)
- Eventuelle bomvalg eller uflaks
- Ett konkret tips for neste gang

Vær positiv og konstruktiv. Bruk spillerens faktiske resultater fra dataene.`;
      
      // Replace {{json}} with actual data - use compact format to prevent truncation
      const jsonString = JSON.stringify(dataToAnalyze); // Compact, no indentation
      console.log('📦 Frontend JSON size:', jsonString.length, 'chars');
      const fullPrompt = promptToUse.replace('{{json}}', jsonString);
      
      // Use the existing backend AI endpoint - matching working implementation from UserInterface
      // Increase timeout for O3 models which have longer reasoning time
      const timeoutMs = modelName.includes('o3') ? 120000 : 30000; // 2 min for O3, 30s for others
      
      const response = await axios.post(`${API_URL}/generate`, {
        model_name: modelName,
        system_prompt: fullPrompt,
        user_prompt: "Analyser V75-resultatene",
        temperature: 0.7,
        max_length: 1000,  // Increased to allow for 200-350 word responses
        use_cache: !skipCache // Disable cache when regenerating
      }, {
        timeout: timeoutMs // Add timeout configuration
      });

      console.log('AI Response:', response.data); // Debug log
      console.log('Response text length:', response.data.generated_text?.length); // Check actual length
      console.log('Full response text:', response.data.generated_text); // Log full text to check for truncation
      
      // Ensure minimum loading time for better UX
      const startTime = Date.now();
      
      if (response.data.generated_text) {
        setAiAnalysis(response.data.generated_text);
        
        // Wait remaining time if response was too quick (minimum 1 second)
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1000;
        if (elapsedTime < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
        }
      } else if (response.data.error) {
        console.error('API error:', response.data.error);
        // Show error message instead of default analysis
        setAiAnalysis(`Feil ved analyse: ${response.data.error}\n\nPrøv igjen eller velg en annen modell.`);
      } else {
        // Fallback text if AI is not available
        console.log('No generated_text in response, using default');
        setAiAnalysis(getDefaultAnalysis());
      }
    } catch (error: any) {
      console.error('AI analysis error:', error);
      
      // More informative error handling
      if (error.response?.data?.detail) {
        setAiAnalysis(`Feil: ${error.response.data.detail}\n\nPrøv igjen eller velg en annen modell.`);
      } else if (error.message) {
        setAiAnalysis(`Nettverksfeil: ${error.message}\n\nSjekk at backend kjører og prøv igjen.`);
      } else {
        setAiAnalysis(getDefaultAnalysis());
      }
    } finally {
      // Small delay before removing loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoading(false);
    }
  };

  const getDefaultAnalysis = () => {
    return `Du spilte på Raven (1), en klar favoritt med 24 % vinnersjanse og odds 2,76. 2 av 2 tippetegn fikk du riktig i andre rekke, i den utbetaling, som forventet av en så tung spilt hest.

I samme løp leverte Slave to Queen Cal (8) en sterk avslutning. Med bare 4,2 % innsatsandel og odds 15,78, overrasket den mange og ga høy gevinst til dem som hadde den. Bra å ta med en outsider. Positive trender (+1,1) og solid tippeprosent tydet allerede før løpet på god form, som slå til.

En godt balansert bong, men med en outsider som Slave to Queen Cal ville utbetalingen vært betydelig høyere.`;
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Header - clickable area */}
      <Box 
        onClick={() => setOpen(!open)}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 1.75,
          px: 2,
          bgcolor: '#F8F8F8',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: '#EFEFEF'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Casino sx={{ fontSize: 20, color: '#6B3EFF' }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Rikstoto Innsikt
          </Typography>
          <Chip 
            label="AI" 
            size="small" 
            icon={<AutoAwesome sx={{ fontSize: 12 }} />}
            sx={{ 
              bgcolor: '#6B3EFF', 
              color: 'white',
              height: '22px',
              fontSize: '12px',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'white',
                ml: 0.5
              }
            }} 
          />
        </Box>
        <IconButton size="small">
          {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>
      
      {/* Content - expandable area */}
      <Collapse in={open}>
        <Box sx={{ 
          p: 2, 
          bgcolor: '#FAFAFA', 
          borderRadius: '0 0 8px 8px',
          borderLeft: '3px solid #6B3EFF',
          ml: 0.5,
          mr: 0.5
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={30} sx={{ color: '#6B3EFF' }} />
            </Box>
          ) : aiAnalysis ? (
            <>
              {aiAnalysis.split('\n\n').map((paragraph, index) => (
                <Typography 
                  key={index}
                  variant="body2" 
                  sx={{ 
                    color: '#666', 
                    mb: index < aiAnalysis.split('\n\n').length - 1 ? 1.5 : 0,
                    lineHeight: 1.6
                  }}
                >
                  {paragraph}
                </Typography>
              ))}
              
              {/* AI Insight Badge */}
              <Box sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AutoAwesome sx={{ fontSize: 14, color: '#6B3EFF' }} />
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Analyse generert av Rikstoto AI
                </Typography>
              </Box>
            </>
          ) : (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#999', 
                textAlign: 'center',
                py: 2,
                fontStyle: 'italic'
              }}
            >
              Klikk "Kjør AI-analyse" for å generere analyse
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
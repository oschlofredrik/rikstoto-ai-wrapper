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
  defaultOpen?: boolean;
}

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

/**
 * RikstotoInnsiktCard component - AI-powered race analysis
 * Matches Figma design node 12:7593 (Bong frame)
 * This is the key differentiator - integrates with backend AI analysis
 */
export default function RikstotoInnsiktCard({ 
  raceData,
  defaultOpen = true 
}: RikstotoInnsiktCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Re-generate analysis when component mounts or when explicitly requested
    if (raceData) {
      generateAIAnalysis();
    }
  }, []); // Empty dependency to only run on mount/key change
  
  useEffect(() => {
    if (open && !aiAnalysis && raceData) {
      generateAIAnalysis();
    }
  }, [open]);

  const generateAIAnalysis = async () => {
    setLoading(true);
    try {
      // Prepare the race data
      const dataToAnalyze = raceData || {
        results: "6 av 7 rette, vinnere: Tangen Bork, Chantecler, Alm Kevin, etc.",
        analysis: "Favorittene dominerte, men en outsider på løp 7 ødela for 7 rette."
      };
      
      // Create system prompt with JSON data embedded
      const systemPrompt = `Du er en ekspert på Rikstoto og hesteveddeløp. Analyser følgende V75-resultater og gi innsikt om hva som gikk bra og hva som kunne vært bedre. 
      
      Data: ${JSON.stringify(dataToAnalyze, null, 2)}
      
      Fokuser på:
      1. Hvorfor vinnerne vant (form, odds-bevegelse, etc)
      2. Hva spilleren gjorde riktig
      3. Tips for fremtidige spill
      
      Gi et kort og konkret svar på norsk.`;
      
      // Use the existing backend AI endpoint - matching working implementation
      const response = await axios.post(`${API_URL}/generate`, {
        model_name: 'gpt-4o-mini',
        system_prompt: systemPrompt,
        user_prompt: "Analyser disse V75-resultatene",
        temperature: 0.7,
        max_length: 500
      });

      if (response.data.generated_text) {
        setAiAnalysis(response.data.generated_text);
      } else {
        // Fallback text if AI is not available
        setAiAnalysis(getDefaultAnalysis());
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiAnalysis(getDefaultAnalysis());
    } finally {
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
          ) : (
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
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
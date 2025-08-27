import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import {
  Close,
  Save,
  RestoreOutlined,
  Psychology
} from '@mui/icons-material';

interface SystemPromptModalProps {
  open: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSave: (prompt: string) => void;
}

const DEFAULT_PROMPT = `Du er Rikstoto Innsikt, en ekspert på norsk travsport og hesteveddeløp. Du analyserer V75-resultater for spillere.

Spilldata:
{{json}}

Gi en kort analyse (maks 3-4 setninger) som fokuserer på:
- Hva som gikk bra med spillet (treff på outsidere, gode valg)
- Eventuelle bomvalg eller uflaks
- Ett konkret tips for neste gang

Vær positiv og konstruktiv. Bruk spillerens faktiske resultater fra dataene.`;

const PROMPT_EXAMPLES = [
  {
    name: "Kort analyse",
    prompt: `Du er en Rikstoto-ekspert. Analyser disse resultatene:

{{json}}

Gi en kort analyse (2-3 setninger) om hva som gikk bra og hva som kunne vært bedre.`
  },
  {
    name: "Detaljert analyse",
    prompt: `Du er en erfaren travekspert som analyserer V75-resultater.

Data:
{{json}}

Analyser:
1. Vinnerne og hvorfor de vant
2. Spillerens valg og strategi
3. Odds-bevegelser og overraskelser
4. Konkrete tips for fremtiden

Skriv en grundig men konsis analyse på norsk.`
  },
  {
    name: "Teknisk analyse",
    prompt: `Du er en dataanalytiker for hesteveddeløp.

{{json}}

Analyser statistisk:
- Treffsikkerhet vs forventet
- ROI på spillet
- Variansanalyse
- Optimale strategijusteringer

Vær teknisk og presis.`
  }
];

export default function SystemPromptModal({
  open,
  onClose,
  currentPrompt,
  onSave
}: SystemPromptModalProps) {
  const [prompt, setPrompt] = useState(currentPrompt);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    setPrompt(currentPrompt);
  }, [currentPrompt]);

  const handleSave = () => {
    onSave(prompt);
    onClose();
  };

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setShowExamples(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology sx={{ color: '#6B3EFF' }} />
          <Typography variant="h6">System Prompt Editor</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Bruk <Chip label="{{json}}" size="small" /> i prompten der du vil at spilldata skal settes inn
        </Alert>

        {/* Example prompts */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowExamples(!showExamples)}
            sx={{ mb: 1 }}
          >
            {showExamples ? 'Skjul eksempler' : 'Vis eksempel-prompts'}
          </Button>
          
          {showExamples && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {PROMPT_EXAMPLES.map(example => (
                <Chip
                  key={example.name}
                  label={example.name}
                  onClick={() => handleExampleClick(example.prompt)}
                  variant="outlined"
                  clickable
                  sx={{ 
                    '&:hover': { 
                      bgcolor: '#6B3EFF', 
                      color: 'white',
                      borderColor: '#6B3EFF'
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={12}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          label="System Prompt"
          variant="outlined"
          helperText={`${prompt.length} tegn - Prompten forteller AI-en hvordan den skal analysere spilldata`}
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '14px'
            }
          }}
        />

        {/* Preview */}
        <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
            FORHÅNDSVISNING (med eksempeldata):
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          >
            {prompt.replace('{{json}}', JSON.stringify({
              betResult: { totalWon: 11497, correctRaces: 6, totalRaces: 7 },
              raceResults: [
                { race: 1, horseName: "Tangen Bork", isWinner: true },
                { race: 2, horseName: "One Moment in Time", isWinner: false }
              ]
            }, null, 2).substring(0, 200) + '...')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button
          onClick={handleReset}
          startIcon={<RestoreOutlined />}
          color="inherit"
        >
          Reset til standard
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} color="inherit">
          Avbryt
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          sx={{
            bgcolor: '#6B3EFF',
            '&:hover': {
              bgcolor: '#5A2FD0'
            }
          }}
        >
          Lagre Prompt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
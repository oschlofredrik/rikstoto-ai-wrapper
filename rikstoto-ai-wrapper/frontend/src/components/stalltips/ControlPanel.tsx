import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Fab,
  Zoom,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Button
} from '@mui/material';
import {
  Casino,
  Refresh,
  RestartAlt,
  Settings,
  AutoAwesome,
  Code,
  Psychology,
  PlayArrow
} from '@mui/icons-material';

interface ControlPanelProps {
  onGenerateJson: () => void;
  onRegenerateAnalysis: () => void;
  onReset: () => void;
  onEditPrompt: () => void;
  onModelChange?: (model: string) => void;
  selectedModel?: string;
  isGenerating?: boolean;
  isAnalyzing?: boolean;
}

/**
 * ControlPanel component - Floating controls for JSON generation and AI analysis
 * Positioned outside the phone emulator for easy access
 */
export default function ControlPanel({
  onGenerateJson,
  onRegenerateAnalysis,
  onReset,
  onEditPrompt,
  onModelChange,
  selectedModel = 'gpt-4o-mini',
  isGenerating = false,
  isAnalyzing = false
}: ControlPanelProps) {
  const handleModelChange = (event: SelectChangeEvent<string>) => {
    if (onModelChange) {
      onModelChange(event.target.value);
    }
  };
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: '50%',
        left: 32,
        transform: 'translateY(-50%)',
        p: 2,
        borderRadius: '16px',
        bgcolor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        zIndex: 1200
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block',
          mb: 1.5,
          color: '#666',
          fontWeight: 600,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        Test Controls
      </Typography>
      
      <Stack direction="row" spacing={1}>
        <Tooltip title="Generate New JSON Data" arrow placement="top">
          <span>
            <Fab
              color="primary"
              size="medium"
              onClick={onGenerateJson}
              disabled={isGenerating}
              sx={{
                bgcolor: '#6B3EFF',
                '&:hover': {
                  bgcolor: '#5A2FD0'
                },
                '&.Mui-disabled': {
                  bgcolor: '#E0E0E0'
                }
              }}
            >
              {isGenerating ? (
                <Box
                  sx={{
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                >
                  <Code />
                </Box>
              ) : (
                <Code />
              )}
            </Fab>
          </span>
        </Tooltip>

        <Tooltip title="Reset to Default" arrow placement="top">
          <Fab
            size="medium"
            onClick={onReset}
            sx={{
              bgcolor: '#F5F5F5',
              color: '#666',
              '&:hover': {
                bgcolor: '#E0E0E0'
              }
            }}
          >
            <RestartAlt />
          </Fab>
        </Tooltip>

        <Tooltip title="Edit AI System Prompt" arrow placement="top">
          <Fab
            size="medium"
            onClick={onEditPrompt}
            sx={{
              bgcolor: '#9C27B0',
              color: 'white',
              '&:hover': {
                bgcolor: '#7B1FA2'
              }
            }}
          >
            <Psychology />
          </Fab>
        </Tooltip>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* AI Analysis Section */}
      <Box sx={{ width: '100%' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            mb: 1,
            color: '#666',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          AI Analyse
        </Typography>
        
        {/* Model Selector */}
        <Select
          value={selectedModel}
          onChange={handleModelChange}
          size="small"
          fullWidth
          sx={{
            fontSize: '12px',
            mb: 1.5,
            '& .MuiSelect-select': {
              py: 0.5,
              px: 1
            }
          }}
        >
          {/* GPT-4o Series - Most recommended */}
          <MenuItem value="gpt-4o-mini">GPT-4o Mini (Rask ⚡)</MenuItem>
          <MenuItem value="gpt-4o">GPT-4o (Beste 🏆)</MenuItem>
          
          {/* O-Series Reasoning Models - For complex analysis */}
          <MenuItem value="o1-mini">O1 Mini (Reasoning 🧠)</MenuItem>
          <MenuItem value="o1">O1 (Reasoning 📊)</MenuItem>
          <MenuItem value="o3-mini">O3 Mini (Reasoning 🎯)</MenuItem>
          <MenuItem value="o3">O3 (Avansert 🚀)</MenuItem>
        </Select>

        {/* Run Analysis Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={
            isAnalyzing ? (
              <Box
                sx={{
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              >
                <AutoAwesome />
              </Box>
            ) : (
              <PlayArrow />
            )
          }
          onClick={onRegenerateAnalysis}
          disabled={isAnalyzing || isGenerating}
          sx={{
            bgcolor: '#4CAF50',
            color: 'white',
            fontWeight: 600,
            py: 1.5,
            '&:hover': {
              bgcolor: '#45a049'
            },
            '&.Mui-disabled': {
              bgcolor: '#E0E0E0'
            }
          }}
        >
          {isAnalyzing ? 'Analyserer...' : 'Kjør AI-analyse'}
        </Button>

        {/* Status text */}
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            textAlign: 'center',
            mt: 1,
            color: isAnalyzing ? '#4CAF50' : '#999'
          }}
        >
          {isGenerating && 'Genererer JSON...'}
          {isAnalyzing && 'Analyserer med AI...'}
          {!isGenerating && !isAnalyzing && 'Klar'}
        </Typography>
      </Box>
    </Paper>
  );
}
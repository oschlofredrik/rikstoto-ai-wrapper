import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Fab,
  Zoom
} from '@mui/material';
import {
  Casino,
  Refresh,
  RestartAlt,
  Settings,
  AutoAwesome,
  Code,
  Psychology
} from '@mui/icons-material';

interface ControlPanelProps {
  onGenerateJson: () => void;
  onRegenerateAnalysis: () => void;
  onReset: () => void;
  onEditPrompt: () => void;
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
  isGenerating = false,
  isAnalyzing = false
}: ControlPanelProps) {
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 32,
        left: 32,
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

        <Tooltip title="Regenerate AI Analysis" arrow placement="top">
          <span>
            <Fab
              size="medium"
              onClick={onRegenerateAnalysis}
              disabled={isAnalyzing}
              sx={{
                bgcolor: '#FFF155',
                color: '#333',
                '&:hover': {
                  bgcolor: '#FFE933'
                },
                '&.Mui-disabled': {
                  bgcolor: '#E0E0E0'
                }
              }}
            >
              {isAnalyzing ? (
                <Box
                  sx={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 }
                    }
                  }}
                >
                  <AutoAwesome />
                </Box>
              ) : (
                <AutoAwesome />
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

      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: '1px solid #E0E0E0',
          justifyContent: 'center'
        }}
      >
        <Typography variant="caption" sx={{ color: '#999' }}>
          {isGenerating && 'Generating JSON...'}
          {isAnalyzing && 'Analyzing with AI...'}
          {!isGenerating && !isAnalyzing && 'Ready'}
        </Typography>
      </Stack>
    </Paper>
  );
}
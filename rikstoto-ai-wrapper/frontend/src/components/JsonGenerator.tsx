import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Stack,
  Slider,
  Divider
} from '@mui/material';
import {
  Casino,
  ContentCopy,
  Check,
  AutoAwesome
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface JsonGeneratorProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (json: string) => void;
  apiUrl: string;
}

interface GeneratorConfig {
  product: 'V75' | 'V64' | 'V5' | 'DD';
  scenario: 'favorites' | 'upsets' | 'mixed' | 'custom';
  track?: string;
  includeBettingDistribution: boolean;
  // Custom scenario settings
  desiredCorrect?: number;
  targetPayout?: number;
}

export default function JsonGenerator({ open, onClose, onGenerated, apiUrl }: JsonGeneratorProps) {
  const [config, setConfig] = useState<GeneratorConfig>({
    product: 'V75',
    scenario: 'mixed',
    includeBettingDistribution: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedJson, setGeneratedJson] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const tracks = [
    'Bjerke',           // Oslo - Nasjonalarena
    'Klosterskogen',    // Drammen
    'Jarlsberg',        // Tønsberg
    'Momarken',         // Mysen
    'Forus',            // Stavanger
    'Bergen Travpark',  // Bergen
    'Biri',             // Gjøvik
    'Sørlandet',        // Kristiansand
    'Harstad',          // Harstad
    'Bodø',             // Bodø
    'Varig Orkla Arena', // Orkdal
    'Voss',             // Voss
    'Nossum',           // Løten
    'Rissa',            // Rissa
  ];

  const presets = [
    { name: 'Favorittseier', scenario: 'favorites', description: 'Favoritter vinner mest', icon: '🏆' },
    { name: 'Overraskelser', scenario: 'upsets', description: 'Outsidere vinner', icon: '🎲' },
    { name: 'Realistisk', scenario: 'mixed', description: 'Balansert resultat', icon: '⚖️' },
    { name: 'Egendefinert', scenario: 'custom', description: 'Velg antall rette', icon: '⚙️' }
  ];

  const testPresets = [
    { name: 'Jackpot', desiredCorrect: 7, targetPayout: 1000000, color: '#FFD700' },
    { name: 'Nesten', desiredCorrect: 6, targetPayout: 10000, color: '#C0C0C0' },
    { name: 'Smågevinst', desiredCorrect: 5, targetPayout: 500, color: '#CD7F32' },
    { name: 'Tap', desiredCorrect: 2, targetPayout: 0, color: '#666' }
  ];

  // Get max correct races based on product
  const getMaxCorrect = () => {
    const maxMap: Record<string, number> = {
      'V75': 7, 'V64': 6, 'V5': 5, 'DD': 2
    };
    return maxMap[config.product] || 7;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${apiUrl}/api/generate-json`, {
        product: config.product,
        scenario: config.scenario,
        track: config.track || undefined,
        include_betting_distribution: config.includeBettingDistribution,
        desired_correct: config.desiredCorrect || undefined,
        force_win: config.targetPayout ? config.targetPayout > 0 : undefined,
        target_payout: config.targetPayout || undefined
      });
      
      setGeneratedJson(response.data);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate JSON');
    } finally {
      setLoading(false);
    }
  };

  const handleUseJson = () => {
    if (generatedJson) {
      onGenerated(JSON.stringify(generatedJson, null, 2));
      handleClose();
    }
  };

  const handleCopyJson = () => {
    if (generatedJson) {
      navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedJson(null);
    setShowPreview(false);
    setError('');
    onClose();
  };

  const handlePresetClick = (preset: any) => {
    setConfig(prev => ({
      ...prev,
      scenario: preset.scenario as any
    }));
  };

  const handleTestPreset = (preset: any) => {
    setConfig(prev => ({
      ...prev,
      scenario: 'custom',
      desiredCorrect: preset.desiredCorrect,
      targetPayout: preset.targetPayout
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Casino color="primary" />
          <Typography variant="h6">Generer Test JSON</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {!showPreview ? (
          <Stack spacing={3}>
            {/* Quick presets */}
            <Box>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Velg scenario
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {presets.map(preset => (
                  <Chip
                    key={preset.name}
                    icon={<Typography>{preset.icon}</Typography>}
                    label={preset.name}
                    onClick={() => handlePresetClick(preset)}
                    color={config.scenario === preset.scenario ? 'primary' : 'default'}
                    variant={config.scenario === preset.scenario ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>

            {/* Basic settings */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Produkt</InputLabel>
                <Select
                  value={config.product}
                  label="Produkt"
                  onChange={(e) => setConfig(prev => ({ ...prev, product: e.target.value as any }))}
                >
                  <MenuItem value="V75">V75 (7 løp)</MenuItem>
                  <MenuItem value="V64">V64 (6 løp)</MenuItem>
                  <MenuItem value="V5">V5 (5 løp)</MenuItem>
                  <MenuItem value="DD">DD (2 løp)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Bane</InputLabel>
                <Select
                  value={config.track || ''}
                  label="Bane"
                  onChange={(e) => setConfig(prev => ({ ...prev, track: e.target.value }))}
                >
                  <MenuItem value="">Tilfeldig</MenuItem>
                  {tracks.map(track => (
                    <MenuItem key={track} value={track}>{track}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Betting distribution toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={config.includeBettingDistribution}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    includeBettingDistribution: e.target.checked 
                  }))}
                />
              }
              label="Inkluder innsatsfordeling"
            />

            {/* Custom scenario controls */}
            {config.scenario === 'custom' && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Test-presets
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {testPresets.filter(p => p.desiredCorrect <= getMaxCorrect()).map(preset => (
                      <Chip
                        key={preset.name}
                        label={preset.name}
                        onClick={() => handleTestPreset(preset)}
                        sx={{ 
                          bgcolor: preset.color, 
                          color: 'white',
                          '&:hover': { bgcolor: preset.color, opacity: 0.8 }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography gutterBottom>
                    Antall rette: {config.desiredCorrect || 0} av {getMaxCorrect()}
                  </Typography>
                  <Slider
                    value={config.desiredCorrect || 0}
                    onChange={(_, v) => setConfig(prev => ({ ...prev, desiredCorrect: v as number }))}
                    min={0}
                    max={getMaxCorrect()}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Gevinst (kr)"
                  type="number"
                  value={config.targetPayout || ''}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    targetPayout: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  helperText="0 for tap, eller ønsket gevinstbeløp"
                />
              </>
            )}

            {error && (
              <Alert severity="error">{error}</Alert>
            )}
          </Stack>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">Generert JSON</Typography>
              <Button
                size="small"
                startIcon={copied ? <Check /> : <ContentCopy />}
                onClick={handleCopyJson}
                color={copied ? 'success' : 'default'}
              >
                {copied ? 'Kopiert!' : 'Kopier'}
              </Button>
            </Box>
            <Paper variant="outlined" sx={{ height: '400px' }}>
              <Editor
                height="400px"
                defaultLanguage="json"
                value={JSON.stringify(generatedJson, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false
                }}
                theme="vs-light"
              />
            </Paper>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {showPreview ? (
          <>
            <Button onClick={() => setShowPreview(false)}>
              Tilbake
            </Button>
            <Button onClick={handleUseJson} variant="contained" color="primary">
              Bruk JSON
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>
              Avbryt
            </Button>
            <Button 
              onClick={handleGenerate}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
            >
              {loading ? 'Genererer...' : 'Generer JSON'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
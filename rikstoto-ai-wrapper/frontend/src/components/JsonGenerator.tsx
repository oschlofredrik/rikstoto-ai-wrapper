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
  Tabs,
  Tab,
  Paper,
  Chip,
  Stack,
  Slider,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Casino,
  Refresh,
  ContentCopy,
  Save,
  Check,
  AutoAwesome,
  ExpandMore,
  EmojiEvents,
  AttachMoney,
  Settings
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
  product: 'V75' | 'V64' | 'V5' | 'DD' | 'Stalltips';
  scenario: 'favorites' | 'upsets' | 'mixed' | 'random' | 'custom';
  track?: string;
  includeStalltips: boolean;
  includeBettingDistribution: boolean;
  seed?: number;
  // User marking configuration
  desiredCorrect?: number;
  forceWin?: boolean;
  targetPayout?: number;
  // Economic parameters
  stake?: number;
  rows?: number;
  poolSize?: number;
  // Advanced marking
  markingStrategy?: 'single' | 'system' | 'banker';
  horsesPerRace?: number[];
  bankers?: number[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function JsonGenerator({ open, onClose, onGenerated, apiUrl }: JsonGeneratorProps) {
  const [config, setConfig] = useState<GeneratorConfig>({
    product: 'V75',
    scenario: 'mixed',
    includeStalltips: true,
    includeBettingDistribution: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedJson, setGeneratedJson] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  const tracks = [
    'Bjerke', 'Øvrevoll', 'Bergen', 'Forus', 'Leangen', 
    'Momarken', 'Harstad', 'Bodø', 'Klosterskogen', 'Jarlsberg'
  ];

  const presets = [
    { name: 'Favoritt-seier', scenario: 'favorites', description: 'Favoritter vinner mest' },
    { name: 'Outsider-fest', scenario: 'upsets', description: 'Mange overraskelser' },
    { name: 'Balansert', scenario: 'mixed', description: 'Realistisk mix' },
    { name: 'Tilfeldig', scenario: 'random', description: 'Helt tilfeldig' },
    { name: 'Egendefinert', scenario: 'custom', description: 'Velg selv resultat' }
  ];

  const advancedPresets = [
    { name: 'Jackpot', desiredCorrect: 7, forceWin: true, targetPayout: 1000000 },
    { name: 'Nesten-vinner', desiredCorrect: 6, forceWin: true, targetPayout: 50000 },
    { name: 'Smågevinst', desiredCorrect: 5, forceWin: true, targetPayout: 500 },
    { name: 'Tap', desiredCorrect: 3, forceWin: false, targetPayout: 0 }
  ];

  // Get max correct races based on product
  const getMaxCorrect = () => {
    const maxMap: Record<string, number> = {
      'V75': 7, 'V64': 6, 'V5': 5, 'DD': 2, 'Stalltips': 7
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
        include_stalltips: config.includeStalltips,
        include_betting_distribution: config.includeBettingDistribution,
        seed: config.seed || undefined,
        desired_correct: config.desiredCorrect || undefined,
        force_win: config.forceWin !== undefined ? config.forceWin : undefined,
        target_payout: config.targetPayout || undefined,
        stake: config.stake || undefined,
        rows: config.rows || undefined,
        pool_size: config.poolSize || undefined,
        marking_strategy: config.markingStrategy || undefined,
        horses_per_race: config.horsesPerRace || undefined,
        bankers: config.bankers || undefined
      });
      
      setGeneratedJson(response.data);
      setTabValue(1); // Switch to preview tab
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
    setTabValue(0);
    setError('');
    onClose();
  };

  const handlePresetClick = (preset: any) => {
    setConfig(prev => ({
      ...prev,
      scenario: preset.scenario as any
    }));
  };

  const handleAdvancedPreset = (preset: any) => {
    setConfig(prev => ({
      ...prev,
      scenario: 'custom',
      desiredCorrect: preset.desiredCorrect,
      forceWin: preset.forceWin,
      targetPayout: preset.targetPayout
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome />
        JSON Test Data Generator
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Konfigurasjon" />
          <Tab label="Forhåndsvisning" disabled={!generatedJson} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            {/* Quick Presets */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Hurtigvalg
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {presets.map(preset => (
                  <Chip
                    key={preset.name}
                    label={preset.name}
                    onClick={() => handlePresetClick(preset)}
                    color={config.scenario === preset.scenario ? 'primary' : 'default'}
                    variant={config.scenario === preset.scenario ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            {/* Product and Track Selection */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
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
                  <MenuItem value="Stalltips">Stalltips V75</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
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

            {/* Scenario and Seed */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Scenario</InputLabel>
                <Select
                  value={config.scenario}
                  label="Scenario"
                  onChange={(e) => setConfig(prev => ({ ...prev, scenario: e.target.value as any }))}
                >
                  <MenuItem value="favorites">Favoritter dominerer</MenuItem>
                  <MenuItem value="upsets">Mange overraskelser</MenuItem>
                  <MenuItem value="mixed">Balansert resultat</MenuItem>
                  <MenuItem value="random">Helt tilfeldig</MenuItem>
                  <MenuItem value="custom">Egendefinert resultat</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Seed (for reproduserbarhet)"
                type="number"
                value={config.seed || ''}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  seed: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                helperText="Samme seed gir samme resultat"
              />
            </Box>

            {/* Options */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Inkluder data
              </Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.includeStalltips}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        includeStalltips: e.target.checked 
                      }))}
                    />
                  }
                  label="Stalltips informasjon"
                />
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
                  label="Spillefordeling per løp"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Advanced Controls - Accordion Style */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents color="primary" />
                  Resultat-kontroll
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  {/* Desired correct races */}
                  {config.scenario === 'custom' && (
                    <>
                      <Box>
                        <Typography gutterBottom>
                          Ønsket antall rette: {config.desiredCorrect || 'Auto'}
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

                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.forceWin || false}
                            onChange={(e) => setConfig(prev => ({ ...prev, forceWin: e.target.checked }))}
                          />
                        }
                        label="Garantert gevinst"
                      />

                      {config.forceWin && (
                        <TextField
                          fullWidth
                          label="Målgevinst (kr)"
                          type="number"
                          value={config.targetPayout || ''}
                          onChange={(e) => setConfig(prev => ({ 
                            ...prev, 
                            targetPayout: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                        />
                      )}
                    </>
                  )}

                  {/* Quick presets for advanced scenarios */}
                  <Box>
                    <Typography variant="caption" gutterBottom display="block">
                      Test-scenarier
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {advancedPresets.map(preset => (
                        <Chip
                          key={preset.name}
                          label={preset.name}
                          onClick={() => handleAdvancedPreset(preset)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney color="primary" />
                  Økonomiske parametre
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Innsats (kr)"
                      type="number"
                      value={config.stake || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        stake: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                    <TextField
                      fullWidth
                      label="Antall rekker"
                      type="number"
                      value={config.rows || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        rows: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Pool-størrelse (kr)"
                    type="number"
                    value={config.poolSize || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      poolSize: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    helperText="Total omsetning i spillet"
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {error && (
              <Alert severity="error">{error}</Alert>
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {generatedJson && (
            <Paper variant="outlined" sx={{ height: '400px' }}>
              <Editor
                height="400px"
                defaultLanguage="json"
                value={JSON.stringify(generatedJson, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 12
                }}
                theme="vs-light"
              />
            </Paper>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        {generatedJson && (
          <Button
            startIcon={copied ? <Check /> : <ContentCopy />}
            onClick={handleCopyJson}
            color={copied ? 'success' : 'inherit'}
          >
            {copied ? 'Kopiert!' : 'Kopier JSON'}
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        <Button onClick={handleClose}>
          Avbryt
        </Button>
        
        {!generatedJson ? (
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Casino />}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Genererer...' : 'Generer JSON'}
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleUseJson}
            color="success"
          >
            Bruk denne JSON
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
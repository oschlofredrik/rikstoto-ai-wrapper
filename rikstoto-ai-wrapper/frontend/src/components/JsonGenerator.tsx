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
  Stack
} from '@mui/material';
import {
  Casino,
  Refresh,
  ContentCopy,
  Save,
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
  product: 'V75' | 'V64' | 'V5' | 'DD' | 'Stalltips';
  scenario: 'favorites' | 'upsets' | 'mixed' | 'random';
  track?: string;
  includeStalltips: boolean;
  includeBettingDistribution: boolean;
  seed?: number;
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
    { name: 'Tilfeldig', scenario: 'random', description: 'Helt tilfeldig' }
  ];

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
        seed: config.seed || undefined
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
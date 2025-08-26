import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Grid,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  PlayArrow,
  Settings,
  ContentCopy,
  CheckCircle,
  Error,
  Timer,
  Speed,
  Memory,
  Save,
  FolderOpen,
  Download,
  Upload,
  Delete,
  Code,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import testDataJson from './testData.json';
import JsonGenerator from './components/JsonGenerator';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

interface Model {
  name: string;
  display_name: string;
  description: string;
}

interface ModelConfig {
  name: string;
  enabled: boolean;
  system_prompt: string;
  temperature: number;
  max_length: number;
  top_p: number;
}

interface ModelResult {
  model_name: string;
  display_name: string;
  success: boolean;
  generated_text?: string;
  error?: string;
  generation_time: number;
  from_cache: boolean;
  parameters_used: any;
}

interface ModelDefaults {
  [key: string]: {
    system_prompt: string;
    temperature: number;
    max_length: number;
    top_p: number;
  };
}

function ParallelApp() {
  const [models, setModels] = useState<Model[]>([]);
  const [modelDefaults, setModelDefaults] = useState<ModelDefaults>({});
  const [modelConfigs, setModelConfigs] = useState<{ [key: string]: ModelConfig }>({});
  const [jsonInput, setJsonInput] = useState(JSON.stringify(testDataJson, null, 2));
  const [results, setResults] = useState<ModelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);
  const [configMenuAnchor, setConfigMenuAnchor] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  useEffect(() => {
    fetchModelsAndDefaults();
    loadSavedConfigsList();
  }, []);

  const loadSavedConfigsList = () => {
    const saved = localStorage.getItem('rikstoto_saved_configs');
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  };

  const fetchModelsAndDefaults = async () => {
    try {
      const [modelsRes, defaultsRes] = await Promise.all([
        axios.get(`${API_URL}/models`),
        axios.get(`${API_URL}/model-defaults`)
      ]);
      
      setModels(modelsRes.data);
      setModelDefaults(defaultsRes.data.defaults);
      
      // Check for last used config in localStorage
      const lastConfig = localStorage.getItem('rikstoto_last_config');
      
      if (lastConfig) {
        // Load saved config
        const saved = JSON.parse(lastConfig);
        setModelConfigs(saved);
      } else {
        // Initialize model configs with defaults
        const configs: { [key: string]: ModelConfig } = {};
        modelsRes.data.forEach((model: Model) => {
          const defaults = defaultsRes.data.defaults[model.name] || {};
          configs[model.name] = {
            name: model.name,
            enabled: true,
            system_prompt: defaults.system_prompt || '',
            temperature: defaults.temperature || 0.7,
            max_length: defaults.max_length || 500,
            top_p: defaults.top_p || 0.9
          };
        });
        setModelConfigs(configs);
      }
    } catch (err) {
      setError('Failed to fetch models and defaults');
    }
  };

  const handlePrepareJSON = async () => {
    try {
      const response = await axios.post(`${API_URL}/prepare-json`, {
        json_data: jsonInput,
        session_id: sessionId || undefined
      });
      if (response.data.session_id) {
        setSessionId(response.data.session_id);
      }
      return response.data.session_id;
    } catch (err) {
      console.error('Failed to prepare JSON:', err);
      return null;
    }
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      // Validate JSON first
      JSON.parse(jsonInput);
      
      // Prepare JSON and get session ID
      const sid = await handlePrepareJSON();
      
      // Prepare model configurations for API
      const modelConfigsList = Object.values(modelConfigs).map(config => ({
        name: config.name,
        enabled: config.enabled,
        system_prompt: config.system_prompt,
        temperature: config.temperature,
        max_length: config.max_length,
        top_p: config.top_p
      }));
      
      // Call parallel generation endpoint
      const response = await axios.post(`${API_URL}/generate-all`, {
        models: modelConfigsList,
        json_data: jsonInput,
        session_id: sid,
        use_cache: true
      });
      
      setResults(response.data.results);
      setTotalTime(response.data.total_time);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (modelName: string, field: keyof ModelConfig, value: any) => {
    const newConfigs = {
      ...modelConfigs,
      [modelName]: {
        ...modelConfigs[modelName],
        [field]: value
      }
    };
    setModelConfigs(newConfigs);
    // Auto-save to localStorage
    localStorage.setItem('rikstoto_last_config', JSON.stringify(newConfigs));
  };

  const resetToDefaults = (modelName: string) => {
    const defaults = modelDefaults[modelName];
    if (defaults) {
      setModelConfigs(prev => ({
        ...prev,
        [modelName]: {
          ...prev[modelName],
          ...defaults
        }
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const saveConfiguration = (name: string) => {
    const configToSave = {
      name: name,
      date: new Date().toISOString(),
      configs: modelConfigs
    };
    
    // Save named configuration
    localStorage.setItem(`rikstoto_config_${name}`, JSON.stringify(configToSave));
    
    // Update list of saved configs
    const updatedList = [...savedConfigs, name].filter((v, i, a) => a.indexOf(v) === i);
    localStorage.setItem('rikstoto_saved_configs', JSON.stringify(updatedList));
    setSavedConfigs(updatedList);
    
    // Also update last config
    localStorage.setItem('rikstoto_last_config', JSON.stringify(modelConfigs));
  };

  const loadConfiguration = (name: string) => {
    const saved = localStorage.getItem(`rikstoto_config_${name}`);
    if (saved) {
      const config = JSON.parse(saved);
      setModelConfigs(config.configs);
      localStorage.setItem('rikstoto_last_config', JSON.stringify(config.configs));
    }
  };

  const deleteConfiguration = (name: string) => {
    localStorage.removeItem(`rikstoto_config_${name}`);
    const updatedList = savedConfigs.filter(c => c !== name);
    localStorage.setItem('rikstoto_saved_configs', JSON.stringify(updatedList));
    setSavedConfigs(updatedList);
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(modelConfigs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `rikstoto-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          setModelConfigs(config);
          localStorage.setItem('rikstoto_last_config', JSON.stringify(config));
        } catch (error) {
          setError('Failed to import configuration');
        }
      };
      reader.readAsText(file);
    }
  };

  const enabledCount = Object.values(modelConfigs).filter(c => c.enabled).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        Rikstoto AI Model Evaluation Platform
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Compare {models.length} AI models simultaneously
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Left Panel: Controls and Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Control Panel
              </Typography>
              <Tooltip title="Generate Random JSON">
                <IconButton
                  color="secondary"
                  onClick={() => setGeneratorOpen(true)}
                  size="small"
                >
                  <Speed />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit JSON Data">
                <IconButton
                  color="primary"
                  onClick={() => setJsonModalOpen(true)}
                  size="small"
                >
                  <Code />
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleGenerateAll}
              disabled={loading || enabledCount === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? 'Generating...' : `Test ${enabledCount} Models`}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {totalTime > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Grid container spacing={1}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Time
                    </Typography>
                    <Typography variant="h6">
                      {totalTime.toFixed(2)}s
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="h6">
                      {results.length > 0 
                        ? `${results.filter(r => r.success).length}/${results.length}`
                        : '0/0'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Middle Panel: Model Configuration */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Model Configuration
              </Typography>
              <Box>
                <Tooltip title="Save/Load Configurations">
                  <IconButton
                    onClick={(e) => setConfigMenuAnchor(e.currentTarget)}
                    color="primary"
                  >
                    <Settings />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Menu
              anchorEl={configMenuAnchor}
              open={Boolean(configMenuAnchor)}
              onClose={() => setConfigMenuAnchor(null)}
            >
              <MenuItem onClick={() => {
                const name = window.prompt('Enter configuration name:');
                if (name) {
                  saveConfiguration(name);
                  setConfigMenuAnchor(null);
                }
              }}>
                <Save sx={{ mr: 1 }} /> Save Current Config
              </MenuItem>
              <Divider />
              {savedConfigs.length > 0 && (
                <>
                  <MenuItem disabled>
                    <Typography variant="caption">Saved Configurations</Typography>
                  </MenuItem>
                  {savedConfigs.map(config => (
                    <MenuItem key={config} onClick={() => {
                      loadConfiguration(config);
                      setConfigMenuAnchor(null);
                    }}>
                      <FolderOpen sx={{ mr: 1 }} /> {config}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete configuration "${config}"?`)) {
                            deleteConfiguration(config);
                          }
                        }}
                        sx={{ ml: 'auto' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </MenuItem>
                  ))}
                  <Divider />
                </>
              )}
              <MenuItem onClick={() => {
                exportConfiguration();
                setConfigMenuAnchor(null);
              }}>
                <Download sx={{ mr: 1 }} /> Export to File
              </MenuItem>
              <MenuItem component="label">
                <Upload sx={{ mr: 1 }} /> Import from File
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={(e) => {
                    importConfiguration(e);
                    setConfigMenuAnchor(null);
                  }}
                />
              </MenuItem>
            </Menu>
            
            {models.map((model, index) => (
              <Accordion key={model.name} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={modelConfigs[model.name]?.enabled || false}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleConfigChange(model.name, 'enabled', e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label=""
                      sx={{ mr: 1 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">
                        {model.display_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                    {results.find(r => r.model_name === model.name)?.success && (
                      <CheckCircle color="success" fontSize="small" />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      label="System Prompt (use {{json}} to insert data)"
                      value={modelConfigs[model.name]?.system_prompt || ''}
                      onChange={(e) => handleConfigChange(model.name, 'system_prompt', e.target.value)}
                      sx={{ mb: 2 }}
                      variant="outlined"
                      helperText="Write your prompt here. Use {{json}} where you want the V75 data inserted."
                    />
                    
                    <Typography variant="body2" gutterBottom>
                      Temperature: {modelConfigs[model.name]?.temperature || 0.7}
                    </Typography>
                    <Slider
                      value={modelConfigs[model.name]?.temperature || 0.7}
                      onChange={(_, value) => handleConfigChange(model.name, 'temperature', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" gutterBottom>
                      Max Length: {modelConfigs[model.name]?.max_length || 500}
                    </Typography>
                    <Slider
                      value={modelConfigs[model.name]?.max_length || 500}
                      onChange={(_, value) => handleConfigChange(model.name, 'max_length', value)}
                      min={100}
                      max={1500}
                      step={50}
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      size="small"
                      onClick={() => resetToDefaults(model.name)}
                      startIcon={<Settings />}
                    >
                      Reset to Defaults
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Right Panel: Results */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            
            {results.length === 0 && !loading && (
              <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                Results will appear here after generation
              </Typography>
            )}
            
            {loading && (
              <Box sx={{ mt: 4 }}>
                <LinearProgress />
                <Typography align="center" sx={{ mt: 2 }}>
                  Running {enabledCount} models in parallel...
                </Typography>
              </Box>
            )}
            
            {results.map((result) => (
              <Card key={result.model_name} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {result.display_name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {result.from_cache && (
                        <Chip label="Cached" size="small" color="info" />
                      )}
                      <Chip 
                        label={`${result.generation_time.toFixed(2)}s`}
                        size="small"
                        icon={<Timer />}
                      />
                      {result.success ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Error color="error" />
                      )}
                    </Box>
                  </Box>
                  
                  {result.success ? (
                    <>
                      <Box sx={{ 
                        maxHeight: 200, 
                        overflow: 'auto', 
                        bgcolor: 'background.default', 
                        p: 1, 
                        borderRadius: 1,
                        mb: 1
                      }}>
                        <Typography variant="body2" component="div">
                          <ReactMarkdown>{result.generated_text || ''}</ReactMarkdown>
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(result.generated_text || '')}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {result.error}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* JSON Data Modal */}
      <Dialog
        open={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Edit V75 JSON Data
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Editor
              height="500px"
              defaultLanguage="json"
              value={jsonInput}
              onChange={(value) => setJsonInput(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                formatOnPaste: true,
                formatOnType: true,
                automaticLayout: true
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJsonModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => setJsonModalOpen(false)}
            variant="contained"
            color="primary"
          >
            Save & Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* JSON Generator Modal */}
      <JsonGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onGenerated={(json) => {
          setJsonInput(json);
          setGeneratorOpen(false);
        }}
        apiUrl={API_URL}
      />
    </Container>
  );
}

export default ParallelApp;
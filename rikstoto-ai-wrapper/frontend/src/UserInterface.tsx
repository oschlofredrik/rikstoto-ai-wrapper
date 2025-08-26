import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  IconButton,
  Fade,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  Alert,
  Collapse,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Send,
  Casino,
  AutoAwesome,
  Settings,
  Menu as MenuIcon,
  Dashboard,
  Analytics,
  History,
  Help,
  AccountCircle,
  Lightbulb,
  Psychology,
  SmartToy
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import JsonGenerator from './components/JsonGenerator';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

interface AIResponse {
  model_name: string;
  display_name: string;
  generated_text: string;
  generation_time: number;
  from_cache: boolean;
}

export default function UserInterface() {
  const [userPrompt, setUserPrompt] = useState('');
  const [raceData, setRaceData] = useState<any>(null);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const samplePrompts = [
    { text: "Analyser V75-løpene og gi meg dine beste tips", icon: <Analytics /> },
    { text: "Hvilke hester har best form i dagens løp?", icon: <Psychology /> },
    { text: "Lag en spillestrategi basert på oddsbevegelser", icon: <Lightbulb /> },
    { text: "Finn de beste bankerne for dagens omgang", icon: <Casino /> }
  ];

  const handleSubmit = async () => {
    if (!userPrompt.trim()) return;

    setLoading(true);
    setError('');
    setResponses([]);

    try {
      // First, prepare the race data if needed
      if (!raceData) {
        // Load default race data or generate new
        const defaultData = await import('./testData.json');
        setRaceData(defaultData);
      }

      // Prepare the prompt with race data
      const systemPrompt = `Du er en ekspert på norsk hesteveddeløp. Analyser følgende V75-data og svar på brukerens spørsmål:

{{json}}

Gi konkrete, innsiktsfulle svar basert på dataene.`;

      const fullPrompt = systemPrompt.replace('{{json}}', JSON.stringify(raceData, null, 2));

      // Call the API
      const response = await axios.post(`${API_URL}/generate`, {
        model_name: selectedModel,
        system_prompt: fullPrompt,
        user_prompt: userPrompt,
        temperature: 0.7,
        max_length: 1000
      });

      setResponses([response.data]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kunne ikke generere svar');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'Dagens løp', icon: <Dashboard />, onClick: () => {} },
    { text: 'Mine spill', icon: <History />, onClick: () => {} },
    { text: 'Statistikk', icon: <Analytics />, onClick: () => {} },
    { text: 'Innstillinger', icon: <Settings />, onClick: () => setShowAdvanced(!showAdvanced) },
    { text: 'Hjelp', icon: <Help />, onClick: () => {} }
  ];

  return (
    <>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1e3a5f' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Casino sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rikstoto AI Assistent
          </Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                color="default"
              />
            }
            label="Avansert"
            sx={{ color: 'white' }}
          />
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ p: 2, bgcolor: '#1e3a5f', color: 'white' }}>
            <Typography variant="h6">Meny</Typography>
          </Box>
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => {
                  item.onClick();
                  setDrawerOpen(false);
                }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SmartToy sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Din personlige veddeløpsrådgiver
              </Typography>
              <Typography variant="body1">
                Få ekspertanalyse av dagens løp med avansert AI-teknologi
              </Typography>
            </Box>
          </Box>

          {/* Sample Prompts */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              Prøv disse:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {samplePrompts.map((prompt, index) => (
                <Chip
                  key={index}
                  icon={prompt.icon}
                  label={prompt.text}
                  onClick={() => setUserPrompt(prompt.text)}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Input Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Still et spørsmål om dagens løp..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              multiline
              maxRows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !userPrompt.trim()}
              sx={{ 
                minWidth: 120,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
              }}
              startIcon={loading ? null : <Send />}
            >
              {loading ? <LinearProgress sx={{ width: 80 }} /> : 'Send'}
            </Button>
          </Box>

          {/* Advanced Controls */}
          <Collapse in={showAdvanced}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesome />}
                onClick={() => setGeneratorOpen(true)}
              >
                Generer testdata
              </Button>
              <Typography variant="caption" color="text.secondary">
                Modell: {selectedModel}
              </Typography>
            </Box>
          </Collapse>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Response Section */}
        {responses.map((response, index) => (
          <Fade in key={index} timeout={500}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                    <SmartToy />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {response.display_name || 'AI Assistent'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {response.generation_time.toFixed(2)}s • 
                      {response.from_cache ? ' Fra cache' : ' Ny generering'}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ 
                  '& p': { mb: 1.5 },
                  '& ul': { mb: 1.5 },
                  '& li': { mb: 0.5 },
                  '& h3': { mt: 2, mb: 1 }
                }}>
                  <ReactMarkdown>
                    {response.generated_text}
                  </ReactMarkdown>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </Container>

      {/* JSON Generator */}
      <JsonGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onGenerated={(json) => {
          setRaceData(JSON.parse(json));
          setGeneratorOpen(false);
        }}
        apiUrl={API_URL}
      />
    </>
  );
}
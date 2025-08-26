import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Collapse,
  Stack,
  Alert,
  Badge,
  useTheme,
  alpha,
  Container,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  Casino,
  MonetizationOn,
  Stars,
  Share,
  Download,
  Home,
  Receipt,
  Analytics,
  Person,
  ArrowBack,
  MoreVert,
  Celebration
} from '@mui/icons-material';
// import confetti from 'canvas-confetti'; // Uncomment after installing: npm install canvas-confetti

interface RaceResult {
  race: number;
  name: string;
  winner: number;
  winnerName: string;
  winnerOdds: number;
  hit: boolean;
}

// Phone emulator wrapper component
function PhoneEmulator({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 4
      }}
    >
      {/* Phone Frame */}
      <Box
        sx={{
          width: '375px',
          height: '812px',
          bgcolor: '#1a1a1a',
          borderRadius: '40px',
          padding: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      >
        {/* Screen */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'white',
            borderRadius: '28px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Status Bar */}
          <Box
            sx={{
              height: '44px',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              9:41
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Box sx={{ width: 4, height: 4, bgcolor: 'black', borderRadius: '50%' }} />
              <Box sx={{ width: 4, height: 4, bgcolor: 'black', borderRadius: '50%' }} />
              <Box sx={{ width: 4, height: 4, bgcolor: 'black', borderRadius: '50%' }} />
              <Box sx={{ width: 20, height: 12, border: '1px solid black', borderRadius: 1 }} />
            </Box>
          </Box>
          
          {/* Content Area */}
          <Box
            sx={{
              height: 'calc(100% - 44px)',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {children}
          </Box>
        </Box>

        {/* Home Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '4px',
            bgcolor: '#333',
            borderRadius: '100px'
          }}
        />
      </Box>
    </Box>
  );
}

export default function MobileResultsView() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<number[]>([]);
  const [bottomNav, setBottomNav] = useState(1);
  
  // Mock data
  const betResult = {
    totalWon: 11497,
    correctRaces: 6,
    totalRaces: 7,
    prizeLevel: "6 av 7 rette",
    returnOnInvestment: 5986,
    totalCost: 192
  };

  const raceResults: RaceResult[] = [
    { race: 1, name: "Løp 1", winner: 6, winnerName: "Tangen Haap", winnerOdds: 3.1, hit: true },
    { race: 2, name: "Løp 2", winner: 2, winnerName: "Looking Superb", winnerOdds: 1.8, hit: true },
    { race: 3, name: "Løp 3", winner: 3, winnerName: "Wilda", winnerOdds: 5.5, hit: true },
    { race: 4, name: "Løp 4", winner: 2, winnerName: "Sweetlikecandybar", winnerOdds: 2.1, hit: true },
    { race: 5, name: "Løp 5", winner: 5, winnerName: "Disco Volante", winnerOdds: 2.8, hit: true },
    { race: 6, name: "Løp 6", winner: 1, winnerName: "Bolt Brodde", winnerOdds: 3.2, hit: true },
    { race: 7, name: "Løp 7", winner: 10, winnerName: "Clodrique", winnerOdds: 11.5, hit: false }
  ];

  useEffect(() => {
    // Trigger confetti for good results
    // Uncomment after installing canvas-confetti
    // if (betResult.correctRaces >= 6) {
    //   setTimeout(() => {
    //     const phoneElement = document.getElementById('phone-screen');
    //     if (phoneElement) {
    //       const rect = phoneElement.getBoundingClientRect();
    //       confetti({
    //         particleCount: 50,
    //         spread: 60,
    //         origin: { 
    //           x: (rect.left + rect.width / 2) / window.innerWidth,
    //           y: 0.4 
    //         }
    //       });
    //     }
    //   }, 500);
    // }
  }, [betResult.correctRaces]);

  const toggleRace = (race: number) => {
    setExpanded(prev => 
      prev.includes(race) 
        ? prev.filter(r => r !== race)
        : [...prev, race]
    );
  };

  return (
    <PhoneEmulator>
      <Box id="phone-screen" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#1e3a5f' }}>
          <Toolbar sx={{ minHeight: 56 }}>
            <IconButton edge="start" color="inherit" size="small">
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '18px' }}>
              V75 Resultat
            </Typography>
            <IconButton edge="end" color="inherit" size="small">
              <Share />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflow: 'auto', pb: 7 }}>
          {/* Win Card */}
          <Card
            sx={{
              m: 2,
              background: betResult.correctRaces >= 6
                ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                : 'linear-gradient(135deg, #2196F3, #1976D2)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20,
                opacity: 0.1
              }}>
                <EmojiEvents sx={{ fontSize: 120 }} />
              </Box>
              
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Din gevinst
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {betResult.totalWon.toLocaleString('nb-NO')} kr
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    size="small"
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label={betResult.prizeLevel}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontSize: '12px'
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<TrendingUp sx={{ fontSize: 16 }} />}
                    label={`+${betResult.returnOnInvestment}%`}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontSize: '12px'
                    }}
                  />
                </Box>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {betResult.correctRaces}/{betResult.totalRaces}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Riktige
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">
                      192
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Rekker
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {betResult.totalCost} kr
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Innsats
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Race Results */}
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Dine resultater
            </Typography>
            
            <List sx={{ p: 0 }}>
              {raceResults.map((race) => (
                <Card 
                  key={race.race}
                  sx={{ 
                    mb: 1,
                    bgcolor: race.hit ? alpha(theme.palette.success.main, 0.05) : 'white'
                  }}
                >
                  <ListItem
                    onClick={() => toggleRace(race.race)}
                    sx={{ 
                      px: 2, 
                      py: 1.5,
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: race.hit ? theme.palette.success.main : theme.palette.error.main,
                          fontSize: '14px'
                        }}
                      >
                        {race.race}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {race.name}
                          </Typography>
                          {race.hit ? (
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {race.winnerName} • Odds {race.winnerOdds}
                        </Typography>
                      }
                    />
                    <IconButton size="small">
                      {expanded.includes(race.race) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </ListItem>
                  
                  <Collapse in={expanded.includes(race.race)}>
                    <Box sx={{ px: 2, pb: 1.5 }}>
                      <Divider sx={{ mb: 1 }} />
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Dine valg:
                          </Typography>
                          <Typography variant="caption">
                            1, 5, 6, 8
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Vinner odds:
                          </Typography>
                          <Typography variant="caption">
                            {race.winnerOdds}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Collapse>
                </Card>
              ))}
            </List>

            {/* Action Buttons */}
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                sx={{ 
                  bgcolor: '#1e3a5f',
                  py: 1.5,
                  borderRadius: 2
                }}
                startIcon={<Download />}
              >
                Last ned kvittering
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                Spill igjen
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Bottom Navigation */}
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            value={bottomNav}
            onChange={(event, newValue) => setBottomNav(newValue)}
            sx={{ height: 56 }}
          >
            <BottomNavigationAction 
              label="Hjem" 
              icon={<Home />}
              sx={{ minWidth: 0 }}
            />
            <BottomNavigationAction 
              label="Resultater" 
              icon={<Receipt />}
              sx={{ minWidth: 0 }}
            />
            <BottomNavigationAction 
              label="Statistikk" 
              icon={<Analytics />}
              sx={{ minWidth: 0 }}
            />
            <BottomNavigationAction 
              label="Profil" 
              icon={<Person />}
              sx={{ minWidth: 0 }}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </PhoneEmulator>
  );
}
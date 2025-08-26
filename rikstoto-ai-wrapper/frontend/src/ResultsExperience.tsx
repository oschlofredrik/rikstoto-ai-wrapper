import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
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
  AlertTitle,
  Badge,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  Casino,
  MonetizationOn,
  Stars,
  Timeline,
  Speed,
  Groups,
  LocalAtm,
  Celebration,
  WorkspacePremium,
  ArrowForward,
  Refresh,
  Share,
  Download
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
// import confetti from 'canvas-confetti'; // Uncomment after installing: npm install canvas-confetti

interface RaceResult {
  race: number;
  name: string;
  winner: number;
  winnerName: string;
  winnerOdds: number;
  hit: boolean;
  position?: number;
  payout?: number;
}

interface BetResult {
  totalWon: number;
  correctRaces: number;
  totalRaces: number;
  prizeLevel: string;
  returnOnInvestment: number;
}

export default function ResultsExperience() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Mock data - would come from API
  const betResult: BetResult = {
    totalWon: 11497,
    correctRaces: 6,
    totalRaces: 7,
    prizeLevel: "6 av 7 rette",
    returnOnInvestment: 5986
  };

  const raceResults: RaceResult[] = [
    { race: 1, name: "V75-1", winner: 6, winnerName: "Tangen Haap", winnerOdds: 3.1, hit: true },
    { race: 2, name: "V75-2", winner: 2, winnerName: "Looking Superb", winnerOdds: 1.8, hit: true },
    { race: 3, name: "V75-3", winner: 3, winnerName: "Wilda", winnerOdds: 5.5, hit: true },
    { race: 4, name: "V75-4", winner: 2, winnerName: "Sweetlikecandybar", winnerOdds: 2.1, hit: true },
    { race: 5, name: "V75-5", winner: 5, winnerName: "Disco Volante", winnerOdds: 2.8, hit: true },
    { race: 6, name: "V75-6", winner: 1, winnerName: "Bolt Brodde", winnerOdds: 3.2, hit: true },
    { race: 7, name: "V75-7", winner: 10, winnerName: "Clodrique", winnerOdds: 11.5, hit: false }
  ];

  useEffect(() => {
    // Trigger confetti if good win
    // Uncomment after installing canvas-confetti
    // if (betResult.correctRaces >= 6 && !animationComplete) {
    //   setTimeout(() => {
    //     confetti({
    //       particleCount: 100,
    //       spread: 70,
    //       origin: { y: 0.6 }
    //     });
    //     setAnimationComplete(true);
    //   }, 500);
    // }
  }, [betResult.correctRaces, animationComplete]);

  const toggleRace = (race: number) => {
    setExpanded(prev => 
      prev.includes(race) 
        ? prev.filter(r => r !== race)
        : [...prev, race]
    );
  };

  const getResultColor = (hit: boolean) => {
    return hit ? 'success' : 'error';
  };

  const getResultIcon = (hit: boolean) => {
    return hit ? <CheckCircle /> : <Cancel />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Resultater V75
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Lørdag 2. juli • Bjerke
        </Typography>
      </Box>

      {/* Main Result Card */}
      <Fade in timeout={500}>
        <Card 
          sx={{ 
            mb: 4,
            background: betResult.correctRaces >= 6 
              ? `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
              : `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 20, 
              right: 20,
              opacity: 0.1
            }}>
              <EmojiEvents sx={{ fontSize: 200 }} />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  Din gevinst
                </Typography>
                <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
                  {betResult.totalWon.toLocaleString('nb-NO')} kr
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<CheckCircle />}
                    label={betResult.prizeLevel}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip 
                    icon={<TrendingUp />}
                    label={`ROI: ${betResult.returnOnInvestment}%`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold">
                      {betResult.correctRaces}/{betResult.totalRaces}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Riktige
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold">
                      192
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Rekker
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold">
                      192 kr
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Innsats
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  color: theme.palette.primary.main,
                  '&:hover': { bgcolor: 'white' }
                }}
                startIcon={<Share />}
              >
                Del resultat
              </Button>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
                startIcon={<Download />}
              >
                Last ned kvittering
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Race by Race Results */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Løp for løp
          </Typography>
          <Button
            variant="text"
            onClick={() => setShowDetails(!showDetails)}
            endIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
          >
            {showDetails ? 'Skjul' : 'Vis'} detaljer
          </Button>
        </Box>

        <List>
          {raceResults.map((race, index) => (
            <React.Fragment key={race.race}>
              <ListItem
                sx={{
                  bgcolor: race.hit ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: race.hit 
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.action.hover, 0.05)
                  }
                }}
                onClick={() => toggleRace(race.race)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: race.hit ? theme.palette.success.main : theme.palette.error.main
                    }}
                  >
                    {race.race}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {race.name}
                      </Typography>
                      <Chip 
                        size="small"
                        icon={getResultIcon(race.hit)}
                        label={race.hit ? 'Riktig' : 'Bom'}
                        color={getResultColor(race.hit)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Vinner: <strong>{race.winnerName}</strong>
                      </Typography>
                      <Chip 
                        size="small"
                        label={`Odds: ${race.winnerOdds}`}
                        variant="outlined"
                      />
                    </Box>
                  }
                />
                <IconButton>
                  {expanded.includes(race.race) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </ListItem>
              
              <Collapse in={expanded.includes(race.race)}>
                <Box sx={{ pl: 8, pr: 4, pb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="caption" color="text.secondary">
                        Dine valg
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        1, 5, 6, 8
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="caption" color="text.secondary">
                        Distanse
                      </Typography>
                      <Typography variant="body2">
                        2100m
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="caption" color="text.secondary">
                        Startmetode
                      </Typography>
                      <Typography variant="body2">
                        Auto
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="caption" color="text.secondary">
                        Antall hester
                      </Typography>
                      <Typography variant="body2">
                        12
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Statistics */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Groups sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Spillstatistikk
                </Typography>
              </Box>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Totalt antall spillere
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    45,892
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Gjennomsnittlig innsats
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    194 kr
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total omsetning
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    8,900,000 kr
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Oddsutvikling
                </Typography>
              </Box>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Snitt vinner-odds
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    4.27
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Favorittseiere
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    3 av 7
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Outsider-seiere
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    1 av 7
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalAtm sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Utbetalinger
                </Typography>
              </Box>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    7 rette
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    1,234,000 kr
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    6 rette
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    1,437 kr
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    5 rette
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    123 kr
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Next Game CTA */}
      <Card sx={{ mt: 4, bgcolor: theme.palette.primary.main, color: 'white' }}>
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Klar for neste omgang?
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              V75 lørdag på Øvrevoll • Innleveringsfrist 15:00
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
              startIcon={<Refresh />}
            >
              Spill samme kupong
            </Button>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
              endIcon={<ArrowForward />}
            >
              Lag ny kupong
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
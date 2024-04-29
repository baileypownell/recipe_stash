import { Box, Button, Fade, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import mobileView from '../images/mobile_dashboard.png';
import transparentLogo from '../images/white-text-transparent.svg';
import veggies from '../images/cutting_vegetables.jpg';
import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';

const Home = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setTimeout(() => setVisible(true), 500);
  }, []);

  return (
    <Box
      sx={{
        backgroundImage: `url(${veggies})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Stack
        paddingTop="30px"
        paddingBottom="30px"
        alignItems="center"
        justifyContent="center"
        height="100%"
        sx={{
          background:
            'linear-gradient(120deg, rgba(230, 108, 108, 0.29), rgba(221, 114, 68, 0.42))',
        }}
      >
        <Box>
          <img
            style={{
              height: '50px',
              [theme.breakpoints.up('lg')]: {
                height: '75px',
              },
            }}
            src={transparentLogo}
            alt="Woman chopping greens on a cutting board"
          />
        </Box>
        <Fade in={visible}>
          <Stack alignItems="center">
            <Box textAlign="center" color={theme.palette.info.main}>
              <Typography variant="h6">All of your recipes.</Typography>
              <Typography variant="h6">All in one place.</Typography>
              <Typography variant="h6">And it's free.</Typography>
            </Box>
            <Box margin={2} width="200px">
              <img
                style={{
                  width: '100%',
                }}
                src={mobileView}
                alt="Preview of what the application looks like on a phone"
              />
            </Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/recipes')}
              startIcon={<DoubleArrowRoundedIcon />}
            >
              Get Started
            </Button>
          </Stack>
        </Fade>
      </Stack>
    </Box>
  );
};

export default Home;

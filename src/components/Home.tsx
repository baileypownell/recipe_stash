import { Box, Button, Fade, Stack, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import mobileView from '../images/mobile_dashboard.png';
import transparentLogo from '../images/white-text-transparent.svg';
import veggies from '../images/cutting_vegetables.jpg';
import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';

const Home = (props: any) => {
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
        alignItems="center"
        justifyContent="center"
        sx={{
          height: '100%',
          background:
            'linear-gradient(120deg, rgba(230, 108, 108, 0.29), rgba(221, 114, 68, 0.42))',
        }}
      >
        <Stack
          sx={{
            img: {
              height: '50px',
              [theme.breakpoints.up('lg')]: {
                height: '75px',
              },
            },
          }}
        >
          <img src={transparentLogo} />
        </Stack>
        <Fade in={visible}>
          <Stack alignItems="center">
            <Box
              textAlign="center"
              sx={{
                color: theme.palette.info.main,
              }}
            >
              <Typography variant="h6">All of your recipes.</Typography>
              <Typography variant="h6">All in one place.</Typography>
              <Typography variant="h6">And it's free.</Typography>
            </Box>
            <Box
              margin={2}
              sx={{
                width: '200px',
                img: {
                  width: '100%',
                },
              }}
            >
              <img src={mobileView} alt="whisk" />
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

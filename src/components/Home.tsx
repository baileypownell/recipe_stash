import { Box, Button, Fade, Stack, Typography, useTheme } from '@mui/material';
import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import mobileView from '../images/mobile_dashboard.png';
import transparentLogo from '../images/white-text-transparent.svg';
import veggies from '../images/cutting_vegetables.jpg';

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
        backgroundPosition: { xs: '58% center', md: 'center' },
        minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 72px)' },
      }}
    >
      <Stack
        sx={{
          alignItems: { xs: 'center', md: 'flex-start' },
          justifyContent: 'center',
          gap: { xs: 2.5, md: 3 },
          // minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 72px)' },
          height: 'stretch',
          px: { xs: 3, sm: 6, md: 10, lg: 14 },
          py: { xs: 5, md: 7 },
          textAlign: { xs: 'center', md: 'left' },
          background: {
            xs: 'linear-gradient(180deg, rgba(25, 24, 22, 0.72), rgba(25, 24, 22, 0.38) 45%, rgba(25, 24, 22, 0.66))',
            md: 'linear-gradient(90deg, rgba(24, 23, 21, 0.82) 0%, rgba(24, 23, 21, 0.58) 38%, rgba(24, 23, 21, 0.16) 72%)',
          },
        }}
      >
        <Box
          component="img"
          src={transparentLogo}
          alt="recipe stash"
          sx={{
            width: { xs: 220, sm: 280, md: 340 },
            maxWidth: '82vw',
            filter: 'drop-shadow(0 2px 12px rgba(0, 0, 0, 0.28))',
          }}
        />
        <Fade in={visible}>
          <Stack
            sx={{
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: { xs: 2.5, md: 3 },
              maxWidth: 520,
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: theme.palette.info.main,
                fontWeight: 700,
                lineHeight: 1.08,
                textShadow: '0 2px 18px rgba(0, 0, 0, 0.38)',
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.6rem' },
              }}
            >
              Keep every recipe within reach.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.88)',
                maxWidth: 410,
                lineHeight: 1.55,
                fontWeight: 400,
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.34)',
              }}
            >
              Save favorites, organize meals, and pull up your recipe box from
              the kitchen counter.
            </Typography>
            <Box
              sx={{
                width: { xs: 168, sm: 190, md: 220 },
                my: { xs: 0.5, md: 1 },
                alignSelf: { xs: 'center', md: 'flex-start' },
                filter: 'drop-shadow(0 18px 24px rgba(0, 0, 0, 0.34))',
              }}
            >
              <Box
                component="img"
                sx={{ width: '70%', display: 'block', margin: { xs: '0 auto', md: '0' } }}
                src={mobileView}
                alt="Preview of the recipe stash mobile recipe box"
              />
            </Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/recipes')}
              startIcon={<DoubleArrowRoundedIcon />}
              sx={{
                px: 2.5,
                py: 1.1,
                borderRadius: 1,
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)',
              }}
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

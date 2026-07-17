import {
  Box,
  Button,
  Stack,
  Text,
  Title,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { DoubleArrowRoundedIcon } from '@icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import mobileView from '../images/mobile_dashboard.png';
import transparentLogo from '../images/white-text-transparent.svg';
import veggies from '../images/cutting_vegetables.jpg';

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [isWide, setIsWide] = useState(window.innerWidth >= 992);
  const [isMedium, setIsMedium] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();
  const theme = useMantineTheme();

  useEffect(() => {
    setTimeout(() => setVisible(true), 500);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsWide(window.innerWidth >= 992);
      setIsMedium(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Transition mounted={visible} transition="fade" duration={400}>
      {(styles) => (
        <Box
          style={{
            backgroundImage: `url(${veggies})`,
            backgroundSize: 'cover',
            backgroundPosition: isWide ? 'center' : '58% center',
          }}
        >
          <Stack
            style={{
              minHeight: 'calc(100vh - 56px)',
              justifyContent: 'center',
              alignItems: isWide ? 'flex-start' : 'center',
              gap: isWide
                ? `calc(${theme.spacing.xl} * 1.2)`
                : theme.spacing.xl,
              padding: isWide
                ? `calc(${theme.spacing.xl} * 1.5) calc(${theme.spacing.xl} * 4)`
                : `calc(${theme.spacing.xl} * 2) ${theme.spacing.lg}`,
              textAlign: isWide ? 'left' : 'center',
              background: theme.other.app.gradients.pageOverlay
            }}
          >
            <Box
              component="img"
              src={transparentLogo}
              alt="recipe stash"
              style={{
                width: isWide ? 340 : isMedium ? 280 : 220,
                maxWidth: '82vw',
                filter: 'drop-shadow(0 2px 12px rgba(0, 0, 0, 0.28))',
              }}
            />
            <Stack
              style={{
                ...styles,
                alignItems: isWide ? 'flex-start' : 'center',
                gap: isWide
                  ? `calc(${theme.spacing.xl} * 1.2)`
                  : theme.spacing.xl,
                maxWidth: 520,
              }}
            >
              <Title
                order={1}
                style={{
                  color: theme.white,
                  fontWeight: 700,
                  lineHeight: 1.08,
                  textShadow: '0 2px 18px rgba(0, 0, 0, 0.38)',
                  fontSize: isWide ? '3.6rem' : isMedium ? '3rem' : '2.25rem',
                }}
              >
                Keep every recipe within reach.
              </Title>
              <Text
                size="lg"
                style={{
                  color: 'rgba(255, 255, 255, 0.88)',
                  maxWidth: 410,
                  lineHeight: 1.55,
                  fontWeight: 400,
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.34)',
                }}
              >
                Save favorites, organize meals, and pull up your recipe box from
                the kitchen counter.
              </Text>
              <Box
                style={{
                  width: isWide ? 220 : isMedium ? 190 : 168,
                  margin: isWide
                    ? `${theme.spacing.xs} 0`
                    : `calc(${theme.spacing.xs} / 2) 0`,
                  alignSelf: isWide ? 'flex-start' : undefined,
                  filter: 'drop-shadow(0 18px 24px rgba(0, 0, 0, 0.34))',
                }}
              >
                <Box
                  component="img"
                  src={mobileView}
                  alt="Preview of the recipe stash mobile recipe box"
                  style={{
                    width: '70%',
                    display: 'block',
                    margin: isWide ? 0 : '0 auto',
                  }}
                />
              </Box>
              <Button
                variant="filled"
                color="dark"
                onClick={() => navigate('/recipes')}
                leftSection={<DoubleArrowRoundedIcon />}
                style={{
                  padding: '0.7rem 1.25rem',
                  borderRadius: theme.radius.sm,
                  fontWeight: 700,
                  boxShadow: theme.other.app.shadows.toolbar,
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Transition>
  );
};

export default Home;

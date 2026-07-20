import { BlenderRoundedIcon } from '@icons';
import {
  Box,
  Button,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Component } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigateProps {
  navigate: () => void;
}

const withNavigate =
  <P extends NavigateProps>(WrappedComponent: ComponentType<P>) =>
  (props: Omit<P, keyof NavigateProps>) => {
    const navigate = useNavigate();
    const goHome = () => {
      navigate('/');
      navigate(0);
    };
    return <WrappedComponent {...(props as P)} navigate={goHome} />;
  };

class ErrorBoundary extends Component<
  { navigate: () => void; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { navigate: () => void; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          mih="calc(100vh - 90px)"
          px="md"
          py={64}
          style={(theme) => ({
            display: 'grid',
            placeItems: 'center',
            ...theme.other.app.surfaces.page,
          })}
        >
          <Paper
            radius={32}
            p={{ base: 32, sm: 48 }}
            maw={520}
            w="100%"
            ta="center"
            style={(theme) => ({
              border: `1px solid ${theme.other.app.borders.subtle}`,
              boxShadow: theme.other.app.shadows.raised,
            })}
          >
            <Stack align="center" gap="lg">
              <Box
                w={96}
                h={96}
                style={(theme) => ({
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 28,
                  color: theme.other.app.palette.primary.main,
                  ...theme.other.app.surfaces.primaryTint,
                  transform: 'rotate(-6deg)',
                  boxShadow: theme.other.app.shadows.floating,
                })}
              >
                <BlenderRoundedIcon />
              </Box>

              <Stack gap={8} align="center">
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  c="var(--mantine-primary-color-filled)"
                  style={{ letterSpacing: '0.14em' }}
                >
                  Kitchen mishap
                </Text>
                <Title order={1} size="h2">
                  This recipe got a little overcooked.
                </Title>
                <Text c="dimmed" maw={380} lh={1.6}>
                  Something unexpected happened, but your recipes are still
                  safe. Head home and we’ll get you back to cooking.
                </Text>
              </Stack>

              <Button
                size="md"
                radius="xl"
                px={30}
                onClick={this.props.navigate}
              >
                Back to home
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default withNavigate(ErrorBoundary);

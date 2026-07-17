import {
  BlenderRoundedIcon } from '@icons';
import { Box,
  Button,
  Divider,
  Stack,
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
        <Stack>
          <Box
          >
            <BlenderRoundedIcon />
          </Box>
          <Title order={5}>Something went wrong.</Title>
          <Divider />
          <Box>
            <Button
              variant="outline"
              color="dark"
              onClick={this.props.navigate}
            >
              Home
            </Button>
          </Box>
        </Stack>
      );
    }
    return this.props.children;
  }
}

export default withNavigate(ErrorBoundary);

import BlenderRoundedIcon from '@mui/icons-material/BlenderRounded';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
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
        <Stack  sx={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <Box
            sx={{
              marginBottom: 3,
              svg: {
                fontSize: '125px',
                color: '#353531',
              },
            }}
          >
            <BlenderRoundedIcon />
          </Box>
          <Typography variant="h5">Something went wrong.</Typography>
          <Divider />
          <Box sx={{ padding: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
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

import BlenderRoundedIcon from '@mui/icons-material/BlenderRounded';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { Component, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const withNavigate = (Component) => (props) => {
  const navigate = useNavigate();
  const goHome = () => {
    navigate('/');
    navigate(0);
  };
  return <Component {...props} navigate={goHome} />;
};

class ErrorBoundary extends Component<
  { navigate: () => void; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Stack alignItems="center" justifyContent="center" textAlign="center">
          <Box
            marginBottom={3}
            sx={{
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
          <Box padding={3}>
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

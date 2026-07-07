import { CircularProgress, Stack } from '@mui/material';

export const Spinner = () => (
  <Stack
    sx={{
      alignItems: "center",
      justifyContent: "center"
    }}>
    <CircularProgress />
  </Stack>
);

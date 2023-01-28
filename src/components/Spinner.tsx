import { CircularProgress, Stack } from '@mui/material';

export const Spinner = () => {
  return (
    <Stack alignItems="center" justifyContent="center">
      <CircularProgress />
    </Stack>
  );
};

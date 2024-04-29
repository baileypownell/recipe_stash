import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { IconButton, Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';

interface Props {
  title: string;
}

const InnerNavigationBar = ({ title }: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Stack
      direction="row"
      alignItems="center"
      padding={1}
      backgroundColor={theme.palette.secondary.main}
      color={theme.palette.info.main}
    >
      <IconButton color="info" onClick={() => navigate('/recipes')}>
        <ArrowBackIosRoundedIcon />
      </IconButton>
      <Typography variant="h6">{title}</Typography>
    </Stack>
  );
};

export default InnerNavigationBar;

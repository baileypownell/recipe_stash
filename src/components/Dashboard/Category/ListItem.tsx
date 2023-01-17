import { Box, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';

interface ListItemProps {
  recipeId: string;
  key: string;
  rawTitle: string;
}

const ListItem = ({ recipeId, key, rawTitle }: ListItemProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const viewRecipe = () => {
    navigate(`/recipes/${recipeId}`);
  };

  return (
    <Box
      width="100%"
      borderBottom={`1px solid ${theme.palette.gray.main}`}
      sx={{
        cursor: 'pointer',
      }}
      padding={1}
      key={key}
      onClick={viewRecipe}
    >
      <Typography variant="body1">{rawTitle}</Typography>
    </Box>
  );
};

export default ListItem;

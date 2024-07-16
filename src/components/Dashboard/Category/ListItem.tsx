import {
  ListItemButton,
  ListItemText,
  ListItem as MuiListItem,
} from '@mui/material';
import { useNavigate } from 'react-router';

interface ListItemProps {
  recipeId: string;
  key: string;
  rawTitle: string;
}

const ListItem = ({ recipeId, key, rawTitle }: ListItemProps) => {
  const navigate = useNavigate();
  const viewRecipe = () => navigate(`/recipes/${recipeId}`);

  return (
    <MuiListItem
      dense
      key={key}
      sx={{
        paddingLeft: 0,
      }}
    >
      <ListItemButton onClick={viewRecipe}>
        <ListItemText>{rawTitle}</ListItemText>
      </ListItemButton>
    </MuiListItem>
  );
};

export default ListItem;

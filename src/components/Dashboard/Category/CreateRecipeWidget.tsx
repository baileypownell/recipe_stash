import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { Button, Stack, useTheme } from '@mui/material';
import { useState } from 'react';
import side_dish from '../../../images/asparagus.jpg';
import other from '../../../images/bread.jpg';
import dessert from '../../../images/dessert.jpg';
import drinks from '../../../images/drinks.jpg';
import breakfast from '../../../images/french_toast.jpg';
import lunch from '../../../images/lunch.jpg';
import dinner from '../../../images/pizza.jpg';
import { AddRecipeMutationParam } from '../../RecipeCache';
import { GridView } from '../Dashboard';
import RecipeDialog, { Mode } from './RecipeDialog';

const getBackgroundImage = (categoryId: string): string => {
  switch (categoryId) {
    case 'breakfast':
      return breakfast;
    case 'lunch':
      return lunch;
    case 'dinner':
      return dinner;
    case 'side_dish':
      return side_dish;
    case 'drinks':
      return drinks;
    case 'dessert':
      return dessert;
    case 'other':
      return other;
  }
};

type CreateRecipeWidgetProps = {
  id: string;
  gridView: GridView;
  addRecipe: (recipeInput: AddRecipeMutationParam) => void;
  title: string;
};

export const CreateRecipeWidget = ({
  gridView,
  id,
  addRecipe,
  title,
}: CreateRecipeWidgetProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const toggleModal = (): void => setOpen(!open);

  return (
    <>
      {gridView === GridView.Grid ? (
        <Stack
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
          minHeight="155px"
          onClick={toggleModal}
          id={id}
          sx={{
            backgroundImage: `url(${getBackgroundImage(id)})`,
            boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
            minWidth: '150px',
            backgroundBlendMode: 'overlay',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginRight: '10px',
            marginBottom: '10px',
            color: theme.palette.primary.main,
            borderRadius: '5px',
            border: `2px solid ${theme.palette.primary.main}`,
            cursor: 'pointer',
            transition: 'background-color 0.5s',
            '&:hover': {
              backgroundColor: 'rgba(331, 68, 68, 0.2)',
            },
          }}
        >
          <AddCircleRoundedIcon color="info" sx={{ fontSize: '45px' }} />
        </Stack>
      ) : (
        <Button
          variant="contained"
          color="orange"
          onClick={toggleModal}
          sx={{ marginBottom: 1, color: theme.palette.info.main }}
          startIcon={<AddCircleRoundedIcon />}
        >
          Add Recipe
        </Button>
      )}

      <RecipeDialog
        mode={Mode.Add}
        open={open}
        toggleModal={toggleModal}
        recipeDialogInfo={{
          category: title,
          addRecipe: addRecipe,
        }}
      />
    </>
  );
};

import AddIcon from '@mui/icons-material/Add';
import { Box, Fab } from '@mui/material';
import { useState } from 'react';
import RecipeDialog, { Mode } from './Category/RecipeDialog';
import type { AddProps } from './Category/RecipeDialog';

export const AddRecipeButton = ({ addRecipe }: AddProps) => {
  const [open, setOpen] = useState(false);
  const toggleModal = (): void => setOpen(!open);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16
      }}>
      <Fab
        color="primary"
        aria-label="Create a new recipe"
        autoFocus
        onClick={toggleModal}
      >
        <AddIcon />
      </Fab>
      <RecipeDialog
        mode={Mode.Add}
        open={open}
        toggleModal={toggleModal}
        recipeDialogInfo={{ addRecipe }}
      />
    </Box>
  );
};

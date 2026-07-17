import { AddIcon } from '@icons';
import { Box, ActionIcon, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import RecipeDialog, { Mode } from './Category/RecipeDialog';
import type { AddProps } from './Category/RecipeDialog';

export const AddRecipeButton = ({ addRecipe }: AddProps) => {
  const [open, setOpen] = useState(false);
  const theme = useMantineTheme();
  const toggleModal = (): void => setOpen(!open);

  return (
    <Box
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 30,
      }}
    >
      <ActionIcon
        color="red"
        aria-label="Create a new recipe"
        autoFocus
        onClick={toggleModal}
        size="xl"
        radius="xl"
        style={{
          width: 52,
          height: 52,
          boxShadow: theme.other.app.shadows.floating,
        }}
      >
        <AddIcon />
      </ActionIcon>
      <RecipeDialog
        mode={Mode.Add}
        open={open}
        toggleModal={toggleModal}
        recipeDialogInfo={{ addRecipe }}
      />
    </Box>
  );
};

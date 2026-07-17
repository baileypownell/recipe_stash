import { MoreVertRoundedIcon } from '@icons';
import { Box, ActionIcon, Menu } from '@mantine/core';

type MobileRecipeToolbarProps = {
  width: number;
  triggerDialog: () => void;
  cloneRecipe: () => void;
};

export default function MobileRecipeToolbar({
  width,
  triggerDialog,
  cloneRecipe,
}: MobileRecipeToolbarProps) {
  const handleDialog = () => {
    triggerDialog();
  };

  const duplicateRecipe = () => {
    cloneRecipe();
  };

  return width <= 700 ? (
    <Box>
      <Menu shadow="md">
        <Menu.Target>
          <ActionIcon
            aria-controls="simple-menu"
            aria-haspopup="true"
            color="gray"
          >
            <MoreVertRoundedIcon />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={handleDialog}>Edit</Menu.Item>
          <Menu.Item onClick={duplicateRecipe}>Duplicate</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  ) : null;
}

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Box, IconButton, Menu, MenuItem, useTheme } from '@mui/material';
import { useState } from 'react';

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
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialog = () => {
    handleClose();
    triggerDialog();
  };

  const duplicateRecipe = () => {
    handleClose();
    cloneRecipe();
  };

  return width <= 700 ? (
    <Box
      textAlign="right"
      position="absolute"
      bottom="0"
      right="0"
      left="0"
      sx={{
        backgroundColor: theme.palette.gray.main,
      }}
      width="100%"
      margin="0"
      padding="15px"
      zIndex="1"
    >
      <IconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="info"
      >
        <MoreVertRoundedIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleDialog}>Edit</MenuItem>
        <MenuItem onClick={duplicateRecipe}>Duplicate</MenuItem>
      </Menu>
    </Box>
  ) : null;
}

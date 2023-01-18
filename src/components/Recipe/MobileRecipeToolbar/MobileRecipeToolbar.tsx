import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import './MobileRecipeToolbar.scss';

export default function MobileRecipeToolbar(props: {
  width: number;
  triggerDialog: Function;
  cloneRecipe: Function;
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const triggerDialog = () => {
    handleClose();
    props.triggerDialog();
  };

  const cloneRecipe = () => {
    handleClose();
    props.cloneRecipe();
  };

  return props.width <= 700 ? (
    <div id="recipe-mobile-toolbar">
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
        <MenuItem onClick={triggerDialog}>Edit</MenuItem>
        <MenuItem onClick={cloneRecipe}>Duplicate</MenuItem>
      </Menu>
    </div>
  ) : null;
}

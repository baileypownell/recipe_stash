import { Button, Menu, MenuItem } from '@mui/material'
import React from 'react'
import './MobileRecipeToolbar.scss'

export default function MobileRecipeToolbar(props: { width: number, triggerDialog: Function, cloneRecipe: Function }) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const triggerDialog = () => {
    handleClose()
    props.triggerDialog()
  }

  const cloneRecipe = () => {
    handleClose()
    props.cloneRecipe()
  }

  return (props.width <= 700
    ? <div id="recipe-mobile-toolbar">
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        <i className="fas fa-ellipsis-v"></i>
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={triggerDialog}>Edit</MenuItem>
        <MenuItem onClick={cloneRecipe}>Duplicate</MenuItem>
      </Menu>
    </div>
    : null
  )
}

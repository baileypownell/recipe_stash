
import { Box, Divider, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer } from '@mui/material'
import { Stack } from '@mui/system'
import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import blackLogo from '../../images/black-logo.png'
import whiteLogo from '../../images/white-logo.png'
import AuthenticationService from '../../services/auth-service'
import './Nav.scss'

const Nav = () => {
  const [open, setOpenState] = useState(false)
  const isAuthenticated = AuthenticationService.authenticated()
  const navigate = useNavigate()

  const logout = async () => {
    try {
      await AuthenticationService.logout()
      AuthenticationService.setUserLoggedOut()
      setOpenState(false)
      navigate('/')
    } catch (err) {
      console.log(err)
    }
  }

  const handleListItemClick = (route: string) => {
    navigate(route)
    setOpenState(false)
  }

  const toggleDrawer = (openState) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenState(openState)
  }

  return (
    <>
      <nav>
        <Link to="/"><img src={blackLogo} alt="logo" /></Link>
        <Box>
          {isAuthenticated
            ? <>
              <NavLink to="/recipes">Recipes</NavLink>
              <a onClick={toggleDrawer(!open)}><i className="fas fa-bars"></i></a>
            </>
            : <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </>
          }
        </Box>
      </nav>
      <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Stack width="250px" paddingTop="20px">
          <img style={{ width: "calc(100% - 20px)", margin: "0 auto 20px auto" }} src={whiteLogo} alt="logo" />
          <List>
            <ListItem button onClick={() => handleListItemClick('/settings')}>
              <ListItemIcon>
                <i className="fas fa-cogs"></i>
              </ListItemIcon>
              <ListItemText primary="Settings"></ListItemText>
            </ListItem>
            <ListItem button onClick={() => handleListItemClick('/')}>
              <ListItemIcon>
                <i className="fas fa-house-user"></i>
              </ListItemIcon>
              <ListItemText primary="Home"></ListItemText>
            </ListItem>
            <ListItem button onClick={() => handleListItemClick('/recipes')}>
              <ListItemIcon>
                <i className="fas fa-utensils"></i>
              </ListItemIcon>
              <ListItemText primary="Recipes"></ListItemText>
            </ListItem>
            <Divider />
            <ListItem button onClick={logout}>
              <ListItemIcon>
                <i className="fas fa-arrow-right"></i>
              </ListItemIcon>
              <ListItemText primary="Logout"></ListItemText>
            </ListItem>
          </List>
        </Stack>
      </SwipeableDrawer>
    </>
  )
}

export default Nav
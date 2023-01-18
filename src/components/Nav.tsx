import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import {
  AppBar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Toolbar,
  useTheme,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import blackLogo from '../images/black-logo.png';
import whiteLogo from '../images/white-logo.png';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AuthenticationService from '../services/auth-service';

const Nav = () => {
  const [open, setOpenState] = useState(false);
  const isAuthenticated = AuthenticationService.authenticated();
  const navigate = useNavigate();
  const theme = useTheme();

  const logout = async () => {
    try {
      await AuthenticationService.logout();
      AuthenticationService.setUserLoggedOut();
      setOpenState(false);
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  const handleListItemClick = (route: string) => {
    navigate(route);
    setOpenState(false);
  };

  const toggleDrawer = (openState) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpenState(openState);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: theme.palette.gray.main }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(!open)}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <img src={blackLogo} alt="logo" style={{ height: '35px' }} />
            {isAuthenticated ? (
              <Button color="inherit" onClick={() => navigate('/recipes')}>
                Recipes
              </Button>
            ) : (
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Stack width="250px" paddingTop="20px">
          <img
            style={{ width: 'calc(100% - 20px)', margin: '0 auto 20px auto' }}
            src={whiteLogo}
            alt="logo"
          />
          <List>
            <ListItem button onClick={() => handleListItemClick('/recipes')}>
              <ListItemIcon>
                <RestaurantRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Recipes"></ListItemText>
            </ListItem>
            <ListItem button onClick={() => handleListItemClick('/settings')}>
              <ListItemIcon>
                <SettingsApplicationsRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Settings"></ListItemText>
            </ListItem>
            <ListItem button onClick={() => handleListItemClick('/')}>
              <ListItemIcon>
                <HomeRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Home"></ListItemText>
            </ListItem>
            <Divider />
            <ListItem button onClick={logout}>
              <ListItemIcon>
                <LogoutRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Logout"></ListItemText>
            </ListItem>
          </List>
        </Stack>
      </SwipeableDrawer>
    </>
  );
};

export default Nav;

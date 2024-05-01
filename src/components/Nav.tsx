import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import {
  AppBar,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Toolbar,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import blackLogo from '../images/black-logo.png';
import whiteLogo from '../images/white-logo.png';
import AuthenticationService from '../services/auth-service';

const Nav = () => {
  const [open, setOpen] = useState(false);
  const isAuthenticated = AuthenticationService.authenticated();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await AuthenticationService.logout();
      AuthenticationService.setUserLoggedOut();
      setOpen(false);
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  const handleListItemClick = (route: string) => {
    navigate(route);
    setOpen(false);
  };

  const toggleDrawer = (openState) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(openState);
  };

  return (
    <>
      <AppBar>
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
            {isAuthenticated ? (
              <>
                <ListItemButton onClick={() => handleListItemClick('/recipes')}>
                  <ListItemIcon>
                    <RestaurantRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Recipes"></ListItemText>
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleListItemClick('/settings')}
                >
                  <ListItemIcon>
                    <SettingsApplicationsRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings"></ListItemText>
                </ListItemButton>
                <ListItemButton onClick={() => handleListItemClick('/')}>
                  <ListItemIcon>
                    <HomeRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Home"></ListItemText>
                </ListItemButton>
                <Divider />
                <ListItemButton onClick={logout}>
                  <ListItemIcon>
                    <LogoutRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout"></ListItemText>
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton onClick={() => handleListItemClick('/login')}>
                  <ListItemIcon>
                    <LoginRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login"></ListItemText>
                </ListItemButton>
                <ListItemButton onClick={() => handleListItemClick('/signup')}>
                  <ListItemIcon>
                    <PersonAddAltRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Create Account"></ListItemText>
                </ListItemButton>
              </>
            )}
          </List>
        </Stack>
      </SwipeableDrawer>
    </>
  );
};

export default Nav;

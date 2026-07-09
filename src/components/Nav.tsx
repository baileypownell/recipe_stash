import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SwipeableDrawer,
  Toolbar,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import blackLogo from '../images/black-logo.png';
import whiteLogo from '../images/white-logo.png';
import AuthenticationService from '../services/auth-service';

type NavItemProps = {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
};

const NavItem = ({ icon, label, selected, onClick }: NavItemProps) => {
  const theme = useTheme();

  return (
    <ListItemButton
      onClick={onClick}
      selected={selected}
      sx={{
        mx: 1.5,
        my: 0.5,
        minHeight: 48,
        gap: 1.5,
        color: theme.palette.gray.main,
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.dark,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        },
        '&:hover': {
          backgroundColor: alpha(theme.palette.gray.main, 0.04),
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          width: 32,
          height: 32,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: selected ? theme.palette.primary.dark : theme.palette.gray.main,
          backgroundColor: selected
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.gray.main, 0.05),
          svg: {
            fontSize: 20,
          },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        slotProps={{
          primary: {
            sx: {
              fontWeight: selected ? 800 : 700,
              fontSize: '0.98rem',
            },
          },
        }}
      />
    </ListItemButton>
  );
};

const Nav = () => {
  const [open, setOpen] = useState(false);
  const isAuthenticated = AuthenticationService.authenticated();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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

  const toggleDrawer =
    (openState: boolean) =>
    (event: KeyboardEvent | MouseEvent) => {
    if (
      event.type === 'keydown' &&
      'key' in event &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(openState);
  };

  return (
    <>
      <AppBar>
        <Toolbar
          sx={{
            minHeight: 64,
          }}
        >
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              mr: 2,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.info.main, 0.08),
              },
            }}
            onClick={toggleDrawer(!open)}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: "space-between",
              width: "100%"
            }}>
            <Box
              component="img"
              src={blackLogo}
              alt="recipe stash"
              sx={{
                height: 34,
              }}
            />
            {isAuthenticated ? (
              <Button
                color="inherit"
                onClick={() => navigate('/recipes')}
                sx={{
                  borderRadius: 1,
                  px: 1.5,
                }}
              >
                Recipes
              </Button>
            ) : (
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 1,
                  px: 1.5,
                }}
              >
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
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            backgroundColor: theme.palette.info.main,
            borderRight: theme.surfaces.quiet.border,
            boxShadow: `8px 0 24px ${alpha(theme.palette.gray.main, 0.14)}`,
          },
        }}
      >
        <Stack
          sx={{
            minHeight: '100%',
            padding: 2,
          }}>
          <Box
            sx={{
              ...theme.surfaces.quiet,
              padding: 2,
              marginBottom: 2,
            }}
          >
            <Box
              component="img"
              src={whiteLogo}
              alt="recipe stash"
              sx={{
                width: '100%',
                maxWidth: 220,
                display: 'block',
              }}
            />
          </Box>
          <List sx={{ py: 0 }}>
            {isAuthenticated ? (
              <>
                <NavItem
                  icon={<RestaurantRoundedIcon />}
                  label="Recipes"
                  selected={location.pathname.startsWith('/recipes')}
                  onClick={() => handleListItemClick('/recipes')}
                />
                <NavItem
                  icon={<SettingsApplicationsRoundedIcon />}
                  label="Settings"
                  selected={location.pathname === '/settings'}
                  onClick={() => handleListItemClick('/settings')}
                />
                <NavItem
                  icon={<HomeRoundedIcon />}
                  label="Home"
                  selected={location.pathname === '/'}
                  onClick={() => handleListItemClick('/')}
                />
                <Divider sx={{ my: 1.25 }} />
                <NavItem
                  icon={<LogoutRoundedIcon />}
                  label="Logout"
                  selected={false}
                  onClick={logout}
                />
              </>
            ) : (
              <>
                <NavItem
                  icon={<LoginRoundedIcon />}
                  label="Login"
                  selected={location.pathname === '/login'}
                  onClick={() => handleListItemClick('/login')}
                />
                <NavItem
                  icon={<PersonAddAltRoundedIcon />}
                  label="Create Account"
                  selected={location.pathname === '/signup'}
                  onClick={() => handleListItemClick('/signup')}
                />
              </>
            )}
          </List>
        </Stack>
      </SwipeableDrawer>
    </>
  );
};

export default Nav;

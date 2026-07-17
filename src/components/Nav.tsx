import { AccountCircleRoundedIcon } from '@icons';
import { HomeRoundedIcon } from '@icons';
import { LoginRoundedIcon } from '@icons';
import { LogoutRoundedIcon } from '@icons';
import { PersonAddAltRoundedIcon } from '@icons';
import { RestaurantRoundedIcon } from '@icons';
import { SettingsApplicationsRoundedIcon } from '@icons';
import {
  Box,
  ActionIcon,
  Burger,
  Button,
  Divider,
  NavLink,
  Stack,
  Drawer,
  Group,
  Menu,
  useMantineTheme,
} from '@mantine/core';

import { useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import whiteLogo from '../images/white-logo.png';
import AuthenticationService from '../services/auth-service';

type NavItemProps = {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
};

const NavItem = ({ icon, label, selected, onClick }: NavItemProps) => {
  return (
    <NavLink
      onClick={onClick}
      active={selected}
      label={label}
      leftSection={icon}
    />
  );
};

const Nav = () => {
  const [open, setOpen] = useState(false);
  const isAuthenticated = AuthenticationService.authenticated();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();

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
    (openState: boolean) => (event: KeyboardEvent | MouseEvent) => {
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
      <Box
        component="header"
        style={{
          gridArea: 'header',
          height: 56,
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          background: theme.white,
        }}
      >
        <Group
          h="100%"
          justify="space-between"
          style={{
            height: 56,
            maxWidth: 1120,
            margin: '0 auto',
            padding: `0 ${theme.spacing.md}`,
          }}
        >
          <Box
            component="img"
            src={whiteLogo}
            alt="recipe stash"
            style={{
              height: 32,
              width: 'auto',
              cursor: 'pointer',
              display: 'block',
            }}
            onClick={() => navigate('/')}
          />
          <Group gap={5} visibleFrom="sm">
            {isAuthenticated ? (
              <>
                <Button variant="subtle" onClick={() => navigate('/')}>
                  Home
                </Button>
                <Button variant="subtle" onClick={() => navigate('/recipes')}>
                  Recipes
                </Button>
                <Button variant="subtle" onClick={() => navigate('/settings')}>
                  Settings
                </Button>
                <Menu shadow="md" position="bottom-end" withArrow>
                  <Menu.Target>
                    <ActionIcon
                      aria-label="Account menu"
                      color="gray"
                      variant="subtle"
                    >
                      <AccountCircleRoundedIcon />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown >
                    <Menu.Item
                      leftSection={<LogoutRoundedIcon />}
                      onClick={logout}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <>
                <Button variant="subtle" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="subtle" onClick={() => navigate('/signup')}>
                  Create Account
                </Button>
              </>
            )}
          </Group>
          <Burger
            hiddenFrom="sm"
            opened={open}
            size="sm"
            aria-label="Open navigation"
            onClick={toggleDrawer(!open)}
          />
        </Group>
      </Box>
      <Drawer position="left" opened={open} onClose={() => setOpen(false)}>
        <Stack>
          <Box
            component="img"
            src={whiteLogo}
            alt="recipe stash"
            style={{ height: '40px', width: 'fit-content' }}
          />

          <Stack gap={0}>
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
                <Divider />
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
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default Nav;

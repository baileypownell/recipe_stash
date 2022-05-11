import { Divider, List, ListItem, Typography } from '@material-ui/core'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import React, { useState } from 'react'
import { Link, NavLink, withRouter, RouteComponentProps } from 'react-router-dom'
import blackLogo from '../../images/black-logo.png'
import whiteLogo from '../../images/white-logo.png'
import AuthenticationService from '../../services/auth-service'
import './Nav.scss'

const Nav = (props: RouteComponentProps) => {
  const [open, setOpenState] = useState(false)
  const isAuthenticated = AuthenticationService.authenticated()
  const logout = async () => {
    try {
      await AuthenticationService.logout()
      AuthenticationService.setUserLoggedOut()
      setOpenState(false)
      props.history.push('/')
    } catch (err) {
      console.log(err)
    }
  }

  const navigate = (route: string) => {
    props.history.push(route)
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
          <div>
            { isAuthenticated
              ? <>
                  <NavLink to="/recipes" activeClassName="active">Recipes</NavLink>
                  <a onClick={toggleDrawer(!open)}><i className="fas fa-bars"></i></a>
              </>
              : <>
                  <NavLink to="/login" activeClassName="active">Login</NavLink>
                  <NavLink to="/signup" activeClassName="active">Sign Up</NavLink>
              </>
            }
          </div>
        </nav>
        <SwipeableDrawer
          anchor={'right'}
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          <div className="drawer-content">
            <img src={whiteLogo} alt="logo" />
            <List>
              <ListItem button onClick={() => navigate('/settings')}>
                <Typography variant="h6"><i className="fas fa-cogs"></i>Settings</Typography>
              </ListItem>
              <ListItem button onClick={() => navigate('/')}>
                <Typography variant="h6" ><i className="fas fa-house-user"></i>Home</Typography>
              </ListItem>
              <ListItem button onClick={() => navigate('/recipes')}>
                <Typography variant="h6"><i className="fas fa-utensils"></i>Recipes</Typography>
              </ListItem>
              <Divider />
              <ListItem button onClick={logout}>
                <Typography variant="h6"><i className="fas fa-arrow-right"></i>Logout</Typography>
              </ListItem>
            </List>
          </div>
        </SwipeableDrawer>
    </>
  )
}

export default withRouter(Nav)

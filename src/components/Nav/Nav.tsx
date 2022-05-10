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

  // doing this funcationally instead of setting the href, because for reasons unkown, the href was causing a hard refresh...
  const navigate = (e) => {
    props.history.push(e.target.id)
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
              <ListItem button onClick={navigate} id="/settings">
                <Typography variant="h6"><i className="fas fa-cogs"></i>Settings</Typography>
              </ListItem>
              <ListItem button onClick={navigate} id="/">
                <Typography variant="h6" ><i className="fas fa-house-user"></i>Home</Typography>
              </ListItem>
              <ListItem button onClick={navigate} id="/recipes">
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

import React from 'react'
import { NavLink, Link, withRouter } from 'react-router-dom'
import whiteLogo from '../../images/white-logo.png'
import blackLogo from '../../images/black-logo.png'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import './Nav.scss'
import AuthenticationService from '../../services/auth-service'
import { List, ListItem, Divider, Typography } from '@material-ui/core'

class Nav extends React.Component<null, any> {
  state = {
    open: false
  }

  logout = async () => {
    try {
      await AuthenticationService.logout()
      AuthenticationService.setUserLoggedOut()
      this.setState({ open: false })
      this.props.history.push('/')
    } catch (err) {
      console.log(err)
    }
  }

  // doing this funcationally instead of setting the href, because for reasons unkown, the href was causing a hard refresh...
  navigate = (e) => {
    this.props.history.push(e.target.id)
    this.setState({ open: false })
  }

  toggleDrawer = (openState) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    this.setState({ open: openState })
  }

  render () {
    const isAuthenticated = AuthenticationService.authenticated()

    return (
      <> 
        <nav>
            <Link to="/"><img src={blackLogo} alt="logo" /></Link>
            <div>
              { isAuthenticated
                ? <>
                    <NavLink to="/recipes" activeclassname="active">Recipes</NavLink>
                    <a onClick={this.toggleDrawer(!this.state.open)}><i className="fas fa-bars"></i></a>
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
            open={this.state.open}
            onClose={this.toggleDrawer(false)}
            onOpen={this.toggleDrawer(true)}
          >
            <div className="drawer-content">
              <img src={whiteLogo} alt="logo" />
              <List>
                <ListItem button onClick={this.navigate} id="/settings">
                  <Typography variant="h6"><i className="fas fa-cogs"></i>Settings</Typography>
                </ListItem>
                <ListItem button onClick={this.navigate} id="/">
                  <Typography variant="h6" ><i className="fas fa-house-user"></i>Home</Typography>
                </ListItem>
                <ListItem button onClick={this.navigate} id="/recipes">
                  <Typography variant="h6"><i className="fas fa-utensils"></i>Recipes</Typography>
                </ListItem>
                <Divider />
                <ListItem button onClick={this.logout}>
                  <Typography variant="h6"><i className="fas fa-arrow-right"></i>Logout</Typography>
                </ListItem>
              </List>
            </div>
          </SwipeableDrawer>
      </>
    )
  }
}

export default withRouter(Nav)

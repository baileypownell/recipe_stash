import React from 'react'
import { NavLink, Link, withRouter } from 'react-router-dom'
import whiteLogo from '../../images/white-logo.png'
import blackLogo from '../../images/black-logo.png'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import './Nav.scss'
import AuthenticationService from '../../services/auth-service'

class Nav extends React.Component<{isAuthenticated: boolean}, any> {
  state = {
    open: false
  }
  componentDidMount () {
    this.initializeSettingsDropdown()
  }

  initializeSettingsDropdown = () => {
    const elems = document.querySelectorAll('.sidenav')
    M.Sidenav.init(elems, {
      edge: 'right'
    })
  }

  logout = async () => {
    try {
      await AuthenticationService.logout()
      AuthenticationService.setUserLoggedOut()
      this.props.history.push('/')
    } catch (err) {
      console.log(err)
    }
  }

  // doing this funcationally instead of setting the href, because for reasons unkown, the href was causing a hard refresh... 
  navigate = (e) => {
    this.props.history.push(e.target.id)
  }

  toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({ open })
  }

  render () {
    const isAuthenticated = AuthenticationService.authenticated()

    return (
        <SwipeableDrawer
          anchor={'right'}
          open={this.state.open}
          onClose={this.toggleDrawer(false)}
          onOpen={this.toggleDrawer(true)}
        >
          <Link to="/"><img src={blackLogo} alt="logo" /></Link>

          <div className="icon">
               <img src={whiteLogo} alt="logo" />
             </div>
             <li><a className="waves-effect" onClick={this.navigate} id="/settings"><i className="fas fa-cogs"></i>Settings</a></li>
             <li><a className="waves-effect" onClick={this.navigate} id="/"><i className="fas fa-house-user"></i>Home</a></li>
             <li><a className="waves-effect" onClick={this.navigate} id="/recipes"><i className="fas fa-utensils"></i>Recipes</a></li>
             <li><div className="divider"></div></li>
             <li><a className="waves-effect" onClick={this.logout}><i className="fas fa-arrow-right"></i>Logout</a></li>
        </SwipeableDrawer>
    )
      })
    // return (
    //   <>
    //     <nav>
    //       <Link to="/"><img src={blackLogo} alt="logo" /></Link>
    //       <div>
    //         { isAuthenticated
    //           ? <>
    //               <NavLink to="/recipes" activeclassname="active">Recipes</NavLink>
    //               <a
    //                 activeclassname="active"
    //                 data-target="slide-out"
    //                 className="sidenav-trigger"><i className="fas fa-bars"></i>
    //               </a>
    //           </>
    //           : <>
    //               <NavLink to="/login" activeClassName="active">Login</NavLink>
    //               <NavLink to="/signup" activeClassName="active">Sign Up</NavLink>
    //           </>
    //         }
    //       </div>
    //     </nav>

    //     <ul id="slide-out" className="sidenav">
    //         <div className="icon">
    //           <img src={whiteLogo} alt="logo" />
    //         </div>
    //         <li><a className="waves-effect" onClick={this.navigate} id="/settings"><i className="fas fa-cogs"></i>Settings</a></li>
    //         <li><a className="waves-effect" onClick={this.navigate} id="/"><i className="fas fa-house-user"></i>Home</a></li>
    //         <li><a className="waves-effect" onClick={this.navigate} id="/recipes"><i className="fas fa-utensils"></i>Recipes</a></li>
    //         <li><div className="divider"></div></li>
    //         <li><a className="waves-effect" onClick={this.logout}><i className="fas fa-arrow-right"></i>Logout</a></li>
    //     </ul>
    //   </>
    // )
  }
}

export default withRouter(Nav)

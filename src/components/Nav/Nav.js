import React from 'react'
import { NavLink, Link } from "react-router-dom"
import whiteLogo from '../../images/white-logo.png'
import blackLogo from '../../images/black-logo.png'
import './Nav.scss';
import { withRouter } from "react-router-dom"
import AuthenticationService from '../../services/auth-service'

class Nav extends React.Component {

  state = {
    loggedIn: !!window.localStorage.getItem('user_logged_in')
  }

  async componentDidMount() {
    try {
      let authenticated = await AuthenticationService.verifyUserSession()
      let authState = authenticated.data.authenticated
      if (authState) {
        window.localStorage.setItem('user_logged_in', 'true')
      } else {
        window.localStorage.removeItem('user_logged_in')
      }
      this.setState({
        loggedIn: authState
      }, () => this.initializeSettingsDropdown())
    } catch(err) {
      console.log(err)
    }
    
    this.props.history.listen((location, action) => {
      this.setState({
        loggedIn: !!window.localStorage.getItem('user_logged_in')
      }, () => this.initializeSettingsDropdown())
    })
  }

  initializeSettingsDropdown = () => {
    const elems = document.querySelectorAll('.sidenav');
    const instances = M.Sidenav.init(elems, {
      edge: 'right'
    });
  }

  logout = async() => {
    try {
      await AuthenticationService.logout()
      AuthenticationService.setUserLoggedOut()
      this.props.history.push('/')
    } catch(err) {
      console.log(err)
    }
  }

  // doing this funcationally instead of setting the href, because for reasons unkown, the href was causing a hard refresh... 
  navigate = (e) => {
    this.props.history.push(e.target.id)
  }

  render() {
    return (
      <>
        <nav>
          <Link to="/"><img src={blackLogo} alt="logo" /></Link>
          <div>            
            { this.state.loggedIn ?
              <>
                  <NavLink to="/recipes" activeclassname="active">Recipes</NavLink>
                  <a 
                    activeclassname="active"
                    data-target="slide-out" 
                    className="sidenav-trigger"><i className="fas fa-bars"></i>
                  </a>
              </>
            : <>
                <NavLink to="/login" activeClassName="active">Login</NavLink>
                <NavLink to="/signup" activeClassName="active">Sign Up</NavLink>
              </>
            }
          </div>
        </nav>
    
        <ul id="slide-out" className="sidenav">
            <div className="icon">
              <img src={whiteLogo} alt="logo" />
            </div>
            <li><a className="waves-effect" onClick={this.navigate} id="/settings"><i className="fas fa-cogs"></i>Settings</a></li>
            <li><a className="waves-effect" onClick={this.navigate} id="/"><i className="fas fa-house-user"></i>Home</a></li>
            <li><a className="waves-effect" onClick={this.navigate} id="/recipes"><i className="fas fa-utensils"></i>Recipes</a></li>
            <li><div className="divider"></div></li>
            <li><a className="waves-effect" onClick={this.logout}><i className="fas fa-arrow-right"></i>Logout</a></li>
        </ul>
      </>
    )
  }
}

export default withRouter(Nav);

import React from 'react'
import { NavLink, Link } from "react-router-dom"
import icon from '../../images/apple-touch-icon.png'
import './Nav.scss';
import { withRouter } from "react-router-dom"
import AuthenticationService from '../../services/auth-service'
const axios = require('axios')

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
    const settingsDropdown = document.querySelector('#dropdown-trigger-settings')
    M.Dropdown.init(settingsDropdown, {})
  }

  logout = async() => {
    try {
      await axios.get('/logout')
      AuthenticationService.setUserLoggedOut()
      this.props.history.push('/')
    } catch(err) {
      console.log(err)
    }
  }

  render() {
    return (
        <nav>
          <Link to="/"><img src={icon} alt="logo" /></Link>
          <div>            
            { this.state.loggedIn ?
              <>
                  <NavLink to="/dashboard" activeclassname="active">Dashboard</NavLink>
                  <a activeclassname="active" id="dropdown-trigger-settings" data-target='settings-dropdown'><i className="fas fa-user-cog"></i></a> 
                  <ul id='settings-dropdown' className='dropdown-content'>
                    <li><a href="/settings">Settings</a></li>
                    <li><a onClick={this.logout}>Logout</a></li>
                  </ul>
              </>
            : <>
                <NavLink to="/login" activeClassName="active">Login</NavLink>
                <NavLink to="/signup" activeClassName="active">Sign Up</NavLink>      
              </>
            }
          </div>
        </nav>
    )
  }
}

export default withRouter(Nav);

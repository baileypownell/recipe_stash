import React from 'react'
import { NavLink, Link } from "react-router-dom"
import icon from '../../images/apple-touch-icon.png'
import './Nav.scss';
import { withRouter } from "react-router-dom"
const axios = require('axios')
import AuthContext from '../../auth-context'
class Nav extends React.Component {

  static contextType = AuthContext

  state = {
    loggedIn: !!(window.localStorage.getItem('user_logged_in'))
  }

  async componentDidMount() {
    let authenticated = await this.context.verifyUserSession()
    if (authenticated) {
      window.localStorage.setItem('user_logged_in', true)
    } else {
      window.localStorage.removeItem('user_logged_in')
    }
    this.setState({
      loggedIn: authenticated.data.authenticated
    }, this.initializeSettingsDropdown())
    this.props.history.listen(async(location, action) => {
      // console.log('authenticated.data.authenticated', authenticated.data.authenticated)
      let authState = authenticated.data.authenticated ?? !!(window.localStorage.getItem('user_logged_in'))
      console.log('authState = ', authState)
      // so this works until the user's session expires without them logging out 
      this.setState({
        loggedIn: authState
      }, this. initializeSettingsDropdown())
    })
  }

  initializeSettingsDropdown = () => {
    const settingsDropdown = document.querySelector('#dropdown-trigger-settings')
    M.Dropdown.init(settingsDropdown, {})
  }

  logout = async() => {
    try {
      await axios.get('/logout')
      this.context.setUserLoggedOut()
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

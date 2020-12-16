import React from 'react';
import { NavLink, Link } from "react-router-dom";
import icon from '../../images/apple-touch-icon.png';
import './Nav.scss';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
const axios = require('axios');

class Nav extends React.Component {

  componentDidMount() {
    // check if the state we received from Redux is in fact still accurate 
    axios.get(`/user`)
    .then((res) => {
      this.props.login()
    })
    .catch((err) => { 
      console.log(err)
      this.props.logout()
    })

    // initalize the settings dropdown 
    var elems = document.querySelectorAll('.dropdown-trigger-settings')
    M.Dropdown.init(elems, {})
  }

  logout = () => {
    axios.get('/logout')
    .then(() => {
      this.props.logout()
      this.props.history.push('/home')
    })
    .catch((err) => {
      console.log(err)
    })
  }

  render() {
    return (
        <nav>
          <Link to="/"><img src={icon} alt="logo" /></Link>
          <div>            
            { this.props.loggedIn ?
              <>
                  <NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink>
                  <a activeClassName="active" className="dropdown-trigger-settings" data-target='settings-dropdown'><i className="fas fa-user-cog"></i></a> 
                  {/* settings dropdown */}
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

const mapStateToProps = state => {
  return {
    loggedIn: state.loggedIn
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout()),
    login: () => dispatch(actions.login())
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Nav));

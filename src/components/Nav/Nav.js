import React from 'react';
import { NavLink, Link } from "react-router-dom";
import icon from '../../images/apple-touch-icon.png';
import './Nav.scss';
import RequireAuthComponent from '../RequireAuthComponent';
import { connect } from 'react-redux';
const axios = require('axios');

class Nav extends React.Component {

  render() {
    return (
        <nav>
          <Link to="/"><img src={icon} alt="logo" /></Link>
          <div>            
            { this.props.loggedIn ?
            <>
                <NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink>
                <NavLink to="/settings" activeClassName="active"><i className="fas fa-user-cog"></i></NavLink> 
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

export default connect(mapStateToProps)(Nav);

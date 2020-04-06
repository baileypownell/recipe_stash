import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink, Link, withRouter } from "react-router-dom";
import { connect } from 'react-redux';

import icon from '../../images/apple-touch-icon.png';
import './Nav.scss';

class Nav extends React.Component {
  render() {
    return (
        <nav>
          <Link to="/"><img src={icon} alt="logo" /></Link>
          <div>
            {this.props.userLoggedIn ?
              <>
              <NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink>
              <NavLink to="/settings" activeClassName="active"><i class="fas fa-user-cog"></i></NavLink> 
              </>  :
                <>
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
    userLoggedIn: state.userLoggedIn
  }
}

export default connect(mapStateToProps)(Nav);

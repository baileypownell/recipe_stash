import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink, Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';

import icon from '../../images/apple-touch-icon.png';
import './Nav.scss';

class Nav extends React.Component {
  render() {
    return (
        <nav>
          <Link to="/"><img src={icon} alt="logo" /></Link>
          <div>
            <NavLink to="/login" activeClassName="active">Login</NavLink>
            <NavLink to="/signup" activeClassName="active">Sign Up</NavLink>
          </div>
        </nav>
    )
  }
}

export default Nav;

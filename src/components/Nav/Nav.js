import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';

import icon from '../../images/apple-touch-icon.png';
import './Nav.scss';

class Nav extends React.Component {
  render() {
    return (
        <nav>
          <Link to="/"><img src={icon} alt="logo" /></Link>
          <div>
          <Link to="/createAccount">Login</Link>
          <Link to="/createAccount">Sign Up</Link>
          </div>
        </nav>
    )
  }
}

export default Nav;

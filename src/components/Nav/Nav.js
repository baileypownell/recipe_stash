import React from 'react';
import { NavLink, Link } from "react-router-dom";
import icon from '../../images/apple-touch-icon.png';
import './Nav.scss';
import RequireAuthComponent from '../RequireAuthComponent';
const axios = require('axios');

class Nav extends React.Component {

  state = {
    userAuthenticated: false
  }

  componentDidMount() {
    axios.get('/getUserId')
    .then((res) => 
        this.setState({
            userAuthenticated: !!res.data.userId
        })
    )
    .catch((err) => console.log(err))
  }


  render() {
    return (
        <nav>
          <Link to="/"><img src={icon} alt="logo" /></Link>
          <div>
            {/* I'm user the Auth HOC in addition to the ternary rendering below to prevent user's accessing routes that they aren't authenticated for. */}
            <RequireAuthComponent>
              < div>
                   <NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink>
                </div>
                <div>
                    <NavLink to="/settings" activeClassName="active"><i className="fas fa-user-cog"></i></NavLink> 
                </div>
            </RequireAuthComponent>
              
            { !this.state.userAuthenticated ?
                <>
                    <NavLink to="/login" activeClassName="active">Login</NavLink>
                    <NavLink to="/signup" activeClassName="active">Sign Up</NavLink>
                </>
            : null }

              
          </div>
        </nav>
    )
  }
}

export default Nav;

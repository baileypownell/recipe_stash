import React from 'react';

import './Login.scss';

class Login extends React.Component {
  render() {
    return (
      <div className="auth">
        <form>
          <h1>Login</h1>
          <label>
            Email
            <input type="email" name="email" />
          </label>
          <label>
            Password
            <input type="password" name="password" />
          </label>
          <button>Submit</button>
        </form>
      </div>
    )
  }
}

export default Login;

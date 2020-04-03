import React from 'react';

import './Signup.scss';

class Signup extends React.Component {
  render() {
    return (
      <div className="auth">

        <form>
          <h1>Signup</h1>
          <label>
            First Name
            <input type="text" name="name" />
          </label>
          <label>
            Email
            <input type="email" name="email" />
          </label>
          <label>
            Password
            <input type="password" name="password" />
          </label>
          <label>
            Confirm Password
            <input type="password" name="confirmpassword" />
          </label>
          <button>Submit</button>
        </form>
      </div>
    )
  }
}

export default Signup;

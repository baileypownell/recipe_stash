import React, { Component } from 'react'
const axios = require('axios')

const AuthContext = React.createContext({})

class AuthProvider extends Component {
    // Context state
    state = { }
  
    setUserLoggedOut = () => {
        window.localStorage.removeItem('user_logged_in')
    }

    setUserLoggedIn = () => {
        window.localStorage.setItem('user_logged_in', true);
    }

    verifyUserSession = async() => {
        return await axios.get('/auth')
    }
  
    render() {
      const { children } = this.props
      const { authState } = this.state
      const { setUserLoggedIn } = this
      const { setUserLoggedOut } = this
      const { verifyUserSession } = this
  
      return (
        <AuthContext.Provider
          value={{
            authState,
            setUserLoggedIn,
            setUserLoggedOut, 
            verifyUserSession
          }}
        >
          {children}
        </AuthContext.Provider>
      )
    }
  }
  
  export default AuthContext
  
  export { AuthProvider }
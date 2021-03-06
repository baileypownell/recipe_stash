import React, { Component } from 'react'
const axios = require('axios')

const AuthContext = React.createContext({})

class AuthProvider extends Component {
    // Context state
    state = { 
      userAuthenticated: true
    }
  
    setUserLoggedOut = () => {
        this.setState({
          userAuthenticated: false
        })
    }

    setUserLoggedIn = () => {
        this.setState({
          userAuthenticated: true
        })
    }

    verifyUserSession = async() => {
        return await axios.get('/auth')
    }
  
    render() {
      const { children } = this.props
      const { userAuthenticated } = this.state
      const { setUserLoggedIn } = this
      const { setUserLoggedOut } = this
      const { verifyUserSession } = this
  
      return (
        <AuthContext.Provider
          value={{
            userAuthenticated,
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
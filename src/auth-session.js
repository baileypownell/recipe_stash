const AuthenticationService = {
    setUserLoggedIn: () => {
        window.localStorage.setItem('user_logged_in', 'true')
    },

    setUserLoggedOut: () => {
        window.localStorage.removeItem('user_logged_in')
    }
}

export default AuthenticationService
import axios from 'axios'

const AuthenticationService = {
    setUserLoggedIn: () => {
        window.localStorage.setItem('user_logged_in', 'true')
    },

    setUserLoggedOut: () => {
        window.localStorage.removeItem('user_logged_in')
    },

    verifyUserSession: async() => {
        return await axios.get('/auth')
    }
}

export default AuthenticationService
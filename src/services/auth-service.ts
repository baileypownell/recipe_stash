import axios from 'axios'

const AuthenticationService = {
    setUserLoggedIn: (): void => {
        window.localStorage.setItem('user_logged_in', 'true')
    },

    setUserLoggedOut: (): void => {
        window.localStorage.removeItem('user_logged_in')
    },

    verifyUserSession: async() => {
        return await axios.get('/auth')
    },

    signInWithGoogle: async(tokenId: string): Promise<any> => {
        return await axios.post(`/signinWithGoogle`, {
            token: tokenId, 
        })
    }
}

export default AuthenticationService
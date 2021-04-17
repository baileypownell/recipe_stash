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
        return await axios.post(`/signin-with-google`, {
            token: tokenId, 
        })
    },

    signIn: async(password: string, email: string): Promise<any> => {
        return await axios.post(`/signin`, {
            password,
            email 
        })
    },

    logout: async(): Promise<any> => {
        return await axios.get('/logout') 
    },

    getPasswordResetLink: async(email: string): Promise<any> => {
        return await axios.post(`/send-reset-email`, { email })
    },

    updatePassword: async(password: string, token: string, email: string): Promise<any> => {
        let updatePasswordResult = await axios.put(`/user/reset-password`, {
            password,
            reset_password_token: token
        })
        let res = await AuthenticationService.signIn(password, email)
        if (res.data.success) {
            AuthenticationService.setUserLoggedIn()
        } 

        return updatePasswordResult
    }, 

    verifyEmailResetToken: async(token: string): Promise<any> => {
        return await axios.get(`/send-reset-email/${token}`)
    }
}

export default AuthenticationService
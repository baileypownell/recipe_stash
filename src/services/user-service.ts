import axios from 'axios'
import AuthenticationService from './auth-service'


export interface UserInputInterface {
    firstName: string
    lastName: string 
    password: string 
    email: string
}

// TO-DO: return types here (not just res.data.whatever)
const UserService = {
    getUser: async(): Promise<any> => {
        return await axios.get(`/user`)
    },

    updateUser: async(payload): Promise<any> => {
        return await axios.put(`/user`, payload)
    },

    deleteUser: async(): Promise<any> => {
        await axios.delete(`/user`)
        AuthenticationService.setUserLoggedOut()
        return 
    },

    createUser: async(userInput: UserInputInterface): Promise<any> => {
        return await axios.post(`/user`, userInput)
    }

}

export default UserService
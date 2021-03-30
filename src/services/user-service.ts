import axios from 'axios'
import AuthenticationService from './auth-service'


export interface UserInputInterface {
    firstName: string
    lastName: string 
    password: string 
    email: string
}

export interface UpdateUserNamePayload {
    first_name: string 
    last_name: string 
    id: string
}

export interface UpdateUserEmailPayload { 
    new_email: string 
    password: string
}

export interface UserData {
    email: string 
    firstName: string 
    lastName: string
}

export interface GenericResponse {
    success: boolean 
    message?: string
}

export interface UserCreatedResponse extends GenericResponse {
    sessionID: string 
    userData: {
        id: string 
        email: string 
        firstName: string 
        lastName: string 
    }
}

// TO-DO: return types here (not just res.data.whatever)
const UserService = {
    getUser: async(): Promise<UserData> => {
        let user = await axios.get(`/user`)
        return user.data.userData
    },

    updateUser: async(payload: UpdateUserNamePayload | UpdateUserEmailPayload): Promise<any> => {
        return await axios.put(`/user`, payload)
    },

    deleteUser: async(): Promise<GenericResponse> => {
        let deletion = await axios.delete(`/user`)
        AuthenticationService.setUserLoggedOut()
        return deletion.data
    },

    createUser: async(userInput: UserInputInterface): Promise<UserCreatedResponse> => {
        let newUser = await axios.post(`/user`, userInput)
        return newUser.data
    }

}

export default UserService
import axios from 'axios'
import AuthenticationService from './auth-service'

export interface UserInputInterface {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
}

export interface UpdateUserNamePayload {
  firstName: string;
  lastName: string;
  id: string;
}

export interface UpdateUserEmailPayload {
  newEmail: string;
  password: string;
}

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
}

export interface GenericResponse {
  success: boolean;
  message?: string;
}

export interface UserCreatedResponse extends GenericResponse {
  sessionID: string;
  userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// TO-DO: return types here
const UserService = {
  getUser: async (): Promise<UserData> => {
    const user = await axios.get('/user')
    return user.data.userData
  },

  updateUser: async (
    payload: UpdateUserNamePayload | UpdateUserEmailPayload
  ): Promise<any> => {
    return await axios.put('/user', payload)
  },

  deleteUser: async (): Promise<GenericResponse> => {
    const deletion = await axios.delete('/user')
    AuthenticationService.setUserLoggedOut()
    return deletion.data
  },

  createUser: async (
    userInput: UserInputInterface
  ): Promise<UserCreatedResponse> => {
    const newUser = await axios.post('/user', userInput)
    return newUser.data
  }
}

export default UserService

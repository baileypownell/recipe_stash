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
    userData: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
declare const UserService: {
    getUser: () => Promise<UserData>;
    updateUser: (payload: UpdateUserNamePayload | UpdateUserEmailPayload) => Promise<any>;
    deleteUser: () => Promise<GenericResponse>;
    createUser: (userInput: UserInputInterface) => Promise<UserCreatedResponse>;
};
export default UserService;

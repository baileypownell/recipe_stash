declare const AuthenticationService: {
    setUserLoggedIn: () => void;
    setUserLoggedOut: () => void;
    authenticated: () => boolean;
    verifyUserSession: () => Promise<any>;
    signInWithGoogle: (tokenId: string) => Promise<any>;
    signIn: (password: string, email: string) => Promise<any>;
    logout: () => Promise<any>;
    getPasswordResetLink: (email: string) => Promise<any>;
    updatePassword: (password: string, token: string, email: string) => Promise<any>;
    verifyEmailResetToken: (token: string) => Promise<any>;
};
export default AuthenticationService;

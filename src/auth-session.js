

export const setUserLoggedIn = (sessionID) => {
    window.localStorage.setItem('user_session_id', sessionID);
};

export const setUserLoggedOut = () => {
    window.localStorage.removeItem('user_session_id')
}

export const userLoginStatus = !!(window.localStorage.getItem('user_session_id'))
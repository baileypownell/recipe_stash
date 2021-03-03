

export const setUserLoggedIn = (sessionID) => {
    window.localStorage.setItem('user_logged_in', true);
};

export const setUserLoggedOut = () => {
    window.localStorage.removeItem('user_logged_in')
}

export const userLoginStatus = (window.localStorage.getItem('user_logged_in'))
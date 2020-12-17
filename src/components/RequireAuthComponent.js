import React from 'react';
import { Redirect } from "react-router-dom";
import axios from 'axios';

class RequireAuthComponent extends React.Component {

    state = {
        userAuthenticated: !!(window.localStorage.getItem('user_session_id'))
    }

    render() {
        const { userAuthenticated } = this.state
        return (
            <>
            {
                userAuthenticated ? this.props.children : <Redirect to="/login" />
            }   
            </>
            
        )
    }
}

export default RequireAuthComponent;
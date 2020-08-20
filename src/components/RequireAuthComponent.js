import React from 'react';
import { Redirect } from "react-router-dom";
import axios from 'axios';

class RequireAuthComponent extends React.Component {

    state = {
        userAuthenticated: false
    }

    componentDidMount() {
        axios.get('/getUserId')
        .then((res) => 
            this.setState({
                userAuthenticated: !!res.data.userId
            })
        )
        .catch((err) => console.log(err))
    }

    render() {
        const { userAuthenticated } = this.state
        return (
            <>
            {
                userAuthenticated ? this.props.children : <Redirect to="/auth" />
            }   
            </>
            
        )
    }
}

export default RequireAuthComponent;
import React from 'react'
import { Redirect } from "react-router-dom"
import AuthContext from '../auth-context'

class RequireAuthComponent extends React.Component {

    static contextType = AuthContext

    state = {
        userAuthenticated: this.context.userAuthenticated
    }

    render() {
        const { userAuthenticated } = this.state
        return ( userAuthenticated ? this.props.children : <Redirect to="/login" />  )
    }
}

export default RequireAuthComponent;
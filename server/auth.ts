const { Router } = require('express')
const router = Router()
import client from './client'

export interface AuthenticationState {
    authenticated: boolean
}

router.get('/', (request, response, next): AuthenticationState => {
    return client.query('SELECT user_uuid FROM session WHERE sid=$1', 
        [request.sessionID], 
        (err, res) => {
        if (err) return next(err)
        if (res.rows.length && res.rows[0].user_uuid) {
            let authState: AuthenticationState = {
                authenticated: true
            }
            return response.status(200).json(authState)
        } else {
            let authState: AuthenticationState = {
                authenticated: false
            }
            return response.status(200).json(authState)
        }
    })
})

export default router

import client from './client'
const { Router } = require('express')
const router = Router()

export interface AuthenticationState {
    authenticated: boolean
}

router.get('/', (request, response, next): AuthenticationState => {
  return client.query('SELECT user_uuid FROM session WHERE sid=$1',
    [request.sessionID],
    (err, res) => {
      if (err) return next(err)
      if (res.rows.length && res.rows[0].user_uuid) {
        const authState: AuthenticationState = {
          authenticated: true
        }
        return response.status(200).json(authState)
      } else {
        const authState: AuthenticationState = {
          authenticated: false
        }
        return response.status(200).json(authState)
      }
    })
})

export default router

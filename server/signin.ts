import { Router } from 'express'
import client from './client'
const bcrypt = require('bcryptjs')
const router = Router()

router.post('/', (request: any, response, next) => {
  const { password, email } = request.body
  if (!password || !email) {
    return response.status(400).json({ success: false, message: 'Insufficient or invalid credentials provided.' })
  }
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err) return next(err)
      if (res.rows.length) {
        let first_name, last_name, user_uuid
        first_name = res.rows[0].first_name
        last_name = res.rows[0].last_name
        user_uuid = res.rows[0].user_uuid
        const hashedPassword = res.rows[0].password
        bcrypt.compare(password, hashedPassword, (err, res) => {
          if (err) return next(err)
          if (res) {
            // request.session.regenerate(() => {
            request.session.save()
            const sessionIdentifier = request.sessionID
            // update the session table with the user's sessionID
            client.query('UPDATE session SET user_uuid=$1 WHERE sid=$2',
              [user_uuid, sessionIdentifier],
              (err, res) => {
                if (err) return next(err)
                if (res.rowCount) {
                  return response.status(200).json({
                    success: true,
                    sessionID: sessionIdentifier,
                    userData: {
                      id: user_uuid,
                      first_name: first_name,
                      last_name: last_name,
                      email: email
                    }
                  })
                } else {
                  console.log(`There was an error: No user found to update with SID: ${sessionIdentifier}`)
                  return response.status(500).json({ error: 'There was an error.' })
                }
              })
            // })
          } else {
            return response.status(403).json({ error: 'User could not be authenticated.' })
          }
        })
      } else {
        return response.status(403).json({ error: 'Password or email is incorrect.' })
      }
    })
})

export default router

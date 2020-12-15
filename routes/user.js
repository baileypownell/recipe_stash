const { Router } = require('express')
const client = require('../db')
const router = Router()
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs')
const authMiddleware = require('./authMiddleware')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

router.get('/', authMiddleware, (request, response, next) => {
  let userId = request.userID
  client.query('SELECT email, first_name, last_name FROM users WHERE id=$1',
  [userId],
   (err, res) => {
    if (err) return next(err)
    if (res.rows.length) {
      response.status(200).json({
        success: true, 
        userData: {
          email: res.rows[0].email, 
          firstName: res.rows[0].first_name, 
          lastName: res.rows[0].last_name
        }
      })
    } else {
      response.status(500)
    }
  })
})

router.post('/', (request, response, next) => {
  const { firstName, lastName, password, email } = request.body;
  let hashedPassword = bcrypt.hashSync(password, 10);
  // make sure user doesn't already exist in the DB
  client.query('SELECT * FROM users WHERE email=$1', [email], 
  (err, res) => {
    if (err) return next(err)
    if (res.rows.length >= 1) {
      return response.status(403).send({error: 'An account already exists for this email.'})
    } else {
      // if user doesn't exist already, create them:
      client.query('INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
      [firstName, lastName, hashedPassword, email],
       (err, res) => {
        if (err) return next(err);
        if (res) {
          client.query('SELECT * FROM users WHERE email=$1',
          [email],
          (err, res) => {
            if (err) return next(err)
            if (res.rows.length) {
              let id=res.rows[0].id;
              let email=res.rows[0].email;
              let firstName=res.rows[0].first_name;
              let lastName=res.rows[0].last_name;
              request.session.save()
              return response.status(201).json({
                success: true, 
                message: 'User created', 
                userData: {
                  id: id, 
                  email: email, 
                  firstName: firstName, 
                  lastName: lastName
                }
              })
            }
          })
        } 
      })
    }
  })
})

router.put('/reset-password', (request, response, next) => {
  const { reset_password_token, password } = request.body 
  if (password && reset_password_token) {
    client.query('SELECT * FROM users where reset_password_token=$1',
    [reset_password_token],
    (err, res) => {
      if (err) return next(err)
      if (res.rows.length) {
        let userId = res.rows[0].id
        // hash new password 
        let hashedPassword = bcrypt.hashSync(password, 10);
        client.query('UPDATE users SET password=$1, reset_password_expires=$2, reset_password_token=$3 WHERE reset_password_token=$4',
        [hashedPassword, null, null, reset_password_token],
        (err, res) => {
          if (err) return next(err)
          if (res) {
            // TO-DO: regenerate the session
            return response.status(200).json({success: true, message: 'Password updated.'});
          } else {
            return response.status(500).json({success: false, message: 'Could not update password.'})
          }
        })
      } else {
        return response.status(400).json({ success: false, message: 'Reset password token not found.' })
      }
    })
  } 
})

router.put('/', authMiddleware, (request, response, next) => {
  const { first_name, last_name, password, new_email } = request.body
  let userId = request.userID
  if ( first_name && last_name ) {
      client.query('UPDATE users SET first_name=$1, last_name=$2 WHERE id=$3',
      [first_name, last_name, userId],
      (err, res) => {
        if (err) return next(err)
        if (res.rows) {
          return response.status(200).json({ success: true })
        } else {
          return response.status(500).json({success: false, message: 'User could not be updated.'})
        }
      })
  } 
  if (new_email) {
      // make sure password is correct, if not, reject
      client.query('SELECT * FROM users WHERE id=$1',
        [userId],
        (err, res) => {
          if (err) return next(err)
          let hashedPassword = res.rows[0].password;
          let oldEmail = res.rows[0].email;
          bcrypt.compare(password, hashedPassword, (err, res) => {
            if (err) return next(err)
            if (res) {
              // update record in DB
              // but first ensure it is unique!
              client.query('SELECT * FROM users WHERE email=$1', 
              [new_email], 
              (err, res) => {
                if (err) return next(err)
                if (res.rows.length) {
                  return response.status(200).json({
                    success: false,
                    message: 'Email is not unique.'
                  })
                } else {
                  client.query('UPDATE users SET email=$1 WHERE id=$2',
                  [new_email, userId],
                  (err, res) => {
                    if (err) return next(err);
                    if (res) {
                      // then send notification to the old email
                      const options = {
                        auth: {
                          api_key: `${process.env.SENDGRID_API_KEY}`
                        }
                      }
                      const mailer = nodemailer.createTransport(sgTransport(options))
                      const email = {
                        from: 'virtualcookbook@outlook.com',
                        to: `${oldEmail}`,
                        subject: 'Your Email Address Has Been Changed',
                        html: `<h1>Virtual Cookbook</h1><p>The email address for your Virtual Cookbook account has been recently updated. This message is just to inform you of this update for security purposes; you do not need to take any action.</p> \n\n <p>Next time you login, you'll need to use your updated email address.\n</p>`
                      }
                      mailer.sendMail(email, function(err, res) {
                        if (err) {
                          response.status(500).json({ success: false, message: 'There was an error sending the email.'})
                        } else {
                            return response.status(200).json({
                              success: true,
                              message: 'Email successfully updated.'
                            })
                          }
                      })
                    };
                  })
                }
              })
            } else {
              return response.status(403).json({
                success: false,
                message: 'There was an error.'
              })
            }
          })
        })
  } 
})

router.delete('/', authMiddleware, (request, response, next) => {
  let id = request.userID
  client.query('DELETE FROM users WHERE id=$1',
  [id],
    (err, res) => {
    if (err) return next(err)
    if (res) {
      client.query('DELETE FROM recipes WHERE user_id=$1',
      [id],
      (err, res) => {
        if (err) return next(err)
        if (res) {
            // TO-DO: regenerate the session
            return response.status(200).json({success: true})
        } else {
          return response.status(500)
        }
      })
    } 
  })
})

module.exports = router;
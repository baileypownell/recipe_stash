const { Router } = require('express');
const client = require('../db');
const router = Router();
const nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const bcrypt = require('bcryptjs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

router.get('/', (request, response, next) => {
  client.query('SELECT * FROM users', (err, res) => {
    if (err) {
      console.log(err)
      return next(err)
    };
    response.status(200).json(res.rows);
  });
});

router.get('/:email', (request, response, next) => {
  const { email } = request.params;
  client.query('SELECT * FROM users WHERE email=$1',
  [email],
  (err, res) => {
    if (err) return next(err);
    response.status(200).send(res);
  });
});

router.post('/', (request, response, next) => {
  const { firstName, lastName, password, email } = request.body;
  let hashedPassword = bcrypt.hashSync(password, 10);
  client.query('INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
  [firstName, lastName, hashedPassword, email],
   (err, res) => {
    if (err) return next(err);
    if (res) {
      client.query('SELECT * FROM users WHERE email=$1',
      [email],
      (err, res) => {
        if (err) {
          next(err);
          return response.status(500).json({success: false, message: 'did not connect'})
        }
        if (res.rows[0]) {
          let id=res.rows[0].id;
          let email=res.rows[0].email;
          let firstName=res.rows[0].first_name;
          let lastName=res.rows[0].last_name;
          request.session.userId = id;
          request.session.save();
          return response.json({id: id, email: email, firstName: firstName, lastName: lastName})
        }
      })
    } else {
      return response.status(200).json({success: false, message: 'could not insert into DB'})
    }
  });
});

router.put('/', (request, response, next) => {
  const { email, reset_password_token, first_name, last_name, password, new_email } = request.body;
  let userId = request.session.userId;
  if (userId || request.session) {
    if ( first_name && last_name ) {
      if (first_name) {
        client.query('UPDATE users SET first_name=$1, last_name=$2 WHERE id=$3',
        [first_name, last_name, userId],
        (err, res) => {
          if (err) {
            console.log(err)
            return next(err);
          }
          if (res.rows) {
            return response.status(200).json({res})
          } else {
            return response.status(500).json({success: false, message: 'could not update first name'})
          }
        });
      }
    } else if (last_name) {
        client.query('UPDATE users SET last_name=$1 WHERE id=$2',
        [ last_name, userId],
          (err, res) => {
          if (err) {
            console.log(err)
            return next(err);
          }
          if (res) {
            return response.status(200).json({res})
          } else {
            return response.status(500).json({success: false, message: 'could not update last name'})
          }
        });
    } else if (first_name) {
      client.query('UPDATE users SET first_name=$1 WHERE id=$2',
        [ first_name, userId],
          (err, res) => {
          if (err) {
            console.log(err)
            return next(err);
          }
          if (res) {
            return response.status(200).json({res})
          } else {
            return response.status(500).json({success: false, message: 'could not update last name'})
          }
        });
    } else if (new_email) {
      // make sure password is correct, if not, reject
      client.query('SELECT * FROM users WHERE id=$1',
        [userId],
        (err, res) => {
          if (err) {
            return next(err);
          }
          let hashedPassword = res.rows[0].password;
          let oldEmail = res.rows[0].email;
          bcrypt.compare(password, hashedPassword, (err, res) => {
            if (err) {
              console.log(err)
              return next(err);
            }
            if (res) {
              // update record in DB
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
                      console.log(err)
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
            } else {
              return response.status(403).json({
                success: false,
                message: 'There was an error.'
              })
            }
          })
        })
    } else if (password) {
        client.query('SELECT * FROM users where reset_password_token=$1',
        [reset_password_token],
        (err, res) => {
          if (err) {
            return next(err);
          }
          if (res) {
            let userId = res.rows[0].id;
            // hash new password 
            let hashedPassword = bcrypt.hashSync(password, 10);
            client.query('UPDATE users SET password=$1, reset_password_expires=$2, reset_password_token=$3 WHERE reset_password_token=$4',
            [hashedPassword, null, null, reset_password_token],
            (err, res) => {
              if (err) {
                return next(err);
              }
              if (res) {
                //then login the user, set session
                request.session.regenerate(() => {
                  request.session.userId = userId;
                  request.session.save();
                  return response.status(200).json({success: true, message: 'Password updated.'});
                })
              } else {
                return response.status(500).json({success: false, message: 'Could not update password.'})
              }
            });
          }
        })
    } 
  } else {
    return response.status(403).json({success: false, message: 'No session for the user.'})
  }
});

module.exports = router;

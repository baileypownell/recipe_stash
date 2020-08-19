const { Router } = require('express');
const client = require('../db');
const router = Router();
const nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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
  console.log('email = ', email);
  client.query('SELECT * FROM users WHERE email=$1',
  [email],
  (err, res) => {
    if (err) return next(err);
    response.status(200).send(res);
  });
});

router.post('/', (request, response, next) => {
  const { firstName, lastName, password, email } = request.body;
  client.query('INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
  [firstName, lastName, password, email],
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
          return response.json({id: id, email: email, firstName: firstName, lastName: lastName})
        }
      })
    } else {
      return response.status(200).json({success: false, message: 'could not insert into DB'})
    }
  });
});

router.put('/', (request, response, next) => {
  const { email, first_name, last_name, id, password, new_email } = request.body;
  console.log('session.userId ', request.session.userId)
  if ( first_name && last_name ) {
    client.query('UPDATE users SET first_name=$1, last_name=$2 WHERE id=$3',
    [first_name, last_name, id],
     (err, res) => {
      if (err) {
        console.log(err)
        return next(err);
      }
      if (res) {
        return response.status(200).json({res})
      } else {
        return response.status(500).json({success: false, message: 'could not update DB'})
      }
    });
  } else if (new_email) {
    // make sure password is correct, if not, reject
    client.query('SELECT * FROM users WHERE id=$1',
      [id],
      (err, res) => {
        if (err) {
          return next(err);
        }
        let hashedPassword = res.rows[0].password;
        let oldEmail = res.rows[0].email;
        bcrypt.compare(password, hashedPassword, (err, res) => {
          if (err) {
            return next(err);
          }
          if (res) {
            // update record in DB
            client.query('UPDATE users SET email=$1 WHERE id=$2',
            [new_email, id],
            (err, res) => {
              if (err) return next(err);
              if (res) {
                // then send notification to the old email
                const transporter = nodemailer.createTransport(sgTransport({
                  service: 'SendGrid',
                  auth: {
                   api_user: `${process.env.SENDGRID_USERNAME}`,
                   api_key: `${process.env.SENDGRID_PASSWORD}`
                 }
               }));
                const mailOptions = {
                  from: 'virtualcookbook@outlook.com',
                  to: `${oldEmail}`,
                  subject: 'Your Email Address Has Been Changed',
                  html: `<h1>Virtual Cookbook</h1><p>The email address for your Virtual Cookbook account has been recently updated. This message is just to inform you of this update for security purposes; you do not need to take any action.</p> \n\n <p>Next time you login, you'll need to use your updated email address.\n</p>`
                };
                transporter.sendMail(mailOptions, (err, res) => {
                  if (err) {
                    response.status(500).json({ success: false, message: 'there was an error sending the email'})
                  } else {
                    return response.status(200).json({
                      success: true,
                      message: 'Email successfully updated'
                    })
                  }
                });
              };
            })

          } else {
            return response.status(500).json({
              success: false,
              message: 'Passwords do not match'
            })
          }
        })
      })
  } else if (password) {
      client.query('UPDATE users SET password=$1, reset_password_expires=$2, reset_password_token=$3 WHERE id=$4',
        [password, null, null, id],
         (err, res) => {
          if (err) {
            return next(err);
          }
          if (res) {
            return response.status(200).json({success: true})
          } else {
            return response.status(500).json({success: false, message: 'could not update DB'})
          }
        });
  }
});

router.delete('/:id', (request, response, next) => {
  const { id } = request.params;
    client.query('DELETE FROM users WHERE id=$1',
    [id],
     (err, res) => {
      if (err) {
        console.log(err)
        return next(err);
      }
      if (res) {
        return response.status(200).json({success: "true"})
      } else {
        return response.status(500).json({success: false, message: 'could not update DB'})
      }
    });
});


module.exports = router;

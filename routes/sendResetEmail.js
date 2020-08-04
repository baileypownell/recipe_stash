const { Router } = require('express');
const client = require('../db');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const router = Router();


router.post('/', (request, response, next) => {
  const { email } = request.body;
    client.query('SELECT * FROM users WHERE email=$1',
    [email],
     (err, res) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (res.rows[0] && res.rows[0].id) {
        // generate unique hash token
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = Date.now() + 3600000
        // store the token in the reset_password_token column of the users table
        // also store when it expires in the reset_password_expires column
        client.query('UPDATE users SET reset_password_token=$1, reset_password_expires=$2 WHERE email=$3',
        [token, expiration, email],
        (err, res) => {
          if (err) {
            console.log(err)
            return next(err)
          }
          if (res) {
            console.log(process.env.SENDGRID_PASSWORD, process.env.SENDGRID_USERNAME)

            // now create nodemailer transport, which is actually the account sending the password reset email link
              const transporter = nodemailer.createTransport(sgTransport({
                service: 'SendGrid',
                auth: {
                api_user: `${process.env.SENDGRID_USERNAME}`,
                api_key: `${process.env.SENDGRID_PASSWORD}`
              }
            }));
            const mailOptions = {
              from: 'virtualcookbook@outlook.com',
              to: `${email}`,
              subject: 'Reset Password Link',
              html: `<h1>Virtual Cookbook</h1><p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p> \n\n <a href="${process.env.PROJECT_URL}/reset/${token}" ><button style="cursor: pointer; background-color: #689943; color: white; font-size: 22px; outline: none; border: none; border-radius: 30px; padding: 20px; text-transform: uppercase; cursor: pointer!important;">Reset Password</button></a>\n\n <p>If you did not request this, please ignore this email and your password will remain unchanged.\n</p>`
            };
            transporter.sendMail(mailOptions, (err, res) => {
              if (err) {
                console.log('error = ', err)
                response.status(500).json({ success: false, message: 'there was an error sending the email', error: err.message, name: err.name})
              } else {
                return response.status(200).json('recovery email sent');
              }
            })
          }
      })
      } else {
        console.log('error', email)
        return response.status(500).json({success: false, message: 'could not update DB'})
      }
    });
  });


router.get('/:id/:token', (request, response, next) => {
  let token = request.params.token;
  let id = request.params.id;
  client.query('SELECT * FROM users WHERE id=$1',
  [id],
   (err, res) => {
    if (err) {
      return next(err);
    } else {
      let reset_password_token;
      let reset_password_expires;
      reset_password_token = res.rows[0].reset_password_token;
      reset_password_expires = res.rows[0].reset_password_expires;
      let now = Date.now();
      if ( ((reset_password_expires - now) < 3600000) && reset_password_token.toString() === token.toString()) {
        response.status(200).send({
          message: 'password reset link is valid'
        })
      } else {
        response.json({ message: 'the link is invalid or expired'})
      }
    }
  });
})

module.exports = router;

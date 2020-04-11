const { Router } = require('express');
const pool = require('../db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const router = Router();

router.post('/', (request, response, next) => {
  const { email } = request.body;
  if (email) {
    pool.query('SELECT * FROM users WHERE email=$1',
    [email],
     (err, res) => {
      if (err) {
        console.log(err)
        return next(err);
      }
      if (res.rows[0].id) {
        // generate unique hash token
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = Date.now() + 360000
        console.log(token);
        // store the token in the reset_password_token column of the users table
        // also store when it expires in the reset_password_expires column
        pool.query('UPDATE users SET reset_password_token=$1, reset_password_expires=$2 WHERE email=$3',
        [token, expiration, email],
        (err, res) => {
          if (err) console.log(err)
          if (res) {
            // now create nodemailer transport, which is actually the account sending the password reset email link
            const transporter = nodemailer.createTransport(smtpTransport({
              service: 'gmail',
              auth: {
                user: `${process.env.EMAIL_ADDRESS}`,
                pass: `${process.env.EMAIL_PASSWORD}`
              }
            }));
            const mailOptions = {
              from: 'bailey.pownell@gmail.com',
              to: `${email}`,
              subject: 'Reset Password Link',
              text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account. \n\n` + `Please click on the following link, or paste this into your browser to complete teh process within one hour of receiving it: \n\n` + `http://localhost:3001/reset/${token}\n\n` + `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            };
            console.log(mailOptions)
            transporter.sendMail(mailOptions, (err, response) => {
              if (err) {
                console.log('there was an error: ', err);
              } else {
                console.log('the response', response);
                res.status(200).json('recovery email sent');
                transporter.close();
              }
            })
            console.log(res);

          }
      })
        // return response.json({res})
      } else {
        return response.json({success: false, message: 'could not update DB'})
      }
    });
  } else {
      response.status(400).send('email required');
    }
  });

module.exports = router;

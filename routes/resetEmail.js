const { Router } = require('express');
const client = require('../db');
const nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const router = Router();

router.post('/', (request, response, next) => {
  // steps:
  // make sure password is correct, if not, reject
  const { new_email, id, password } = request.body;
  let hashedPassword;
  client.query('SELECT * FROM users WHERE id=$1',
    [id],
    (err, res) => {
      if (err) return next(err);
      let hashedPassword = res.rows[0].password;
      let oldPassword = res.rows[0].email;
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
                to: `${oldPassword}`,
                subject: 'Your Email Address Has Been Changed',
                html: `<h1>Virtual Cookbook</h1><p>The email address for your Virtual Cookbook account has been recently updated. This message is just to inform you of this update for security purposes; you do not need to take any action.</p> \n\n <p>Next time you login, you'll need to use your updated email address.\n</p>`
              };
              transporter.sendMail(mailOptions, (err, res) => {
                if (err) {
                  console.log('there was an error: ', err);
                  response.json({ success: false, message: 'there was an error sending the email'})
                } else {
                  return response.json({
                    success: true,
                    message: 'Email successfully updated'
                  })
                }
              });
            };
          })

        } else {
          return response.json({
            success: false,
            message: 'Passwords do not match'
          })
        }
      })
    })
});

module.exports = router;

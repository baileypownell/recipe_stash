import crypto from 'crypto';
import dotenv from 'dotenv';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { Resend } from 'resend';
import client from './client.js';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  dotenv.config();
}

router.post('/', (request: Request, response: Response, next: NextFunction) => {
  const { email } = request.body;
  if (!email) {
    return response
      .status(400)
      .json({ success: false, message: 'Invalid request sent.' });
  }
  const normalizedEmail = normalizeEmail(email);
  const token = crypto.randomBytes(20).toString('hex');
  const expiration = Date.now() + 3600000;

  client.query(
    `UPDATE users
    SET reset_password_token=$1, reset_password_expires=$2
    WHERE lower(email)=$3
    RETURNING email`,
    [token, expiration, normalizedEmail],
    async (err, res) => {
      if (err) return next(err);
      if (!res.rowCount) {
        return response.status(200).json({ success: true });
      }

      const { error } = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ??
          'Recipe Stash <onboarding@resend.dev>',
        to: res.rows[0].email,
        subject: 'Reset your Recipe Stash Password',
        html: `<h1>recipe stash</h1><p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p> \n\n <a href="${process.env.PROJECT_URL}reset/${token}" ><button>Reset Password</button></a>\n\n <p>If you did not request this, please ignore this email and your password will remain unchanged.\n</p>`,
      });
      if (error) {
        console.log('Error: ', error);
        return response.status(500).json({
          success: false,
          message: 'There was an error sending the email.',
          error: error.message,
          name: error.name,
        });
      }

      request.session.destroy((err) => {
        if (err) console.error(err);
      });
      return response.status(200).json({ success: true });
    },
  );
});

router.get(
  '/:token',
  (request: Request, response: Response, next: NextFunction) => {
    const token = request.params.token;
    client.query(
      'SELECT email, reset_password_token, reset_password_expires FROM users WHERE reset_password_token=$1',
      [token],
      (err, res) => {
        if (err) return next(err);
        if (
          res.rows.length &&
          res.rows[0].reset_password_token &&
          res.rows[0].reset_password_expires
        ) {
          const now = Date.now();
          if (res.rows[0].reset_password_expires > now) {
            return response.status(200).send({
              success: true,
              message: 'Password reset link is valid.',
              user_email: res.rows[0].email,
            });
          } else {
            return response
              .status(403)
              .send({ message: 'The token is expired.' });
          }
        } else {
          return response
            .status(403)
            .send({ message: 'No user could be found with that token.' });
        }
      },
    );
  },
);

export default router;

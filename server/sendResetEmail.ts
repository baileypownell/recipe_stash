import crypto from 'crypto';
import dotenv from 'dotenv';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { Resend } from 'resend';
import { passwordResetRateLimit } from './authRateLimit.js';
import client from './client.js';

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  dotenv.config();
}

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const hashResetToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');
const logServerError = (context: string, error: unknown) => {
  console.error(context, error);
};

router.post('/', passwordResetRateLimit, async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { email } = request.body;
  if (typeof email !== 'string') {
    return response
      .status(400)
      .json({ success: false, message: 'Invalid request sent.' });
  }
  const normalizedEmail = normalizeEmail(email);
  const token = crypto.randomBytes(20).toString('hex');
  const tokenHash = hashResetToken(token);
  const expiration = Date.now() + 3600000;

  try {
    const result = await client.query(
      `UPDATE users
      SET reset_password_token=$1, reset_password_expires=$2
      WHERE lower(email)=$3
      RETURNING email`,
      [tokenHash, expiration, normalizedEmail],
    );
    if (!result.rowCount) {
      return response.status(200).json({ success: true });
    }

    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        'Recipe Stash <onboarding@resend.dev>',
      to: result.rows[0].email,
      subject: 'Reset your Recipe Stash Password',
      html: `<h1>recipe stash</h1><p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p> \n\n <a href="${process.env.PROJECT_URL}reset/${token}" ><button>Reset Password</button></a>\n\n <p>If you did not request this, please ignore this email and your password will remain unchanged.\n</p>`,
    });
    if (error) {
      logServerError('send-reset-email POST / resend', error);
    }

    return response.status(200).json({ success: true, message: 'Password reset email sent.' });
  } catch (error) {
    logServerError('send-reset-email POST /', error);
    return next(error);
  }
});

router.get(
  '/:token',
  async (request: Request, response: Response, next: NextFunction) => {
    const token = request.params.token;
    if (typeof token !== 'string') {
      return response.status(400).json({
        success: false,
        message: 'Reset password token not found or expired.',
      });
    }

    const tokenHash = hashResetToken(token);
    try {
      const result = await client.query(
        `SELECT 1
        FROM users
        WHERE reset_password_token=$1
        AND reset_password_expires > $2`,
        [tokenHash, Date.now()],
      );
      if (!result.rowCount) {
        return response.status(400).json({
          success: false,
          message: 'Reset password token not found or expired.',
        });
      }

      return response.status(200).json({
        success: true,
        message: 'Password reset link is valid.',
      });
    } catch (error) {
      logServerError('send-reset-email GET /:token', error);
      return next(error);
    }
  },
);

export default router;

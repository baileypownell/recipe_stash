import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { Resend } from 'resend';
import {
  authenticationRateLimit,
  passwordResetRateLimit,
} from './authRateLimit.js';
import { authMiddleware } from './authMiddleware.js';
import { deleteAWSFiles } from './aws-s3.js';
import client from './client.js';

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  dotenv.config();
}

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const isValidEmail = (email: string) =>
  email.length <= 50 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidName = (name: unknown): name is string =>
  typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 50;
const isValidPassword = (password: unknown): password is string =>
  typeof password === 'string' &&
  password.length >= 8 &&
  Buffer.byteLength(password, 'utf8') <= 72 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);
const isUniqueViolation = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === '23505';
const logServerError = (context: string, error: unknown) => {
  console.error(context, error);
};

router.get(
  '/',
  authMiddleware,
  async (request: Request, response: Response, next: NextFunction) => {
    const userId = request.session.userID;
    try {
      const result = await client.query(
        'SELECT email, first_name, last_name FROM users WHERE user_uuid=$1',
        [userId],
      );
      const user = result.rows[0];
      if (!user) {
        return response.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      return response.status(200).json({
        success: true,
        userData: {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      });
    } catch (error) {
      logServerError('user GET /', error);
      return next(error);
    }
  },
);

router.post(
  '/',
  authenticationRateLimit,
  async (request: Request, response: Response, next: NextFunction) => {
    const { firstName, lastName, password, email } = request.body;

    if (
      !isValidName(firstName) ||
      !isValidName(lastName) ||
      !isValidPassword(password) ||
      typeof email !== 'string'
    ) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request sent.',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request sent.',
      });
    }

    try {
      await new Promise<void>((resolve, reject) => {
        request.session.regenerate((error) =>
          error ? reject(error) : resolve(),
        );
      });
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        `INSERT INTO users(first_name, last_name, password, email)
        VALUES($1, $2, $3, $4)
        RETURNING user_uuid, email, first_name, last_name`,
        [firstName.trim(), lastName.trim(), hashedPassword, normalizedEmail],
      );
      const user = result.rows[0];

      request.session.userID = user.user_uuid;
      return response.status(201).json({
        success: true,
        message: 'User created',
        userData: {
          id: user.user_uuid,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return response.status(409).json({
          success: false,
          message: 'An account already exists for this email.',
        });
      }
      logServerError('user POST /', error);
      return next(error);
    }
  },
);

router.put(
  '/reset-password',
  passwordResetRateLimit,
  async (request: Request, response: Response, next: NextFunction) => {
    const { reset_password_token, password } = request.body;

    if (
      !isValidPassword(password) ||
      typeof reset_password_token !== 'string' ||
      !reset_password_token
    ) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request sent.',
      });
    }

    try {
      const tokenHash = crypto
        .createHash('sha256')
        .update(reset_password_token)
        .digest('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        `UPDATE users
        SET password=$1, reset_password_expires=$2, reset_password_token=$3
        WHERE reset_password_token=$4
        AND reset_password_expires > $5
        RETURNING user_uuid`,
        [hashedPassword, null, null, tokenHash, Date.now()],
      );
      if (result.rowCount) {
        return response
          .status(200)
          .json({ success: true, message: 'Password updated.' });
      }

      return response.status(400).json({
        success: false,
        message: 'Reset password token not found or expired.',
      });
    } catch (error) {
      logServerError('user PUT /reset-password', error);
      return next(error);
    }
  },
);

router.put(
  '/',
  authMiddleware,
  async (request: Request, response: Response, next: NextFunction) => {
    const { firstName, lastName, password, newEmail } = request.body;
    const userId = request.session.userID;
    const wantsNameUpdate = firstName !== undefined || lastName !== undefined;
    const wantsEmailUpdate = newEmail !== undefined || password !== undefined;

    if (wantsNameUpdate && wantsEmailUpdate) {
      return response.status(400).json({
        success: false,
        message: 'Update name and email separately.',
      });
    }

    if (wantsNameUpdate) {
      if (!isValidName(firstName) || !isValidName(lastName)) {
        return response.status(400).json({
          success: false,
          message: 'Invalid request sent.',
        });
      }

      try {
        const result = await client.query(
          'UPDATE users SET first_name=$1, last_name=$2 WHERE user_uuid=$3',
          [firstName.trim(), lastName.trim(), userId],
        );
        if (!result.rowCount) {
          return response.status(404).json({
            success: false,
            message: 'User not found.',
          });
        }
        return response.status(200).json({ success: true });
      } catch (error) {
        logServerError('user PUT / update name', error);
        return next(error);
      }
    }

    if (
      typeof newEmail !== 'string' ||
      typeof password !== 'string' ||
      !wantsEmailUpdate
    ) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request sent.',
      });
    }

    const normalizedNewEmail = normalizeEmail(newEmail);
    if (!isValidEmail(normalizedNewEmail)) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request sent.',
      });
    }

    try {
      const userResult = await client.query(
        'SELECT password, email FROM users WHERE user_uuid=$1',
        [userId],
      );
      const user = userResult.rows[0];
      if (!user) {
        return response.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return response.status(403).json({
          success: false,
          message: 'Password is incorrect.',
        });
      }

      const updateResult = await client.query(
        'UPDATE users SET email=$1 WHERE user_uuid=$2',
        [normalizedNewEmail, userId],
      );
      if (!updateResult.rowCount) {
        return response.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      try {
        const { error } = await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL ??
            'Recipe Stash <onboarding@resend.dev>',
          to: user.email,
          subject: 'Your Email Address Has Been Changed',
          html: "<h1>recipe stash</h1><p>The email address for your recipe stash account has been recently updated. This message is just to inform you of this update for security purposes; you do not need to take any action.</p> \n\n <p>Next time you login, you'll need to use your updated email address.\n</p>",
        });
        if (error) {
          logServerError('user PUT / send email change notice', error);
        }
      } catch (error) {
        logServerError('user PUT / send email change notice', error);
      }

      return response.status(200).json({
        success: true,
        message: 'Email successfully updated.',
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return response.status(409).json({
          success: false,
          message: 'Email is not unique.',
        });
      }
      logServerError('user PUT / update email', error);
      return next(error);
    }
  },
);

router.delete(
  '/',
  authMiddleware,
  async (request: Request, response: Response, next: NextFunction) => {
    const id = request.session.userID;
    const transactionClient = await client.connect();
    let awsKeys: string[] = [];

    try {
      await transactionClient.query('BEGIN');
      const filesResult = await transactionClient.query(
        'SELECT key FROM files WHERE user_uuid=$1 FOR UPDATE',
        [id],
      );
      awsKeys = filesResult.rows.map((file) => file.key);

      const deleteResult = await transactionClient.query(
        'DELETE FROM users WHERE user_uuid=$1',
        [id],
      );
      if (!deleteResult.rowCount) {
        await transactionClient.query('ROLLBACK');
        return response.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      await transactionClient.query('COMMIT');
    } catch (error) {
      try {
        await transactionClient.query('ROLLBACK');
      } catch (rollbackError) {
        logServerError('user DELETE / rollback', rollbackError);
      }
      logServerError('user DELETE /', error);
      return next(error);
    } finally {
      transactionClient.release();
    }

    if (awsKeys.length) {
      try {
        await deleteAWSFiles(awsKeys);
      } catch (error) {
        logServerError('user DELETE / delete files', error);
      }
    }

    await new Promise<void>((resolve) => {
      request.session.destroy((error) => {
        if (error) logServerError('user DELETE / destroy session', error);
        resolve();
      });
    });
    response.clearCookie('connect.sid');
    return response.status(200).json({ success: true });
  },
);

export default router;

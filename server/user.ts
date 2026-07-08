import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { Resend } from 'resend';
import { authMiddleware } from './authMiddleware.js';
import { deleteAWSFiles } from './aws-s3.js';
import client from './client.js';
const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const logServerError = (context: string, error: unknown) => {
  console.error(context, error);
};

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  dotenv.config();
}

router.get(
  '/',
  authMiddleware,
  (request: Request, response: Response, next: NextFunction) => {
    const userId = request.session.userID;
    client.query(
      'SELECT email, first_name, last_name FROM users WHERE user_uuid=$1',
      [userId],
      (err, res) => {
        if (err) {
          logServerError('user GET /', err);
          return next(err);
        }
        if (res.rows.length) {
          const userData = {
            email: res.rows[0].email,
            firstName: res.rows[0].first_name,
            lastName: res.rows[0].last_name,
          };
          response.status(200).json({
            success: true,
            userData,
          });
        } else {
          response.status(500);
        }
      },
    );
  },
);

router.post('/', (request: Request, response: Response, next: NextFunction) => {
  const { firstName, lastName, password, email } = request.body;

  if (!firstName || !lastName || !password || !email) {
    return response.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  const normalizedEmail = normalizeEmail(email);
  const hashedPassword = bcrypt.hashSync(password, 10);
  client.query(
    'SELECT * FROM users WHERE lower(email)=$1',
    [normalizedEmail],
    (err, res) => {
    if (err) {
      logServerError('user POST / lookup', err);
      return next(err);
    }
    if (res.rows.length >= 1) {
      return response
        .status(403)
        .send({ error: 'An account already exists for this email.' });
    } else {
      // if user doesn't exist already, create them:
      client.query(
        'INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
        [firstName, lastName, hashedPassword, normalizedEmail],
        (err, res) => {
          if ((err as any)?.code === '23505') {
            return response
              .status(409)
              .json({ error: 'An account already exists for this email.' });
          }
          if (err) {
            logServerError('user POST / insert', err);
            return next(err);
          }
          if (res) {
            client.query(
              'SELECT * FROM users WHERE email=$1',
              [normalizedEmail],
              (err, res) => {
                if (err) {
                  logServerError('user POST / select inserted user', err);
                  return next(err);
                }
                if (res.rows.length) {
                  const user_uuid = res.rows[0].user_uuid;
                  const email = res.rows[0].email;
                  const firstName = res.rows[0].first_name;
                  const lastName = res.rows[0].last_name;

                  return response.status(201).json({
                    success: true,
                    message: 'User created',
                    userData: {
                      id: user_uuid,
                      email,
                      firstName,
                      lastName,
                    },
                  });
                }
              },
            );
          }
        },
      );
    }
    },
  );
});

router.put(
  '/reset-password',
  (request: Request, response: Response, next: NextFunction) => {
    const { reset_password_token, password } = request.body;

    if (!password || !reset_password_token) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request sent.',
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    client.query(
      `UPDATE users
      SET password=$1, reset_password_expires=$2, reset_password_token=$3
      WHERE reset_password_token=$4
      AND reset_password_expires > $5
      RETURNING user_uuid`,
      [hashedPassword, null, null, reset_password_token, Date.now()],
      (err, res) => {
        if (err) {
          logServerError('user PUT /reset-password', err);
          return next(err);
        }
        if (res.rowCount) {
          return response
            .status(200)
            .json({ success: true, message: 'Password updated.' });
        }

        return response.status(400).json({
          success: false,
          message: 'Reset password token not found or expired.',
        });
      },
    );
  },
);

router.put(
  '/',
  authMiddleware,
  (request: Request, response: Response, next: NextFunction) => {
    const { firstName, lastName, password, newEmail } = request.body;
    const userId = request.session.userID;

    if (newEmail && (firstName || lastName)) {
      return response.status(400).json({
        success: false,
        message: 'Update name and email separately.',
      });
    }

    if (firstName && lastName) {
      client.query(
        'UPDATE users SET first_name=$1, last_name=$2 WHERE user_uuid=$3',
        [firstName, lastName, userId],
        (err, res) => {
          if (err) {
            logServerError('user PUT / update name', err);
            return next(err);
          }
          if (res.rowCount) {
            return response.status(200).json({ success: true });
          } else {
            return response
              .status(500)
              .json({ success: false, message: 'User could not be updated.' });
          }
        },
      );
      return;
    }

    if (!newEmail || !password) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request sent.',
      });
    }

    const normalizedNewEmail = normalizeEmail(newEmail);
    client.query(
      'SELECT * FROM users WHERE user_uuid=$1',
    [userId],
      (err, res) => {
        if (err) {
          logServerError('user PUT / select current user', err);
          return next(err);
        }
        if (!res.rows.length) {
          return response.status(404).json({
            success: false,
            message: 'User not found.',
          });
        }

        const hashedPassword = res.rows[0].password;
        const oldEmail = res.rows[0].email;
        bcrypt.compare(password, hashedPassword, (err, res) => {
          if (err) {
            logServerError('user PUT / compare password', err);
            return next(err);
          }
          if (!res) {
            return response.status(403).json({
              success: false,
              message: 'There was an error.',
            });
          }

          client.query(
            'SELECT * FROM users WHERE lower(email)=$1',
            [normalizedNewEmail],
            (err, res) => {
              if (err) {
                logServerError('user PUT / check email uniqueness', err);
                return next(err);
              }
              if (res.rows.length) {
                return response.status(200).json({
                  success: false,
                  message: 'Email is not unique.',
                });
              }

              client.query(
                'UPDATE users SET email=$1 WHERE user_uuid=$2',
                [normalizedNewEmail, userId],
                async (err, res) => {
                  if ((err as any)?.code === '23505') {
                    return response.status(409).json({
                      success: false,
                      message: 'Email is not unique.',
                    });
                  }
                  if (err) {
                    logServerError('user PUT / update email', err);
                    return next(err);
                  }
                  if (!res.rowCount) {
                    return response.status(500).json({
                      success: false,
                      message: 'User could not be updated.',
                    });
                  }

                  const { error } = await resend.emails.send({
                    from:
                      process.env.RESEND_FROM_EMAIL ??
                      'Recipe Stash <onboarding@resend.dev>',
                    to: oldEmail,
                    subject: 'Your Email Address Has Been Changed',
                    html: "<h1>recipe stash</h1><p>The email address for your recipe stash account has been recently updated. This message is just to inform you of this update for security purposes; you do not need to take any action.</p> \n\n <p>Next time you login, you'll need to use your updated email address.\n</p>",
                  });
                  if (error) {
                    logServerError('user PUT / send email change notice', error);
                    return response.status(500).json({
                      success: false,
                      message: 'There was an error sending the email.',
                    });
                  }

                  return response.status(200).json({
                    success: true,
                    message: 'Email successfully updated.',
                  });
                },
              );
            },
          );
        });
      },
    );
  },
);

router.delete(
  '/',
  authMiddleware,
  (request: Request, response: Response, next: NextFunction) => {
    const id = request.session.userID;
    client.query(
      'SELECT key FROM files WHERE user_uuid=$1',
      [id],
      async (err, res) => {
        if (err) {
          logServerError('user DELETE / select files', err);
          return next(err);
        }
        if (res.rows.length) {
          const awsKeys = res.rows.map((val) => val.key);
          try {
            const awsDeletions = await deleteAWSFiles(awsKeys);
            if (awsDeletions) {
              client.query(
                'DELETE FROM users WHERE user_uuid=$1',
                [id],
                (err, res) => {
                  if (err) {
                    logServerError('user DELETE / delete user after files', err);
                    return next(err);
                  }
                  if (res) {
                    return response.status(200).json({ success: true });
                  } else {
                    return response.status(500);
                  }
                },
              );
            } else {
              return response.status(500).json({
                success: false,
                message: 'Could not delete user files.',
              });
            }
          } catch (err) {
            logServerError('user DELETE / delete files', err);
            return response.status(500).json({
              success: false,
              message: 'Could not delete user.',
            });
          }
        } else {
          client.query(
            'DELETE FROM users WHERE user_uuid=$1',
            [id],
            (err, res) => {
              if (err) {
                logServerError('user DELETE / delete user without files', err);
                return next(err);
              }
              if (res) {
                return response.status(200).json({ success: true });
              } else {
                return response.status(500);
              }
            },
          );
        }
      },
    );
  },
);

export default router;

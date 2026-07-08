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
        if (err) return next(err);
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  // make sure user doesn't already exist in the DB
  client.query('SELECT * FROM users WHERE email=$1', [email], (err, res) => {
    if (err) return next(err);
    if (res.rows.length >= 1) {
      return response
        .status(403)
        .send({ error: 'An account already exists for this email.' });
    } else {
      // if user doesn't exist already, create them:
      client.query(
        'INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
        [firstName, lastName, hashedPassword, email],
        (err, res) => {
          if (err) return next(err);
          if (res) {
            client.query(
              'SELECT * FROM users WHERE email=$1',
              [email],
              (err, res) => {
                if (err) return next(err);
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
  });
});

router.put(
  '/reset-password',
  (request: Request, response: Response, next: NextFunction) => {
    const { reset_password_token, password } = request.body;
    if (password && reset_password_token) {
      client.query(
        'SELECT * FROM users where reset_password_token=$1',
        [reset_password_token],
        (err, res) => {
          if (err) return next(err);
          if (res.rows.length) {
            // hash new password
            const hashedPassword = bcrypt.hashSync(password, 10);
            client.query(
              'UPDATE users SET password=$1, reset_password_expires=$2, reset_password_token=$3 WHERE reset_password_token=$4',
              [hashedPassword, null, null, reset_password_token],
              (err, res) => {
                if (err) return next(err);
                if (res) {
                  return response
                    .status(200)
                    .json({ success: true, message: 'Password updated.' });
                } else {
                  return response.status(500).json({
                    success: false,
                    message: 'Could not update password.',
                  });
                }
              },
            );
          } else {
            return response.status(400).json({
              success: false,
              message: 'Reset password token not found.',
            });
          }
        },
      );
    }
  },
);

router.put(
  '/',
  authMiddleware,
  (request: Request, response: Response, next: NextFunction) => {
    const { firstName, lastName, password, newEmail } = request.body;
    const userId = request.session.userID;
    if (firstName && lastName) {
      client.query(
        'UPDATE users SET first_name=$1, last_name=$2 WHERE user_uuid=$3',
        [firstName, lastName, userId],
        (err, res) => {
          if (err) return next(err);
          if (res.rows) {
            return response.status(200).json({ success: true });
          } else {
            return response
              .status(500)
              .json({ success: false, message: 'User could not be updated.' });
          }
        },
      );
    }
    if (newEmail) {
      client.query(
        'SELECT * FROM users WHERE user_uuid=$1',
        [userId],
        (err, res) => {
          if (err) return next(err);
          const hashedPassword = res.rows[0].password;
          const oldEmail = res.rows[0].email;
          bcrypt.compare(password, hashedPassword, (err, res) => {
            if (err) return next(err);
            if (res) {
              client.query(
                'SELECT * FROM users WHERE email=$1',
                [newEmail],
                (err, res) => {
                  if (err) return next(err);
                  if (res.rows.length) {
                    return response.status(200).json({
                      success: false,
                      message: 'Email is not unique.',
                    });
                  } else {
                    client.query(
                      'UPDATE users SET email=$1 WHERE user_uuid=$2',
                      [newEmail, userId],
                      async (err, res) => {
                        if (err) return next(err);
                        if (res) {
                          const { error } = await resend.emails.send({
                            from:
                              process.env.RESEND_FROM_EMAIL ??
                              'Recipe Stash <onboarding@resend.dev>',
                            to: oldEmail,
                            subject: 'Your Email Address Has Been Changed',
                            html: "<h1>recipe stash</h1><p>The email address for your recipe stash account has been recently updated. This message is just to inform you of this update for security purposes; you do not need to take any action.</p> \n\n <p>Next time you login, you'll need to use your updated email address.\n</p>",
                          });
                          if (error) {
                            return response.status(500).json({
                              success: false,
                              message: 'There was an error sending the email.',
                              error: error.message,
                              name: error.name,
                            });
                          }

                          return response.status(200).json({
                            success: true,
                            message: 'Email successfully updated.',
                          });
                        }
                      },
                    );
                  }
                },
              );
            } else {
              return response.status(403).json({
                success: false,
                message: 'There was an error.',
              });
            }
          });
        },
      );
    }
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
        if (err) return next(err);
        if (res.rows.length) {
          const awsKeys = res.rows.map((val) => val.key);
          try {
            const awsDeletions = await deleteAWSFiles(awsKeys);
            if (awsDeletions) {
              client.query(
                'DELETE FROM users WHERE user_uuid=$1',
                [id],
                (err, res) => {
                  if (err) return next(err);
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
            return response.status(500).json({ success: false, message: err });
          }
        } else {
          client.query(
            'DELETE FROM users WHERE user_uuid=$1',
            [id],
            (err, res) => {
              if (err) return next(err);
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

import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import client from './client.js';
const router = Router();
const normalizeEmail = (email: string) => email.trim().toLowerCase();

router.post('/', (request: Request, response: Response, next: NextFunction) => {
  const { password, email } = request.body;
  if (!password || !email) {
    return response.status(400).json({
      success: false,
      message: 'Insufficient or invalid credentials provided.',
    });
  }
  const normalizedEmail = normalizeEmail(email);
  client.query(
    'SELECT * FROM users WHERE lower(email)=$1',
    [normalizedEmail],
    (err, res) => {
      if (err) return next(err);
      if (res.rows.length) {
        const first_name = res.rows[0].first_name;
        const last_name = res.rows[0].last_name;
        const user_uuid = res.rows[0].user_uuid;
        const storedEmail = res.rows[0].email;
        const hashedPassword = res.rows[0].password;
        bcrypt.compare(
          password,
          hashedPassword,
          (err: Error | null, authenticated?: boolean) => {
            if (err) return next(err);
            if (authenticated) {
              return request.session.regenerate((err) => {
                if (err) return next(err);

                request.session.userID = user_uuid;
                return response.status(200).json({
                  success: true,
                  userData: {
                    id: user_uuid,
                    first_name: first_name,
                    last_name: last_name,
                    email: storedEmail,
                  },
                });
              });
            } else {
              return response
                .status(403)
                .json({ error: 'User could not be authenticated.' });
            }
          },
        );
      } else {
        return response
          .status(403)
          .json({ error: 'Password or email is incorrect.' });
      }
    },
  );
});

export default router;

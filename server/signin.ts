import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { authenticationRateLimit } from './authRateLimit.js';
import client from './client.js';
const router = Router();
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const dummyPasswordHash =
  '$2b$10$3.aTZe3YIdXyUKNScGuKHenoOKwGz9UeT3LIk7i3K0GhcZcFT9Hza';

router.post(
  '/',
  authenticationRateLimit,
  async (request: Request, response: Response, next: NextFunction) => {
    const { password, email } = request.body;
    if (typeof password !== 'string' || typeof email !== 'string') {
      return response.status(400).json({
        success: false,
        message: 'Insufficient or invalid credentials provided.',
      });
    }
    const normalizedEmail = normalizeEmail(email);
    try {
      const result = await client.query(
        `SELECT user_uuid, first_name, last_name, email, password
      FROM users
      WHERE lower(email)=$1`,
        [normalizedEmail],
      );
      const user = result.rows[0];
      const authenticated = await bcrypt.compare(
        password,
        user?.password ?? dummyPasswordHash,
      );

      if (!user || !authenticated) {
        return response.status(401).json({
          success: false,
          message: 'Password or email is incorrect.',
        });
      }

      return request.session.regenerate((err) => {
        if (err) return next(err);

        request.session.userID = user.user_uuid;
        return response.status(200).json({
          success: true,
          userData: {
            id: user.user_uuid,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          },
        });
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;

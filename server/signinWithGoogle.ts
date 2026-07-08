import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import client from './client.js';
const router = Router();

router.post('/', (request: Request, response: Response, next: NextFunction) => {
  const { token } = request.body;
  if (!token) {
    return response.status(400).json({
      success: false,
      message: 'Insufficient or invalid credentials provided.',
    });
  }
  const decodedToken = jwtDecode(token);
  client.query(
    'SELECT * FROM users WHERE email=$1',
    [(decodedToken as any).email],
    (err, res) => {
      if (err) return next(err);
      if (res.rows.length) {
        const user_uuid = res.rows[0].user_uuid;
        request.session.isAuthenticated = true;
        request.session.userID = user_uuid;
        return response.status(200).json({
          success: true,
        });
      } else {
        return response.status(404).json({ success: false });
      }
    },
  );
});

export default router;

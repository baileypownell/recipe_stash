import { Router } from 'express';
import client from './client';
const router = Router();
const jwt_decode = require('jwt-decode');

router.post('/', (request: any, response, next) => {
  const { token } = request.body;
  if (!token) {
    return response.status(400).json({
      success: false,
      message: 'Insufficient or invalid credentials provided.',
    });
  }
  const decodedToken = jwt_decode(token);
  client.query(
    'SELECT * FROM users WHERE email=$1',
    [decodedToken.email],
    (err, res) => {
      if (err) return next(err);
      if (res.rows.length) {
        const user_uuid = res.rows[0].user_uuid;
        // update the session table with the user's sessionID
        client.query(
          'UPDATE session SET user_uuid=$1 WHERE sid=$2',
          [user_uuid, request.sessionID],
          (err, res) => {
            if (err) return next(err);
            if (res.rowCount) {
              return response.status(200).json({
                success: true,
                sessionID: request.sessionID,
              });
            }
          },
        );
      } else {
        return response.status(404).json({ success: false });
      }
    },
  );
});

export default router;

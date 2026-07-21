import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { authenticationRateLimit } from './authRateLimit.js';
import client from './client.js';
const router = Router();
const normalizeEmail = (email: string) => email.trim().toLowerCase();

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
};

const verifyGoogleToken = async (token: string): Promise<string | null> => {
  const googleClientId = process.env.GOOGLE_LOGIN_CLIENT_ID;
  if (!googleClientId) {
    throw new Error('GOOGLE_LOGIN_CLIENT_ID is not configured.');
  }

  const tokenInfoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
    { signal: AbortSignal.timeout(5000) },
  );

  if (!tokenInfoResponse.ok) return null;

  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;
  if (
    tokenInfo.aud !== googleClientId ||
    (tokenInfo.email_verified !== true &&
      tokenInfo.email_verified !== 'true') ||
    !tokenInfo.email
  ) {
    return null;
  }

  return normalizeEmail(tokenInfo.email);
};

router.post('/', authenticationRateLimit, async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { token } = request.body;
  if (typeof token !== 'string') {
    return response.status(400).json({
      success: false,
      message: 'Insufficient or invalid credentials provided.',
    });
  }

  let email;
  try {
    email = await verifyGoogleToken(token);
  } catch (err) {
    return next(err);
  }

  if (!email) {
    return response.status(401).json({
      success: false,
      message: 'Google account could not be authenticated.',
    });
  }

  client.query(
    'SELECT * FROM users WHERE lower(email)=$1',
    [email],
    (err, res) => {
      if (err) return next(err);
      if (res.rows.length) {
        const user_uuid = res.rows[0].user_uuid;
        return request.session.regenerate((err) => {
          if (err) return next(err);

          request.session.userID = user_uuid;
          return response.status(200).json({
            success: true,
          });
        });
      } else {
        return response.status(401).json({
          success: false,
          message: 'Google account could not be authenticated.',
        });
      }
    },
  );
});

export default router;

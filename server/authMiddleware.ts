import type { NextFunction, Request, Response } from 'express';

export const authMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (request.session.userID) return next();

  return response.status(401).json({
    success: false,
    message: 'User unauthenticated',
  });
};

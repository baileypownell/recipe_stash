import type { NextFunction, Request, Response } from 'express';

export const authMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (request.session.isAuthenticated) {
    request.session.userID = request.session.userID;
    next();
  } else {
    request.session.error = 'Unauthenticated';
    return response.status(401).json({
      success: false,
      message: 'User unauthenticated',
    });
  }
};

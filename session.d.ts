import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userID: string;
    isAuthenticated: boolean;
    error: string;
  }
}

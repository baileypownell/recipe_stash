import 'express-session';

declare module 'express-session' {
  interface SessionData {
    error?: string;
    isAuthenticated?: boolean;
    userID?: string;
  }
}

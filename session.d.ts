import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userID: string;
    error: string;
  }
}

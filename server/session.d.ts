import 'express-session';

declare module 'express-session' {
  interface SessionData {
    error?: string;
    userID?: string;
  }
}

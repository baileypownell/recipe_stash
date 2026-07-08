import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import client from './client.js';
import routes from './index.js';

const app = express();
const pgSession = connectPgSimple(session);
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(
  session({
    store: new pgSession({
      pool: client,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'lax',
      secure: isProduction,
    },
  }),
);

app.use(express.json());
app.use('/', routes);
app.use(express.static('./dist'));

app.get('*splat', (_, res: Response) => {
  res.sendFile('index.html', { root: './dist/' });
});

app.use((err: unknown, _: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('project up on port', port);
});

export default app;

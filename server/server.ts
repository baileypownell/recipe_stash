import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import client from './client.js';
import routes from './index.js';

const app = express();
const pgSession = connectPgSimple(session);

app.use(express.json());

app.use((err: unknown, _: Request, res: Response, _2: NextFunction) => {
  res.json(err);
});

app.use(
  session({
    store: new pgSession({
      pool: client,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  }),
);

app.use('/', routes);
app.use(express.static('./dist'));

app.get('*splat', (_, res: Response) => {
  res.sendFile('index.html', { root: './dist/' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('project up on port', port);
});

export default app;

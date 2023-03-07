import bodyParser from 'body-parser';
import express, { Response } from 'express';
import session from 'express-session';
import client from './client';
import routes from './index';
const app = express();
const pgSession = require('connect-pg-simple')(session);

declare global {
  namespace Express {
    interface Request {
      session: any;
    }
  }
}

app.use(bodyParser.json());

app.use(express.json());

app.use((err, _, res, _2) => {
  res.json(err);
});

const environment = process.env.NODE_ENV || 'development';

let secret;
if (environment === 'development') {
  require('dotenv').config({
    path: './.env.development',
  });
  secret = 'skls2dk343lsdj43fl97865xkdk';
}

app.use(
  session({
    store: new pgSession({
      pool: client,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  }),
);

app.use('/', routes);

app.use(express.static('./dist'));

const port = process.env.PORT || 3000;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.get('*', (_, res: Response) => {
  res.sendFile('index.html', { root: './dist/' });
});

app.listen(port, () => {
  console.log('project up on port', port);
});

export default app;

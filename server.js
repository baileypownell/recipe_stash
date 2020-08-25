const path = require('path');
const express = require('express');
//const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes');
//import * as client from './db/index';
const client = require('./db/index');
var pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

// middleware
app.use(bodyParser.json());


app.use(express.json())

app.use((err, req, res, next) => {
  res.json(err);
});
// session cookies 
// do not store in memory
// store instead with connect-pg-simple
// CREATE TABLE "session" (
//   "sid" varchar NOT NULL COLLATE "default",
// 	"sess" json NOT NULL,
// 	"expire" timestamp(6) NOT NULL
// )
// WITH (OIDS=FALSE);

// ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

// CREATE INDEX "IDX_session_expire" ON "session" ("expire");
var environment = process.env.NODE_ENV || 'development';

// if (environment !== 'production') {
//   require('dotenv').config({
//     path: './.env.development'
//   });
// }

console.log(process.env.NODE_ENV, environment)

app.use(session({
  //store: new (require('connect-pg-simple')(session))(),
  store: new pgSession({
    pool: client, 
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000, secure: false } // 1 hour
}));



// must come last?
app.use('/', routes);


const port = process.env.PORT || 3000;


app.use(express.static(__dirname + '/dist'));

//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.listen(port, () => {
  console.log('project up on port', port)
})

module.exports = app;

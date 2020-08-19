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


app.use(session({
  //store: new (require('connect-pg-simple')(session))(),
  store: new pgSession({
    pool: client, 
    tableName: 'session'
  }),
  secret: '343ji43j4n3jn4jk3n', // put in environment variable in production
  genid: function(req) {
    return genuuid() // use UUIDs for session IDs
  },
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false } // 1 day
}));

// must come last?
app.use('/', routes);


const port = process.env.PORT || 3000;


app.use(express.static(__dirname + '/dist'));

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.listen(port, () => {
  console.log('project up on port', port)
})

module.exports = app;

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes');
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

var environment = process.env.NODE_ENV || 'development';

console.log(process.env.NODE_ENV, environment)

if (environment === 'development') {
  require('dotenv').config({
    path: './.env.development'
  })
}

app.use(session({
  store: new pgSession({
    pool: client, 
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000, secure: false } // 1 hour
}));

app.use('/', routes);


const port = process.env.PORT || 3000;


app.use(express.static(__dirname + '/dist'));

// because I'm too cheap to pay $7/month for TLS (never do this for legit app)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.get('*', (req, res) => {
  console.log(res)
  res.sendFile(__dirname + '/dist/index.html');
});

app.listen(port, () => {
  console.log('project up on port', port)
})

module.exports = app;

// import path from 'path'
import express from 'express'
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes');
const client = require('./client.js');
// var pg = require('pg'), 
var session = require('express-session'), 
pgSession = require('connect-pg-simple')(session);

// middleware
app.use(bodyParser.json());

app.use(express.json())

app.use((err, _, res, _2) => {
  res.json(err);
})

var environment = process.env.NODE_ENV || 'development';

let secret;
if (environment === 'development') {
  require('dotenv').config({
    path: './.env.development'
  })
  secret = 'skls2dk343lsdj43fl97865xkdk'
}

app.use(session({
  store: new pgSession({
    pool: client, 
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || secret, 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000, secure: false } // 1 hour
}));

app.use('/', routes);


const port = process.env.PORT || 3000;


app.use(express.static(__dirname + '/dist'))

// because I'm too cheap to pay $7/month for TLS (never do this for legit app)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0'

app.get('*', (_, res) => {
  res.sendFile(__dirname + '/dist/index.html')
});

app.listen(port, () => {
  console.log('project up on port', port)
})

module.exports = app;

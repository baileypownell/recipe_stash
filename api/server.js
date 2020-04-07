// const dotenv = require('dotenv');
// dotenv.config();


const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const app = express();
const routes = require('./routes');

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/', routes);


// const passport = require('passport');
// const passportJWT = require('passport-jwt');
// const JwtStrategy = passportJWT.Strategy;
// const ExtractJwt = passportJWT.ExtractJwt;
//
// const opts = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.SECRET_OR_KEY
// }
//
// const strategy = new JwtStrategy(opts, (payload, next) => {
//   const user = null;
//   next(null, user);
// });
// passport.use(strategy);
// app.use(passport.initialize());
app.use(express.json())

app.use((err, req, res, next) => {
  res.json(err);
});

const port = 3001;


app.listen(port, () => {
   console.log(`listening on port ${port}`)
 });

module.exports = app;

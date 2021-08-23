// import path from 'path'
import express, { Response } from 'express'
import bodyParser from 'body-parser'
import routes from './index'
import client from './client'
const app = express()
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

// middleware
app.use(bodyParser.json())

app.use(express.json())

app.use((err, _, res, _2) => {
  res.json(err)
})

const environment = process.env.NODE_ENV || 'development'

let secret
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
}))

app.use('/', routes)

app.use(express.static('./dist')) // this is key for serving up the bundle.js file and not the index.html file

const port = process.env.PORT || 3000

// because I'm too cheap to pay $7/month for TLS (never do this for legit app)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

app.get('*', (_, res: Response) => {
  res.sendFile('index.html', { root: './dist/' })
})

app.listen(port, () => {
  console.log('project up on port', port)
})

export default app

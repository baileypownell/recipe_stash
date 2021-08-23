const { Pool } = require('pg')
const user = 'node_user'
const host = 'localhost'
const password = 'node_password'
const database = 'visual_cookbook'
const port = 5432

// connecting to heroku db OR localhost
const { Client } = require("pg")

let client;
if (process.env.DATABASE_URL) {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });
} else {
  client = new Pool({
    user, host, database, password, port
  })
}

client.connect();

export default client

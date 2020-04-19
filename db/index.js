// node-postgres is a collection of node.js modules for interfacing with your PostgreSQL database. It has support for callbacks, promises, async/await, connection pooling, prepared statements, cursors, streaming results, C/C++ bindings, rich type parsing, and more
// node-postgres = 'pg'
// you need it to connect postgres DB to node application
// const { Pool } = require('pg');
// const user = process.env.USER;
// const host = process.env.HOST;
// const password = process.env.PASSWORD;
// const database = process.env.DATABASE;
// const port = process.env.PORT;
//
// const pool = new Pool({ user, host, database, password, port });
//
//
//
// module.exports = pool;

// connecting to heroku db
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

module.exports = client;

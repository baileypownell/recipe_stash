// node-postgres is a collection of node.js modules for interfacing with your PostgreSQL database. It has support for callbacks, promises, async/await, connection pooling, prepared statements, cursors, streaming results, C/C++ bindings, rich type parsing, and more
// node-postgres = 'pg'
// you need it to connect postgres DB to node application
const { Pool } = require('pg');
const {user, host, database, password, port } = require('../secrets/db_configuration');

const pool = new Pool({ user, host, database, password, port });



module.exports = pool;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require('pg');
const user = 'node_user';
const host = 'localhost';
const password = 'node_password';
const database = 'visual_cookbook';
const port = 5432;
const { Client } = require('pg');
let client;
if (process.env.DATABASE_URL) {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });
}
else {
    client = new Pool({
        user,
        host,
        database,
        password,
        port,
    });
}
client.connect();
exports.default = client;
//# sourceMappingURL=client.js.map
import { Pool } from 'pg';

const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.internal')
    ? false // internal Railway network, no SSL needed/available
    : { rejectUnauthorized: false }, // Railway public proxy + Heroku both need this
});

client.connect();

export default client;

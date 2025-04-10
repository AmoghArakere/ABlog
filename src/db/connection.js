import { Pool } from 'pg';
import dbConfig from './config';

// Create a connection pool
const pool = new Pool(dbConfig);

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  } else {
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

export default pool;

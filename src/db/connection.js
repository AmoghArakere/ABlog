// Import pg module and config
import dbConfig from './config';
import pkg from 'pg';
const { Pool } = pkg;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a connection pool only in server environment
let pool;

if (!isBrowser) {
  try {
    // Create the pool with the configuration
    // Neon requires SSL, which is already in the connection string
    pool = new Pool(dbConfig);

    // Test the connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Error connecting to PostgreSQL database:', err);
      } else {
        console.log('Connected to PostgreSQL database at:', res.rows[0].now);
      }
    });
  } catch (error) {
    console.error('Failed to initialize database pool:', error);
  }
}

export default pool;

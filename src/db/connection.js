// Import pg module and config
import dbConfig from './config';

// Create a dynamic import function that works in both ESM and CommonJS
const getPgPool = async () => {
  try {
    // Try ESM import
    const pg = await import('pg');
    return pg.Pool || pg.default.Pool;
  } catch (e) {
    // Fallback to CommonJS require
    try {
      const pg = require('pg');
      return pg.Pool;
    } catch (e) {
      console.error('Failed to import pg module:', e);
      throw e;
    }
  }
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a connection pool only in server environment
let pool;

// Initialize the pool asynchronously
const initPool = async () => {
  if (isBrowser) return;

  try {
    // Get the Pool constructor
    const Pool = await getPgPool();

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
};

// Initialize the pool
initPool();

export default pool;

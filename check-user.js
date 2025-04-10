// Script to check if a user exists in the Neon PostgreSQL database
import pkg from 'pg';
const { Pool } = pkg;

// Connection string for Neon PostgreSQL
const connectionString = 'postgresql://neondb_owner:npg_GPnTNBx0V7ZA@ep-dry-dew-a1gjtzo2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Create a PostgreSQL client
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUser() {
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Connected to database at:', testResult.rows[0].now);
    
    // Check if the user exists
    const result = await pool.query(`
      SELECT id, email, username, password FROM users WHERE email = $1
    `, ['test@example.com']);
    
    if (result.rows.length > 0) {
      console.log('User found:', {
        id: result.rows[0].id,
        email: result.rows[0].email,
        username: result.rows[0].username,
        passwordHash: result.rows[0].password.substring(0, 20) + '...' // Show only part of the hash for security
      });
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkUser();

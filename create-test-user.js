// Script to create a test user in the Neon PostgreSQL database
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';

// Connection string for Neon PostgreSQL
const connectionString = 'postgresql://neondb_owner:npg_GPnTNBx0V7ZA@ep-dry-dew-a1gjtzo2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Create a PostgreSQL client
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTestUser() {
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Connected to database at:', testResult.rows[0].now);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create a test user
    const result = await pool.query(`
      INSERT INTO users (email, password, username, full_name, avatar_url, bio, website, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE
      SET password = $2, full_name = $4, avatar_url = $5, bio = $6, website = $7, location = $8
      RETURNING id, email, username, full_name, avatar_url, bio, website, location
    `, [
      'test@example.com',
      hashedPassword,
      'testuser',
      'Test User',
      '/images/placeholder-profile.svg',
      'This is a test user account',
      'https://example.com',
      'Test Location'
    ]);
    
    console.log('Test user created successfully:', result.rows[0]);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createTestUser();

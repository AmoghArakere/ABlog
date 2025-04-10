// Netlify function to create a test user
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  // Check for authorization (you might want to add a secret key check here)
  
  try {
    // Create a connection to the database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('Connecting to database...');
    
    // Test the connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Connected to database at:', testResult.rows[0].now);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Create a test user
    console.log('Creating test user...');
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
    
    // Close the pool
    await pool.end();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Test user created successfully',
        user: result.rows[0]
      })
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

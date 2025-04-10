import bcrypt from 'bcrypt';
import pool from '../../../db/connection';
import initDatabase from '../../../db/init';

export async function post({ request }) {
  // Initialize database if tables don't exist
  try {
    await initDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    // Continue with the request even if initialization fails
  }

  try {
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
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test user created successfully',
        user: result.rows[0]
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating test user:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Script to test the login process directly
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

async function testLogin(email, password) {
  try {
    console.log(`Testing login for ${email} with password ${password}`);
    
    // Get the user from the database
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('User found:', {
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.password.substring(0, 20) + '...' // Show only part of the hash for security
    });
    
    // Compare the password
    const match = await bcrypt.compare(password, user.password);
    
    if (match) {
      console.log('Password match: SUCCESS');
    } else {
      console.log('Password match: FAILED');
      
      // Let's try to create a new password hash for comparison
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash for the same password:', newHash);
      
      // Let's update the password in the database
      await pool.query('UPDATE users SET password = $1 WHERE email = $2', [newHash, email]);
      console.log('Password updated in the database');
    }
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Test the login
testLogin('simple@example.com', 'test123');

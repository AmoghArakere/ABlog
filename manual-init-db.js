// Script to manually initialize the Neon PostgreSQL database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connection string for Neon PostgreSQL
const connectionString = 'postgresql://neondb_owner:npg_GPnTNBx0V7ZA@ep-dry-dew-a1gjtzo2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Create a PostgreSQL client
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Path to the schema file
const schemaPath = path.join(__dirname, 'src/db/schema.sql');

async function initializeDatabase() {
  try {
    console.log('Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Connecting to Neon PostgreSQL database...');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Connected to database at:', testResult.rows[0].now);
    
    console.log('Initializing database tables...');
    await pool.query(schema);
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();

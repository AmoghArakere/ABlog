import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './connection';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the schema file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize the database
async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Export the initialization function
export default initDatabase;

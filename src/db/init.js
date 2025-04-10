import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './connection';

// Get the directory name
// Determine the directory path in a way that works in both ESM and CommonJS
let dirPath;
try {
  // In ESM, import.meta.url is available
  const filePath = fileURLToPath(import.meta.url);
  dirPath = path.dirname(filePath);
} catch (e) {
  // In CommonJS or Netlify Functions, __filename is already defined
  dirPath = typeof __dirname !== 'undefined' ? __dirname : '.';
}

// Read the schema file
const schemaPath = path.join(dirPath, 'schema.sql');
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

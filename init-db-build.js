// Script to initialize the database during the build process
import initDatabase from './src/db/init.js';

console.log('Starting database initialization during build...');

// Initialize the database
initDatabase()
  .then(() => {
    console.log('Database initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error initializing database during build:', error);
    process.exit(1);
  });

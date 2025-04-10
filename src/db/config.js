// Database configuration
let dbConfig;

// Check if DATABASE_URL environment variable exists
if (process.env.DATABASE_URL) {
  // Use the connection string directly
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
  };
} else {
  // Use the Neon PostgreSQL connection string for development
  dbConfig = {
    connectionString: 'postgresql://neondb_owner:npg_GPnTNBx0V7ZA@ep-dry-dew-a1gjtzo2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
      rejectUnauthorized: false
    }
  };
}

export default dbConfig;

import initDatabase from '../../src/db/init';

export async function handler(event, context) {
  try {
    // Initialize the database
    await initDatabase();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Database initialized successfully' 
      })
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred' 
      })
    };
  }
}

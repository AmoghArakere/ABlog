import initDatabase from '../../db/init';

export async function get() {
  try {
    // Initialize the database
    await initDatabase();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database initialized successfully' 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error initializing database:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

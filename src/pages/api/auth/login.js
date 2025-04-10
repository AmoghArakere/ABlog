import authService from '../../../services/authService';
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
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and password are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await authService.signIn(email, password);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        token: result.token
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in login API:', error);

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

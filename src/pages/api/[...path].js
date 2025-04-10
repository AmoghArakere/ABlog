// Catch-all API handler
import authService from '../../services/authService';
import initDatabase from '../../db/init';

export async function post({ request, params }) {
  // Initialize database if tables don't exist
  try {
    await initDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    // Continue with the request even if initialization fails
  }

  const path = params.path;
  const url = new URL(request.url);
  const pathSegments = path.split('/');

  console.log(`API request to: ${path}`);

  // Handle different API endpoints
  if (pathSegments[0] === 'auth') {
    // Auth endpoints
    if (pathSegments[1] === 'login') {
      try {
        const body = await request.json();
        const { email, password } = body;

        console.log(`Login attempt for: ${email}`);

        const result = await authService.signIn(email, password);

        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Error in login endpoint:', error);

        return new Response(
          JSON.stringify({
            success: false,
            error: 'An unexpected error occurred'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } else if (pathSegments[1] === 'register') {
      try {
        const body = await request.json();
        const { email, password, username, full_name } = body;

        console.log(`Registration attempt for: ${email}`);

        const result = await authService.signUp(email, password, {
          username,
          full_name,
          avatar_url: body.avatar_url || '',
          bio: body.bio || '',
          website: body.website || '',
          location: body.location || ''
        });

        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Error in register endpoint:', error);

        return new Response(
          JSON.stringify({
            success: false,
            error: 'An unexpected error occurred'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }
  } else if (pathSegments[0] === 'test') {
    // Test endpoint
    return new Response(
      JSON.stringify({
        success: true,
        message: 'API is working',
        path: path
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // If no endpoint matched, return 404
  return new Response(
    JSON.stringify({
      success: false,
      error: 'API endpoint not found'
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

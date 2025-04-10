import authService from '../../../services/authService';
import commentService from '../../../services/commentService';
import initDatabase from '../../../db/init';

// Get comments for a post
export async function get({ request, url }) {
  // Initialize database if tables don't exist
  try {
    await initDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    // Continue with the request even if initialization fails
  }

  try {
    // Parse query parameters
    const postId = url.searchParams.get('postId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!postId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Post ID is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get comments
    const result = await commentService.getComments(postId, { page, limit });

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in comments API:', error);

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

// Add a comment to a post
export async function post({ request }) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get the user
    const user = await authService.verifyToken(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const data = await request.json();
    const { postId, content } = data;

    // Validate required fields
    if (!postId || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Post ID and content are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Add comment
    const comment = await commentService.addComment(postId, user.id, content);

    if (!comment) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to add comment'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        comment
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in comments API:', error);

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

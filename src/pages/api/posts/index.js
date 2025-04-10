import postService from '../../../services/postService';
import authService from '../../../services/authService';

// Get all posts with pagination
export async function get({ request, url }) {
  try {
    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');
    const authorId = url.searchParams.get('authorId');
    const includeScheduled = url.searchParams.get('includeScheduled') === 'true';

    // Get posts
    const result = await postService.getPosts({
      page,
      limit,
      category,
      tag,
      search,
      authorId,
      includeScheduled
    });

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in get posts API:', error);
    
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

// Create a new post
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
    const { 
      title, 
      content, 
      excerpt, 
      cover_image, 
      categoryIds, 
      tagIds, 
      status, 
      scheduled_publish_date 
    } = data;

    // Validate required fields
    if (!title || !content) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Title and content are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create post
    const post = await postService.createPost({
      title,
      content,
      excerpt,
      cover_image,
      author_id: user.id,
      categoryIds,
      tagIds,
      status,
      scheduled_publish_date
    });

    if (!post) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create post' 
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
        post
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in create post API:', error);
    
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

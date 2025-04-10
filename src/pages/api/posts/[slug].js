import postService from '../../../services/postService';
import authService from '../../../services/authService';

// Get a post by slug
export async function get({ params }) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Slug is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const post = await postService.getPostBySlug(slug);
    
    if (!post) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Post not found' 
        }),
        { 
          status: 404,
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
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in get post API:', error);
    
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

// Update a post
export async function put({ request, params }) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Slug is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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

    // Get the post
    const post = await postService.getPostBySlug(slug);
    
    if (!post) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Post not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is the author
    if (post.author_id !== user.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'You are not authorized to update this post' 
        }),
        { 
          status: 403,
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

    // Update post
    const result = await postService.updatePost(post.id, {
      title,
      content,
      excerpt,
      cover_image,
      categoryIds,
      tagIds,
      status,
      scheduled_publish_date
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Failed to update post' 
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
        post: result.post
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in update post API:', error);
    
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

// Delete a post
export async function del({ request, params }) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Slug is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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

    // Get the post
    const post = await postService.getPostBySlug(slug);
    
    if (!post) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Post not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is the author
    if (post.author_id !== user.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'You are not authorized to delete this post' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Delete post
    const result = await postService.deletePost(post.id);

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to delete post' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in delete post API:', error);
    
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

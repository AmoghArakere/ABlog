// API-based comment service
const apiCommentService = {
  // Get comments for a post with pagination
  async getComments(postId, { page = 1, limit = 10 } = {}) {
    try {
      // Build query string
      const params = new URLSearchParams();
      params.append('postId', postId);
      params.append('page', page);
      params.append('limit', limit);
      
      // Fetch comments from API
      const response = await fetch(`/api/comments?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error getting comments:', error);
      // Fallback to localStorage if API fails
      const { commentService } = await import('./localStorageService');
      return commentService.getComments(postId, { page, limit });
    }
  },
  
  // Add a comment to a post
  async addComment(postId, authorId, content, token) {
    try {
      if (!token) {
        console.error('addComment: No authentication token provided');
        return null;
      }
      
      // Add comment via API
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          content
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('addComment: API error:', data.error);
        return null;
      }
      
      return data.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      // Fallback to localStorage if API fails
      const { commentService } = await import('./localStorageService');
      return commentService.addComment(postId, authorId, content);
    }
  },
  
  // Delete a comment
  async deleteComment(commentId, token) {
    try {
      if (!token) {
        console.error('deleteComment: No authentication token provided');
        return { success: false };
      }
      
      // Delete comment via API
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return { success: data.success };
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Fallback to localStorage if API fails
      const { commentService } = await import('./localStorageService');
      return commentService.deleteComment(commentId);
    }
  }
};

export default apiCommentService;

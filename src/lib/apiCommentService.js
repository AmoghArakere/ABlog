// API-based comment service
const apiCommentService = {
  // Get comments for a post with pagination
  async getComments(postId, { page = 1, limit = 10 } = {}) {
    try {
      console.log(`[apiCommentService] Getting comments for post ${postId}, page ${page}`);

      // Build query string
      const params = new URLSearchParams();
      params.append('postId', postId);
      params.append('page', page);
      params.append('limit', limit);

      // Fetch comments from API
      console.log(`[apiCommentService] Fetching from: /api/comments?${params.toString()}`);
      const response = await fetch(`/api/comments?${params.toString()}`);
      console.log(`[apiCommentService] Response status: ${response.status}`);

      if (!response.ok) {
        console.error(`[apiCommentService] API error: ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[apiCommentService] Received ${data.comments ? data.comments.length : 0} comments`);

      // Ensure we have the expected structure
      return {
        comments: data.comments || [],
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || page
      };
    } catch (error) {
      console.error('[apiCommentService] Error getting comments:', error);
      // Fallback to localStorage if API fails
      console.log('[apiCommentService] Falling back to localStorage');
      const { commentService } = await import('./localStorageService');
      return commentService.getComments(postId, { page, limit });
    }
  },

  // Add a comment to a post
  async addComment(postId, authorId, content, token) {
    try {
      console.log(`[apiCommentService] Adding comment to post ${postId} by user ${authorId}`);

      if (!token) {
        console.error('[apiCommentService] No authentication token provided');
        // Immediately fall back to localStorage
        console.log('[apiCommentService] Falling back to localStorage due to missing token');
        const { commentService } = await import('./localStorageService');
        return commentService.addComment(postId, authorId, content);
      }

      // Add comment via API
      console.log('[apiCommentService] Sending comment to API');
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

      console.log(`[apiCommentService] Comment submission response status: ${response.status}`);

      if (!response.ok) {
        console.error(`[apiCommentService] API error: ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[apiCommentService] Comment submission response:', data);

      if (!data.success) {
        console.error('[apiCommentService] API error:', data.error);
        throw new Error(data.error || 'Unknown error');
      }

      console.log('[apiCommentService] Comment added successfully via API');
      return data.comment;
    } catch (error) {
      console.error('[apiCommentService] Error adding comment:', error);
      // Fallback to localStorage if API fails
      console.log('[apiCommentService] Falling back to localStorage');
      const { commentService } = await import('./localStorageService');
      return commentService.addComment(postId, authorId, content);
    }
  },

  // Delete a comment
  async deleteComment(commentId, token) {
    try {
      console.log(`[apiCommentService] Deleting comment ${commentId}`);

      if (!token) {
        console.error('[apiCommentService] No authentication token provided for delete');
        // Immediately fall back to localStorage
        console.log('[apiCommentService] Falling back to localStorage due to missing token');
        const { commentService } = await import('./localStorageService');
        return commentService.deleteComment(commentId);
      }

      // Delete comment via API
      console.log(`[apiCommentService] Sending delete request to API for comment ${commentId}`);
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`[apiCommentService] Delete response status: ${response.status}`);

      if (!response.ok) {
        console.error(`[apiCommentService] API error on delete: ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[apiCommentService] Delete response:', data);

      return { success: data.success };
    } catch (error) {
      console.error('[apiCommentService] Error deleting comment:', error);
      // Fallback to localStorage if API fails
      console.log('[apiCommentService] Falling back to localStorage for delete');
      const { commentService } = await import('./localStorageService');
      return commentService.deleteComment(commentId);
    }
  }
};

export default apiCommentService;

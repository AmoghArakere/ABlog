import React, { useState, useEffect } from 'react';
import apiCommentService from '../lib/apiCommentService';
import authService from '../lib/authService';

export default function ClientCommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('[CommentSection] Component mounted or updated with postId:', postId);
    // Flag to track if component is mounted
    let isMounted = true;

    // Get the current user from localStorage
    const currentUser = authService.getCurrentUser();
    if (isMounted) {
      console.log('[CommentSection] Setting user:', currentUser ? currentUser.username : 'none');
      setUser(currentUser);
    }

    const fetchComments = async () => {
      try {
        if (isMounted) setLoading(true);
        console.log(`[CommentSection] Fetching comments for post ID: ${postId}`);

        // Try to get comments from localStorage first as a fallback
        let fetchedComments = [];
        let pages = 1;

        try {
          console.log('[CommentSection] Attempting to fetch comments from API...');
          const result = await apiCommentService.getComments(postId, { page });
          fetchedComments = result.comments || [];
          pages = result.totalPages || 1;
          console.log(`[CommentSection] Fetched ${fetchedComments.length} comments from API`);
        } catch (apiError) {
          console.error('[CommentSection] API error, falling back to localStorage:', apiError);
          // Fallback to localStorage
          const { commentService } = await import('../lib/localStorageService');
          const result = await commentService.getComments(postId, { page });
          fetchedComments = result.comments || [];
          pages = result.totalPages || 1;
          console.log(`[CommentSection] Fetched ${fetchedComments.length} comments from localStorage`);
        }

        if (isMounted) {
          console.log('[CommentSection] Setting comments state');
          setComments(fetchedComments);
          setTotalPages(pages);
          setLoading(false);
        }
      } catch (err) {
        console.error('[CommentSection] Error fetching comments:', err);
        if (isMounted) {
          setError('Failed to load comments');
          setLoading(false);
        }
      }
    };

    if (postId) {
      fetchComments();
    } else {
      console.log('[CommentSection] No postId provided, skipping comment fetch');
    }

    // Cleanup function
    return () => {
      console.log('[CommentSection] Component unmounting');
      isMounted = false;
    };
  }, [postId, page]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    console.log('[CommentSection] Comment submission initiated');

    if (!user) {
      console.log('[CommentSection] No user logged in, redirecting to login');
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (!commentText.trim()) {
      console.log('[CommentSection] Empty comment, ignoring submission');
      return;
    }

    try {
      setSubmitting(true);
      console.log(`[CommentSection] Submitting comment for post ${postId} by user ${user.id}`);

      const token = authService.getToken();
      console.log('[CommentSection] Auth token available:', !!token);

      // Try API first, then fallback to localStorage
      let newComment = null;

      try {
        console.log('[CommentSection] Attempting to add comment via API');
        newComment = await apiCommentService.addComment(postId, user.id, commentText, token);
        console.log('[CommentSection] API comment result:', newComment);
      } catch (apiError) {
        console.error('[CommentSection] API error, falling back to localStorage:', apiError);
        // Fallback to localStorage
        const { commentService } = await import('../lib/localStorageService');
        newComment = await commentService.addComment(postId, user.id, commentText);
        console.log('[CommentSection] localStorage comment result:', newComment);
      }

      if (newComment) {
        console.log('[CommentSection] Comment added successfully, updating UI');
        setComments([newComment, ...comments]);
        setCommentText('');
      } else {
        console.error('[CommentSection] Failed to add comment, no comment returned');
        alert('Failed to add comment. Please try again.');
      }

      setSubmitting(false);
    } catch (err) {
      console.error('[CommentSection] Error adding comment:', err);
      setSubmitting(false);
      alert('An error occurred while adding your comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    console.log(`[CommentSection] Attempting to delete comment: ${commentId}`);
    try {
      const token = authService.getToken();
      console.log('[CommentSection] Auth token available for delete:', !!token);

      // Try API first, then fallback to localStorage
      let success = false;

      try {
        console.log('[CommentSection] Attempting to delete comment via API');
        const result = await apiCommentService.deleteComment(commentId, token);
        success = result.success;
        console.log('[CommentSection] API delete result:', success);
      } catch (apiError) {
        console.error('[CommentSection] API error on delete, falling back to localStorage:', apiError);
        // Fallback to localStorage
        const { commentService } = await import('../lib/localStorageService');
        const result = await commentService.deleteComment(commentId);
        success = result.success;
        console.log('[CommentSection] localStorage delete result:', success);
      }

      if (success) {
        console.log('[CommentSection] Comment deleted successfully, updating UI');
        setComments(comments.filter(comment => comment.id !== commentId));
      } else {
        console.error('[CommentSection] Failed to delete comment');
        alert('Failed to delete comment. Please try again.');
      }
    } catch (err) {
      console.error('[CommentSection] Error deleting comment:', err);
      alert('An error occurred while deleting the comment. Please try again.');
    }
  };

  return (
    <div>
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden mr-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-sm font-bold">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                rows="3"
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  disabled={submitting || !commentText.trim()}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-lg mb-8 text-center">
          <p className="mb-4 dark:text-white">Sign in to leave a comment</p>
          <a href="/login" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            Sign In
          </a>
        </div>
      )}

      {loading && page === 1 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-muted dark:text-gray-400">Loading comments...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-muted dark:text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex">
                <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  {comment.author.avatar_url ? (
                    <img
                      src={comment.author.avatar_url}
                      alt={comment.author.full_name || comment.author.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-sm font-bold">
                      {(comment.author.full_name || comment.author.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <a href={`/user/${comment.author.username}`} className="font-medium hover:underline hover:text-purple-500 dark:text-white">
                          {comment.author.full_name || comment.author.username}
                        </a>
                        <p className="text-xs text-text-muted mt-1">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {user && user.id === comment.author_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-text-muted hover:text-red-500"
                          title="Delete comment"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="mt-2 dark:text-white">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      page === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { commentService } from '../lib/localStorageService';
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
    // Get the current user from localStorage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const fetchComments = async () => {
      try {
        setLoading(true);

        const { comments: fetchedComments, totalPages: pages } = await commentService.getComments(postId, { page });

        setComments(fetchedComments);
        setTotalPages(pages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
        setLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId, page]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const newComment = await commentService.addComment(postId, user.id, commentText);

      if (newComment) {
        setComments([newComment, ...comments]);
        setCommentText('');
      }

      setSubmitting(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const success = await commentService.deleteComment(commentId);

      if (success) {
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
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

import React from 'react';

export default function PostActions({ 
  liked, 
  bookmarked, 
  likeCount, 
  onLike, 
  onBookmark, 
  showEdit = false, 
  onEdit = null 
}) {
  return (
    <div className="flex space-x-3">
      {/* Like Button - Fixed width to prevent size changes */}
      <button
        className={`flex items-center justify-center w-16 h-10 rounded-full transition-colors ${
          liked 
            ? 'bg-pink-900/30 text-pink-400' 
            : 'bg-gray-800 text-gray-400 hover:bg-pink-900/20 hover:text-pink-400'
        }`}
        onClick={onLike}
        title={liked ? 'Unlike' : 'Like'}
      >
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill={liked ? "currentColor" : "none"} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          {likeCount > 0 && (
            <span className="ml-1 text-sm">{likeCount}</span>
          )}
        </div>
      </button>

      {/* Bookmark Button - Fixed width to match like button */}
      <button
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          bookmarked 
            ? 'bg-blue-900/30 text-blue-400' 
            : 'bg-gray-800 text-gray-400 hover:bg-blue-900/20 hover:text-blue-400'
        }`}
        onClick={onBookmark}
        title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill={bookmarked ? "currentColor" : "none"} 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>

      {/* Edit Button - Only shown if showEdit is true */}
      {showEdit && (
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:bg-purple-900/20 hover:text-purple-400 transition-colors"
          onClick={onEdit}
          title="Edit Post"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
            />
          </svg>
        </button>
      )}
    </div>
  );
}

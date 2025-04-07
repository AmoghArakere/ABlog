import React from 'react';

export default function BlogPostCard({ post, showAuthor = true }) {
  return (
    <div className="bg-black rounded-lg shadow-md overflow-hidden border border-gray-800 text-white">
      {post.cover_image ? (
        <div className="h-48 bg-gray-900">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-blog.svg';
              console.log('Image load error, using placeholder');
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-900"></div>
      )}
      <div className="p-6">
        <div className="flex items-center mb-2">
          {post.categories && post.categories[0] && (
            <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded-md">
              {post.categories[0].name}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-2">
            {Math.ceil(post.content.length / 1000)} min read
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{post.title}</h3>
        <p className="text-gray-400 mb-4">
          {post.excerpt || `${post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...`}
        </p>
        <div className="flex items-center justify-between">
          {showAuthor && post.author && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-800 rounded-full overflow-hidden">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.full_name || post.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-sm font-bold">
                    {(post.author.full_name || post.author.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-white">{post.author.full_name || post.author.username}</p>
                <p className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
          {!showAuthor && (
            <span className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
          <a href={`/blogs/${post.slug}`} className="text-purple-400 hover:underline text-sm">
            Read more
          </a>
        </div>
      </div>
    </div>
  );
}

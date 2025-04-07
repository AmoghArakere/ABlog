import React from 'react';

export default function SimpleBlogCard({ post }) {
  return (
    <div className="bg-black rounded-lg shadow-md overflow-hidden border border-gray-800">
      {/* Cover Image */}
      <div className="h-48 bg-gray-900 relative">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-blog.svg';
              console.log('Image load error in SimpleBlogCard, using placeholder');
            }}
          />
        ) : (
          <img
            src="/images/placeholder-blog.svg"
            alt="Placeholder"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-xl font-bold mb-2">
          <a href={`/blogs/${post.slug}`} className="text-white hover:text-purple-400">
            {post.title}
          </a>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 mb-4">
          {post.excerpt || post.content.substring(0, 100)}...
        </p>

        {/* Author & Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full overflow-hidden">
              {post.author && post.author.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white">
                  {post.author ? post.author.username.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                {post.author ? post.author.username : 'Amogh'}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <a
            href={`/blogs/${post.slug}`}
            className="text-purple-400 text-sm font-medium hover:underline"
          >
            Read more
          </a>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { AnimatedCard } from './ui/animated-card';
import { AnimatedAvatar, AnimatedAvatarImage, AnimatedAvatarFallback } from './ui/animated-avatar';

export default function DirectImageBlogCard({ post, showAuthor = true }) {
  // Handle both local and external images
  const imageUrl = post.cover_image || '/images/placeholder-blog.svg';

  // Log the image URL for debugging
  console.log('Blog card image URL:', imageUrl);

  // Format the date
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <AnimatedCard animation="fade-in" className="overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gray-900 relative">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            console.log('Blog card image failed to load:', imageUrl);
            e.target.onerror = null;
            e.target.src = '/images/placeholder-blog.svg';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category Tag - Optional */}
        {post.categories && post.categories[0] && (
          <div className="mb-2">
            <span className="text-xs bg-purple-900 text-white px-2 py-1 rounded-md">
              {post.categories[0].name}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-white">
          <a href={`/blogs/${post.slug}`} className="hover:text-purple-400">
            {post.title}
          </a>
        </h3>

        {/* Author & Date - Moved below title */}
        {showAuthor ? (
          <div className="flex items-center mb-3">
            <AnimatedAvatar className="w-8 h-8" animation="none" hoverEffect={true}>
              {post.author && post.author.avatar_url ? (
                <AnimatedAvatarImage
                  src={post.author.avatar_url}
                  alt={post.author.username}
                />
              ) : (
                <AnimatedAvatarFallback>
                  {post.author ? (post.author.username?.charAt(0).toUpperCase() || 'A') : 'A'}
                </AnimatedAvatarFallback>
              )}
            </AnimatedAvatar>
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                {post.author ? (post.author.full_name || post.author.username) : (post.author_id ? post.author_name || 'Amogh' : 'Amogh')}
              </p>
              <p className="text-xs text-gray-400">
                {formattedDate}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-xs text-gray-400">
              {formattedDate}
            </p>
          </div>
        )}

        {/* Excerpt */}
        <p className="text-gray-300 mb-4">
          {post.excerpt || post.content.substring(0, 100)}...
        </p>

        {/* Read More Link */}
        <div className="flex justify-end">
          <a
            href={`/blogs/${post.slug}`}
            className="text-purple-400 text-sm font-medium hover:underline relative group"
          >
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">Read more</span>
          </a>
        </div>
      </div>
    </AnimatedCard>
  );
}

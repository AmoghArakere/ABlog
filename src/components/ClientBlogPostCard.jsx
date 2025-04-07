import React from 'react';
import DirectImageBlogCard from './DirectImageBlogCard';

export default function ClientBlogPostCard({ post, showAuthor = true }) {
  // Pass the showAuthor flag to DirectImageBlogCard instead of modifying the post object
  // This allows the component to decide how to display the author information

  // Log the post data to help debug
  console.log('Rendering post:', post.title);
  console.log('Cover image URL:', post.cover_image);

  return <DirectImageBlogCard post={post} showAuthor={showAuthor} />;
}

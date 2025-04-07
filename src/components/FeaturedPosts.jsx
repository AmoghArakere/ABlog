import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/localStorageService';
import ClientBlogPostCard from './ClientBlogPostCard';

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        
        // For now, we'll just get the latest posts
        const { posts } = await blogService.getPosts({ limit: 3 });
        setFeaturedPosts(posts);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured posts:', err);
        setError('Failed to load featured posts');
        setLoading(false);
      }
    };
    
    fetchFeaturedPosts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted">Loading featured posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg inline-block">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (featuredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">No featured posts available.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredPosts.map(post => (
          <ClientBlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

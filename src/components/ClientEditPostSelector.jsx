import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/localStorageService';
import authService from '../lib/authService';
import ClientEditPostForm from './ClientEditPostForm';
import { Card } from './ui/card';

export default function ClientEditPostSelector() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        
        if (!currentUser) {
          setError('You must be logged in to edit posts');
          setLoading(false);
          return;
        }
        
        console.log('Fetching posts for user:', currentUser.id);
        
        // Get all posts
        const result = await blogService.getAllPosts();
        
        // Filter posts by current user
        const filteredPosts = result.posts.filter(post => post.author_id === currentUser.id);
        console.log('User posts found:', filteredPosts.length);
        
        setUserPosts(filteredPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load your posts');
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, []);

  const handleSelectPost = (post) => {
    console.log('Selected post for editing:', post.id);
    setSelectedPost(post);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted">Loading your posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-lg">
        <p className="text-xl font-semibold">{error}</p>
        <p className="mt-2">Please try again later or contact support.</p>
        <a href="/blogs" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">
          Browse All Posts
        </a>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
        <p className="text-xl font-semibold">You need to be logged in to edit posts</p>
        <p className="mt-2">Please log in to continue.</p>
        <a href="/login" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">
          Log In
        </a>
      </div>
    );
  }

  if (selectedPost) {
    return <ClientEditPostForm post={selectedPost} />;
  }

  if (userPosts.length === 0) {
    return (
      <div className="bg-blue-50 text-blue-700 p-6 rounded-lg">
        <p className="text-xl font-semibold">You don't have any posts yet</p>
        <p className="mt-2">Create your first post to get started.</p>
        <a href="/create-post" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">
          Create Post
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select a post to edit</h2>
      <div className="grid gap-4">
        {userPosts.map(post => (
          <Card 
            key={post.id} 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleSelectPost(post)}
          >
            <div className="flex items-center">
              {post.cover_image && (
                <div className="w-16 h-16 mr-4 rounded overflow-hidden bg-gray-100">
                  <img 
                    src={post.cover_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()} • {post.status}
                </p>
              </div>
              <div className="ml-4">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

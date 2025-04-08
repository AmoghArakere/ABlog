import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/localStorageService';
import authService from '../lib/authService';
import RichTextEditor from './RichTextEditor';
import CloudinaryUploader from './CloudinaryUploader';

export default function SimpleEditForm() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('published');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Get the post ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    if (postId) {
      setSelectedPostId(postId);
    }
  }, []);

  // Load user and posts
  useEffect(() => {
    const loadUserAndPosts = async () => {
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

        // Get all posts
        const result = await blogService.getAllPosts();

        // Filter posts by current user
        const userPosts = result.posts.filter(post => post.author_id === currentUser.id);
        setPosts(userPosts);

        setLoading(false);
      } catch (err) {
        console.error('Error loading user and posts:', err);
        setError('Failed to load your posts');
        setLoading(false);
      }
    };

    loadUserAndPosts();
  }, []);

  // Load selected post for editing
  useEffect(() => {
    if (selectedPostId && posts.length > 0) {
      const post = posts.find(p => p.id === selectedPostId);
      if (post) {
        setEditingPost(post);
        setTitle(post.title || '');
        setContent(post.content || '');
        setCoverImage(post.cover_image || '');
        setStatus(post.status || 'published');
      } else {
        setError('Post not found');
      }
    }
  }, [selectedPostId, posts]);

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingPost) {
      setError('No post selected for editing');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      // Update the post
      const result = await blogService.updatePost(editingPost.id, {
        title,
        content,
        excerpt: title.substring(0, 150) + '...',
        cover_image: coverImage,
        status,
        categories: editingPost.categories ? editingPost.categories.map(c => c.id) : [],
        tags: editingPost.tags ? editingPost.tags.map(t => t.id) : []
      });

      if (result.success) {
        setMessage('Post updated successfully!');

        // Refresh the posts list
        const updatedResult = await blogService.getAllPosts();
        const userPosts = updatedResult.posts.filter(post => post.author_id === user.id);
        setPosts(userPosts);

        // Update the editing post
        const updatedPost = userPosts.find(p => p.id === editingPost.id);
        if (updatedPost) {
          setEditingPost(updatedPost);
        }
      } else {
        setError(result.error || 'Failed to update post');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your posts...</p>
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

  if (posts.length === 0) {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Your Posts</h2>
          <div className="space-y-2">
            {posts.map(post => (
              <div
                key={post.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedPostId === post.id ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => handleSelectPost(post.id)}
              >
                <h3 className="font-medium truncate">{post.title}</h3>
                <p className="text-xs opacity-80">
                  {new Date(post.created_at).toLocaleDateString()} • {post.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        {!editingPost ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">Select a post from the list to edit</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Post</h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium mb-2">Cover Image</label>
                  <CloudinaryUploader
                    onImageSelect={(imageUrl) => {
                      console.log('Cloudinary image URL:', imageUrl);
                      setCoverImage(imageUrl);
                    }}
                    buttonText="Upload Cover Image"
                    initialImage={coverImage}
                    aspectRatio={16/9}
                    imageType="post"
                    uniqueId="simple-edit-post-cover-image-uploader"
                  />

                  {coverImage && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-2">Content</label>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-2">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ImageUploader from './ImageUploader';

export default function DirectEditForm() {
  // State for user and posts
  const [currentUser, setCurrentUser] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // State for selected post
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);

  // Load user from localStorage directly
  useEffect(() => {
    try {
      // Get user from localStorage
      const userJson = localStorage.getItem('currentUser');
      console.log('User JSON from localStorage:', userJson);

      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        console.log('Current user loaded:', user);
      } else {
        setError('You must be logged in to edit posts');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Failed to load user data');
      setLoading(false);
    }
  }, []);

  // Load posts from localStorage directly
  useEffect(() => {
    if (!currentUser) return;

    try {
      // Get posts from localStorage
      const postsJson = localStorage.getItem('posts');
      console.log('Posts JSON from localStorage:', postsJson ? postsJson.substring(0, 100) + '...' : 'null');

      if (postsJson) {
        const posts = JSON.parse(postsJson);
        setAllPosts(posts);

        // Filter posts by current user
        const filteredPosts = posts.filter(post => post.author_id === currentUser.id);
        console.log('Found', filteredPosts.length, 'posts for user', currentUser.id);
        setUserPosts(filteredPosts);
      } else {
        console.log('No posts found in localStorage');
        setUserPosts([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts data');
      setLoading(false);
    }
  }, [currentUser]);

  // Handle post selection
  const handleSelectPost = (postId) => {
    console.log('Selected post ID:', postId);
    setSelectedPostId(postId);

    // Find the selected post
    const post = userPosts.find(p => p.id === postId);
    if (post) {
      console.log('Found selected post:', post);
      setSelectedPost(post);
      setTitle(post.title || '');
      setContent(post.content || '');
      setCoverImage(post.cover_image || '');
      setStatus(post.status || 'published');
      setError('');
      setMessage('');
    } else {
      console.error('Post not found with ID:', postId);
      setError('Post not found');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedPost) {
      setError('No post selected for editing');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      // Update the post directly in localStorage
      const updatedPost = {
        ...selectedPost,
        title,
        content,
        cover_image: selectedPost.cover_image, // Use the cover image from the selectedPost state
        status,
        updated_at: new Date().toISOString()
      };

      // Find and update the post in the allPosts array
      const updatedPosts = allPosts.map(post =>
        post.id === selectedPost.id ? updatedPost : post
      );

      // Save back to localStorage
      localStorage.setItem('posts', JSON.stringify(updatedPosts));

      // Update state
      setAllPosts(updatedPosts);
      setUserPosts(updatedPosts.filter(post => post.author_id === currentUser.id));
      setSelectedPost(updatedPost);

      setMessage('Post updated successfully!');
      console.log('Post updated successfully:', updatedPost);
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
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
        <p className="text-xl font-semibold">{error}</p>
        <p className="mt-2">Please log in to continue.</p>
        <a href="/login" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">
          Log In
        </a>
      </div>
    );
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 dark:border dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Your Posts</h2>
          <div className="space-y-2">
            {userPosts.map(post => (
              <div
                key={post.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedPostId === post.id ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white'}`}
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
        {!selectedPost ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center dark:border dark:border-slate-700">
            <p className="text-gray-600 dark:text-gray-300">Select a post from the list to edit</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 dark:border dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Edit Post</h2>

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
                  <label htmlFor="title" className="block text-sm font-medium mb-2 dark:text-white">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-2 dark:text-white">Content</label>
                  <RichTextEditor content={content} onChange={setContent} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use markdown formatting for rich text. For blockquotes, use the quote button or start a line with <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded dark:text-white">&gt;</code> (greater than symbol).
                  </p>
                </div>

                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium mb-2 dark:text-white">Cover Image</label>
                  <ImageUploader
                    onImageSelect={(imageData) => {
                      console.log('Image selected, data length:', imageData ? imageData.length : 0);
                      if (selectedPost) {
                        // Update the selected post with the new cover image
                        setSelectedPost({
                          ...selectedPost,
                          cover_image: imageData
                        });
                      }
                    }}
                    buttonText="Upload Cover Image"
                    initialImage={selectedPost?.cover_image}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upload an image to use as the cover for your post. The image will be displayed at the top of your post.
                  </p>

                  {selectedPost?.cover_image && (
                    <div className="mt-4 border dark:border-slate-600 rounded-md overflow-hidden">
                      <div className="relative h-48 bg-gray-100 dark:bg-slate-700">
                        <img
                          src={selectedPost.cover_image}
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
                  <label htmlFor="status" className="block text-sm font-medium mb-2 dark:text-white">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
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

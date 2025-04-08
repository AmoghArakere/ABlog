import React, { useState, useEffect } from 'react';
import authService from '../lib/authService';
import RichTextEditor from './RichTextEditor';
import ImageUploader from './ImageUploader';
import CloudinaryUploader from './CloudinaryUploader';
import { blogService } from '../lib/localStorageService';

export default function ClientCreatePostForm() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState('published');
  const [scheduledDate, setScheduledDate] = useState('');
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);

  useEffect(() => {
    // Get the current user from localStorage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Redirect if not logged in
    if (!currentUser) {
      window.location.href = '/login';
    }

    // Fetch categories and tags
    const fetchData = async () => {
      const categoriesData = await blogService.getCategories();
      const tagsData = await blogService.getTags();
      setCategories(categoriesData);
      setTags(tagsData);
    };

    fetchData();
  }, []);

  const handleCategoryToggle = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      // Check if tag already exists
      const existingTag = tags.find(tag => tag.name.toLowerCase() === newTag.toLowerCase());

      if (existingTag) {
        // If it exists, just select it
        if (!selectedTags.includes(existingTag.id)) {
          setSelectedTags([...selectedTags, existingTag.id]);
        }
      } else {
        // If it doesn't exist, we would add it to the database
        // For now, we'll just add it to the local state
        const newTagObj = { id: `new-${Date.now()}`, name: newTag.trim(), slug: newTag.trim().toLowerCase().replace(/\s+/g, '-') };
        setTags([...tags, newTagObj]);
        setSelectedTags([...selectedTags, newTagObj.id]);
      }

      setNewTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    // Validate cover image if provided
    if (coverImage) {
      console.log('Cover image URL:', coverImage);

      // Check if the image URL is valid
      if (!coverImage.startsWith('http') && !coverImage.startsWith('data:image/') && !coverImage.startsWith('/images/')) {
        setError('Invalid cover image URL');
        setLoading(false);
        return;
      }
    }

    try {
      // Create the post
      const post = await blogService.createPost({
        title,
        content,
        excerpt: excerpt || title.substring(0, 150) + '...',
        cover_image: coverImage,
        author_id: user.id,
        categories: selectedCategories,
        tags: selectedTags,
        status,
        scheduled_publish_date: status === 'scheduled' ? scheduledDate : null
      });

      if (post) {
        setSuccess('Post created successfully!');

        // Reset form
        setTitle('');
        setContent('');
        setExcerpt('');
        setCoverImage('');
        setSelectedCategories([]);
        setSelectedTags([]);
        setStatus('published');
        setScheduledDate('');
        setShowScheduleOptions(false);

        // Redirect to the post after a short delay
        setTimeout(() => {
          window.location.href = `/blogs/${post.slug}`;
        }, 2000);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setStatus('draft');
    setShowScheduleOptions(false);
    // The form will be submitted with status='draft'
  };

  const handleSchedule = () => {
    setStatus('scheduled');
    setShowScheduleOptions(true);
  };

  // Get the current date and time in the format required for datetime-local input
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Set minimum time to 5 minutes from now
    return now.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  // Set default scheduled time to 1 hour from now
  useEffect(() => {
    if (showScheduleOptions && !scheduledDate) {
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      setScheduledDate(defaultTime.toISOString().slice(0, 16));
    }
  }, [showScheduleOptions, scheduledDate]);

  return (
    <div className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow-md p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-4 rounded-md mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-white">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-2 text-white">Excerpt (Optional)</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Add a short excerpt to summarize your post"
            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
            rows="3"
          />
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium mb-2 text-white">Cover Image</label>
          <div className="mb-4">
            <CloudinaryUploader
              onImageSelect={(imageUrl) => {
                console.log('Cloudinary image URL:', imageUrl);
                setCoverImage(imageUrl);
              }}
              buttonText="Upload Cover Image"
              initialImage={coverImage}
            />
          </div>

          {/* Show a preview of the cover image */}
          {coverImage && (
            <div className="mt-4 border border-gray-600 rounded-md overflow-hidden">
              <p className="text-sm font-medium px-4 py-2 bg-gray-700 border-b border-gray-600 text-white">Image Preview</p>
              <div className="relative h-48 bg-gray-800">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error('Error loading cover image preview');
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-cover.svg';
                    e.target.style.objectFit = 'contain';
                    e.target.style.padding = '1rem';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium mb-2 text-white">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategories.includes(category.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2 text-white">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a new tag"
              className="flex-1 px-4 py-2 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2 text-white">Content</label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Scheduled publishing options */}
        {showScheduleOptions && (
          <div className="bg-gray-800 border border-gray-700 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium mb-3 text-white">Schedule Publication</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium mb-2 text-white">
                  Publication Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  value={scheduledDate}
                  min={getMinDateTime()}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                  required={status === 'scheduled'}
                />
              </div>
              <p className="text-sm text-gray-400">
                Your post will be automatically published at the scheduled time.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-6 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-white"
            disabled={loading}
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSchedule}
            className={`px-6 py-2 border ${status === 'scheduled' ? 'bg-purple-700 border-purple-600' : 'border-gray-600'} rounded-md hover:bg-purple-800 transition-colors text-white`}
            disabled={loading}
          >
            Schedule
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Publishing...' : status === 'scheduled' ? 'Schedule Post' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}

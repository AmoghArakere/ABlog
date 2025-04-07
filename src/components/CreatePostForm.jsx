import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from './RichTextEditor';
import { blogService } from '../lib/localStorageService';

export default function CreatePostForm() {
  const { user } = useAuth();
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

  // Fetch categories and tags
  useEffect(() => {
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
        const newTagObj = { id: `new-${Date.now()}`, name: newTag.trim() };
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

    try {
      // In a real implementation, we would save the post to the database
      // For now, we'll just simulate a successful save

      // const post = await blogService.createPost({
      //   title,
      //   content,
      //   excerpt: excerpt || title.substring(0, 150) + '...',
      //   cover_image: coverImage,
      //   author_id: user.id,
      //   categories: selectedCategories,
      //   tags: selectedTags,
      //   status
      // });

      // Simulate a successful save
      setTimeout(() => {
        setSuccess('Post created successfully!');
        setLoading(false);

        // Reset form
        setTitle('');
        setContent('');
        setExcerpt('');
        setCoverImage('');
        setSelectedCategories([]);
        setSelectedTags([]);
        setStatus('published');
      }, 1000);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setStatus('draft');
    // The form will be submitted with status='draft'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
          <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-2">Excerpt (Optional)</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Add a short excerpt to summarize your post"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows="3"
          />
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium mb-2">Cover Image URL</label>
          <input
            type="url"
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Enter the URL of your cover image"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {coverImage && (
            <div className="mt-2">
              <img
                src={coverImage}
                alt="Cover preview"
                className="h-40 object-cover rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder-blog.svg';
                  console.log('Using placeholder for invalid image URL');
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategories.includes(category.id)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag.id)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">Content</label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}

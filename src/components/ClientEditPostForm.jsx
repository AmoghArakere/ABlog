import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/localStorageService';
import authService from '../lib/authService';
import RichTextEditor from './RichTextEditor';
import CloudinaryUploader from './CloudinaryUploader';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Alert } from './ui/alert';

export default function ClientEditPostForm({ slug, post: initialPost }) {
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('published');
  const [scheduledDate, setScheduledDate] = useState('');
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    // Get the current user from localStorage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    console.log('Current user:', currentUser);

    // Set a timeout to prevent indefinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached');
        setLoading(false);
        setError('Loading timed out. Please try again later.');
      }
    }, 10000); // 10 seconds timeout

    const fetchData = async () => {
      try {
        setLoading(true);

        // If we have an initialPost, use that directly
        if (initialPost) {
          console.log('Using provided post data:', initialPost.id);
          setPost(initialPost);

          // Check if the current user is the author of the post
          if (currentUser && initialPost.author_id === currentUser.id) {
            console.log('User is the author of the post');
            setIsAuthor(true);
          } else {
            console.error('User is not authorized to edit this post');
            setError('You are not authorized to edit this post');
            setLoading(false);
            return;
          }

          // Set form fields with post data
          setTitle(initialPost.title || '');
          setContent(initialPost.content || '');
          setExcerpt(initialPost.excerpt || '');
          setCoverImage(initialPost.cover_image || '');
          setStatus(initialPost.status || 'published');

          // Set scheduled date if available
          if (initialPost.scheduled_publish_date) {
            setScheduledDate(initialPost.scheduled_publish_date.slice(0, 16));
            if (initialPost.status === 'scheduled') {
              setShowScheduleOptions(true);
            }
          }

          // Set selected categories and tags
          if (initialPost.categories) {
            setSelectedCategories(initialPost.categories.map(cat => cat.id));
          }

          if (initialPost.tags) {
            setSelectedTags(initialPost.tags.map(tag => tag.id));
          }

          // Fetch categories and tags
          const allCategories = await categoryService.getAllCategories();
          const allTags = await tagService.getAllTags();

          setCategories(allCategories);
          setTags(allTags);

          setLoading(false);
          return;
        }

        // Otherwise, try to fetch by slug
        console.log('Fetching post with slug:', slug);

        if (!slug) {
          console.error('No slug provided to edit form');
          setError('No post identifier provided');
          setLoading(false);
          return;
        }

        // Fetch post by slug
        const postData = await blogService.getPostBySlug(slug);
        console.log('Post data received:', postData);

        if (!postData) {
          console.error('Post not found for slug:', slug);
          setError('Post not found');
          setLoading(false);
          return;
        }

        setPost(postData);

        // Check if the current user is the author of the post
        if (currentUser && postData.author_id === currentUser.id) {
          console.log('User is the author of the post');
          setIsAuthor(true);
        } else {
          console.error('User is not authorized to edit this post');
          setError('You are not authorized to edit this post');
          setLoading(false);
          return;
        }

        // Set form fields with post data
        setTitle(postData.title || '');
        setContent(postData.content || '');
        setExcerpt(postData.excerpt || '');
        setCoverImage(postData.cover_image || '');
        setStatus(postData.status || 'published');

        // Set scheduled date if available
        if (postData.scheduled_publish_date) {
          setScheduledDate(postData.scheduled_publish_date.slice(0, 16));
          if (postData.status === 'scheduled') {
            setShowScheduleOptions(true);
          }
        }

        // Set selected categories and tags
        if (postData.categories) {
          setSelectedCategories(postData.categories.map(cat => cat.id));
        }

        if (postData.tags) {
          setSelectedTags(postData.tags.map(tag => tag.id));
        }

        // Fetch categories and tags
        const allCategories = await categoryService.getAllCategories();
        const allTags = await tagService.getAllTags();

        setCategories(allCategories);
        setTags(allTags);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching post data:', err);
        setError('Failed to load post data');
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [slug, initialPost, loading]); // Re-run when slug, initialPost, or loading state changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      setSaving(false);
      return;
    }

    // Validate cover image if provided
    if (coverImage) {
      console.log('Cover image data length:', coverImage.length);

      // Check if the image data is valid
      if (typeof coverImage === 'string' && coverImage.startsWith('data:image/')) {
        // Valid base64 image
      } else if (typeof coverImage === 'string' && (coverImage.startsWith('http://') || coverImage.startsWith('https://'))) {
        // Valid URL
      } else if (!coverImage) {
        // No image is fine
      } else {
        setError('Invalid cover image format');
        setSaving(false);
        return;
      }
    }

    try {
      // Update the post
      const result = await blogService.updatePost(post.id, {
        title,
        content,
        excerpt: excerpt || title.substring(0, 150) + '...',
        cover_image: coverImage,
        status,
        scheduled_publish_date: status === 'scheduled' ? scheduledDate : null,
        categories: selectedCategories,
        tags: selectedTags
      });

      if (result.success) {
        setSuccess('Post updated successfully!');
        // Redirect to the post page after a short delay
        setTimeout(() => {
          window.location.href = `/blogs/${result.post.slug}`;
        }, 1500);
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const result = await categoryService.createCategory({
        name: newCategory.trim()
      });

      if (result.success) {
        setCategories([...categories, result.category]);
        setSelectedCategories([...selectedCategories, result.category.id]);
        setNewCategory('');
      }
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const result = await tagService.createTag({
        name: newTag.trim()
      });

      if (result.success) {
        setTags([...tags, result.tag]);
        setSelectedTags([...selectedTags, result.tag.id]);
        setNewTag('');
      }
    } catch (err) {
      console.error('Error adding tag:', err);
    }
  };

  const handleCategoryChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleTagChange = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted">Loading post data...</p>
        <p className="mt-2 text-sm text-gray-500">
          If loading takes too long, the post may not exist or you may not have permission to edit it.
          <br />
          <a href="/blogs" className="text-primary hover:underline">Return to all posts</a>
        </p>
      </div>
    );
  }

  if (error && !isAuthor) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg inline-block">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">You need to be the author of this post to edit it.</p>
          <a href="/blogs" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">
            Browse All Posts
          </a>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium mb-2">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt" className="block text-sm font-medium mb-2">Excerpt (optional)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of your post"
              className="w-full h-24"
            />
            <p className="text-xs text-text-muted mt-1">
              If left empty, the first 150 characters of your post will be used.
            </p>
          </div>

          <div>
            <Label htmlFor="coverImage" className="block text-sm font-medium mb-2">Cover Image</Label>
            <div className="mb-4">
              <CloudinaryUploader
                onImageSelect={(imageUrl) => {
                  console.log('Cloudinary image URL:', imageUrl);
                  setCoverImage(imageUrl);
                }}
                buttonText="Upload Cover Image"
                initialImage={coverImage}
                aspectRatio={16/9}
                imageType="post"
                uniqueId="edit-post-cover-image-uploader"
              />
            </div>

            {/* Show a preview of the cover image */}
            {coverImage && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <p className="text-sm font-medium px-4 py-2 bg-gray-50 border-b">Image Preview</p>
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Error loading cover image preview');
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="content" className="block text-sm font-medium mb-2">Content</Label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium mb-2">Categories</Label>
              <div className="space-y-2 mb-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryChange(category.id)}
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddCategory} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Tags</Label>
              <div className="space-y-2 mb-4">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleTagChange(tag.id)}
                    />
                    <label htmlFor={`tag-${tag.id}`} className="ml-2 text-sm">
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="block text-sm font-medium mb-2">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value;
                setStatus(newStatus);
                if (newStatus === 'scheduled') {
                  setShowScheduleOptions(true);
                  if (!scheduledDate) {
                    // Set default scheduled time to 1 hour from now
                    const defaultTime = new Date();
                    defaultTime.setHours(defaultTime.getHours() + 1);
                    setScheduledDate(defaultTime.toISOString().slice(0, 16));
                  }
                } else {
                  setShowScheduleOptions(false);
                }
              }}
              className="w-full"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </Select>
          </div>

          {/* Scheduled publishing options */}
          {showScheduleOptions && (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium mb-3">Schedule Publication</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="scheduledDate" className="block text-sm font-medium mb-2">
                    Publication Date and Time
                  </Label>
                  <Input
                    type="datetime-local"
                    id="scheduledDate"
                    value={scheduledDate}
                    min={(() => {
                      const now = new Date();
                      now.setMinutes(now.getMinutes() + 5); // Set minimum time to 5 minutes from now
                      return now.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
                    })()}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full"
                    required={status === 'scheduled'}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your post will be automatically published at the scheduled time.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Saving...
                </>
              ) : 'Update Post'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

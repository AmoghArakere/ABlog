import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/localStorageService';
import apiBlogService from '../lib/apiBlogService';
import ClientBlogPostCard from './ClientBlogPostCard';

export default function ClientBlogPostList({
  category = null,
  tag = null,
  authorId = null,
  initialPage = 1,
  postsPerPage = 9
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try to fetch from API first
        try {
          const categoriesData = await apiBlogService.getCategories();
          setCategories(categoriesData);
        } catch (apiError) {
          console.error('Error fetching categories from API, falling back to localStorage:', apiError);

          // Fallback to localStorage
          const categoriesData = await blogService.getCategories();
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts with params:', {
          page,
          limit: postsPerPage,
          category: selectedCategory,
          tag,
          authorId,
          search: searchResults ? searchTerm : null
        });

        // Try to fetch from API first
        try {
          const result = await apiBlogService.getPosts({
            page,
            limit: postsPerPage,
            category: selectedCategory,
            tag,
            authorId,
            search: searchResults ? searchTerm : null
          });

          console.log('Posts result from API:', result);
          const { posts: fetchedPosts, totalPages: pages } = result;

          console.log('Fetched posts from API:', fetchedPosts);
          setPosts(fetchedPosts);
          setTotalPages(pages);
          setLoading(false);
        } catch (apiError) {
          console.error('Error fetching posts from API, falling back to localStorage:', apiError);

          // Fallback to localStorage
          const result = await blogService.getPosts({
            page,
            limit: postsPerPage,
            category: selectedCategory,
            tag,
            authorId,
            search: searchResults ? searchTerm : null
          });

          console.log('Posts result from localStorage:', result);
          const { posts: fetchedPosts, totalPages: pages } = result;

          console.log('Fetched posts from localStorage:', fetchedPosts);
          setPosts(fetchedPosts);
          setTotalPages(pages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, postsPerPage, selectedCategory, tag, authorId, searchResults, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      setSearchResults(true);
      setPage(1);
    } else {
      // If search term is empty, reset search
      setSearchResults(null);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // If search field is cleared, reset search results
    if (e.target.value === '') {
      setSearchResults(null);
    }
  };

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug === 'all' ? null : categorySlug);
    setPage(1);
    setSearchResults(null);
    setSearchTerm('');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted dark:text-gray-300">Loading posts...</p>
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

  return (
    <div>
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedCategory ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category.slug ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="relative">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search blogs..."
              className="w-full md:w-1/2 px-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-md md:right-[calc(50%+8px)]"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted dark:text-gray-300">No posts found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <ClientBlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      page === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

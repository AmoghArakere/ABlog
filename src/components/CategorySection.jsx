import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/localStorageService';

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await blogService.getCategories();
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-text-muted dark:text-gray-400">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Explore Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map(category => (
          <a
            key={category.id}
            href={`/blogs?category=${category.slug}`}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow dark:border dark:border-slate-700"
          >
            <div className="text-primary text-3xl mb-2">
              {getCategoryIcon(category.slug)}
            </div>
            <h3 className="font-semibold dark:text-white">{category.name}</h3>
            <p className="text-sm text-text-muted dark:text-gray-400 mt-1">{category.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function getCategoryIcon(slug) {
  switch (slug) {
    case 'technology':
      return '💻';
    case 'design':
      return '🎨';
    case 'business':
      return '💼';
    case 'health':
      return '🏥';
    case 'productivity':
      return '⏱️';
    default:
      return '📝';
  }
}

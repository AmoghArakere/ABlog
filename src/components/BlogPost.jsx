import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { blogService, likeService, bookmarkService, commentService } from '../lib/localStorageService';
import CommentSection from './CommentSection';

export default function BlogPost({ slug }) {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        // Fetch post by slug
        const postData = await blogService.getPostBySlug(slug);

        if (!postData) {
          setError('Post not found');
          setLoading(false);
          return;
        }

        setPost(postData);

        // Fetch like count
        const likes = await likeService.getLikeCount(postData.id);
        setLikeCount(likes);

        // Check if user has liked or bookmarked the post
        if (user) {
          const hasLiked = await likeService.hasLiked(postData.id, user.id);
          setLiked(hasLiked);

          const hasBookmarked = await bookmarkService.hasBookmarked(postData.id, user.id);
          setBookmarked(hasBookmarked);
        }

        // Fetch related posts (posts with same category or by same author)
        if (postData.categories && postData.categories.length > 0) {
          const { posts: related } = await blogService.getPosts({
            category: postData.categories[0].slug,
            limit: 3
          });

          // Filter out the current post
          setRelatedPosts(related.filter(p => p.id !== postData.id));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      if (liked) {
        await likeService.unlikePost(post.id, user.id);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await likeService.likePost(post.id, user.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error liking/unliking post:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      if (bookmarked) {
        await bookmarkService.removeBookmark(post.id, user.id);
        setBookmarked(false);
      } else {
        await bookmarkService.bookmarkPost(post.id, user.id);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Error bookmarking/unbookmarking post:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg inline-block">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">The post you're looking for might have been removed or doesn't exist.</p>
          <a href="/blogs" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">
            Browse All Posts
          </a>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <a href="/blogs" className="text-primary hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </a>
        </div>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              {post.author.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.full_name || post.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-sm font-bold">
                  {(post.author.full_name || post.author.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3">
              <a href={`/user/${post.author.username}`} className="text-sm font-medium hover:underline">
                {post.author.full_name || post.author.username}
              </a>
              <p className="text-xs text-text-muted">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })} · {Math.ceil(post.content.length / 1000)} min read
              </p>
            </div>
          </div>
          <div className="ml-auto flex space-x-2">
            <button
              className={`p-2 rounded-full ${liked ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={handleLike}
              title={liked ? 'Unlike' : 'Like'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount > 0 && <span className="ml-1 text-sm">{likeCount}</span>}
            </button>
            <button
              className={`p-2 rounded-full ${bookmarked ? 'bg-primary/10 text-primary' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={handleBookmark}
              title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

          </div>
        </div>
        {post.cover_image && (
          <div className="h-80 bg-gray-200 rounded-lg mb-8 overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder-cover.svg';
                console.log('Cover image load error, using placeholder');
              }}
            />
          </div>
        )}
      </div>

      <div
        className="prose max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {post.categories && post.categories.map(category => (
          <a
            key={category.id}
            href={`/blogs?category=${category.slug}`}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
          >
            {category.name}
          </a>
        ))}
        {post.tags && post.tags.map(tag => (
          <a
            key={tag.id}
            href={`/blogs?tag=${tag.slug}`}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
          >
            #{tag.name}
          </a>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-8 mb-12">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.full_name || post.author.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xl font-bold">
                {(post.author.full_name || post.author.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold">
              <a href={`/user/${post.author.username}`} className="hover:underline">
                {post.author.full_name || post.author.username}
              </a>
            </h3>
            {post.author.bio && <p className="text-text-muted mt-1">{post.author.bio}</p>}
            <a href={`/user/${post.author.username}`} className="text-primary hover:underline text-sm mt-2 inline-block">
              View Profile
            </a>
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="border-t border-gray-200 pt-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => (
              <a
                key={relatedPost.id}
                href={`/blogs/${relatedPost.slug}`}
                className="block group"
              >
                <div className="h-40 bg-gray-200 rounded-lg overflow-hidden mb-3">
                  {relatedPost.cover_image && (
                    <img
                      src={relatedPost.cover_image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {relatedPost.title}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {Math.ceil(relatedPost.content.length / 1000)} min read
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-2xl font-semibold mb-6">Comments</h3>
        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}

import { useState, useEffect } from 'react';
import { blogService, likeService, bookmarkService, commentService } from '../lib/localStorageService';
import apiBlogService from '../lib/apiBlogService';
import authService from '../lib/authService';
import ClientCommentSection from './ClientCommentSection';
import PostActions from './PostActions';

// Function to process content and fix image display and spacing issues
const processContent = (content) => {
  if (!content) return '';

  let processedContent = content;

  // Process all markdown elements

  // Process headers
  processedContent = processedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  processedContent = processedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  processedContent = processedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Process blockquotes (lines starting with >)
  processedContent = processedContent.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');

  // Process bold and italic
  processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  processedContent = processedContent.replace(/\*(.+?)\*/g, '<em>$1</em>');
  processedContent = processedContent.replace(/_(.+?)_/g, '<em>$1</em>');

  // Process code blocks and inline code
  processedContent = processedContent.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
  processedContent = processedContent.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process lists
  // First, identify list blocks
  const listRegex = /(^[\s]*[-*+] .+\n?)+/gm;
  processedContent = processedContent.replace(listRegex, match => {
    // Convert each list item
    const listItems = match.split('\n')
      .filter(line => line.trim().match(/^[-*+] /))
      .map(line => {
        const content = line.trim().replace(/^[-*+] /, '');
        return `<li>${content}</li>`;
      })
      .join('');
    return `<ul>${listItems}</ul>`;
  });

  // Process ordered lists
  const orderedListRegex = /(^[\s]*\d+\. .+\n?)+/gm;
  processedContent = processedContent.replace(orderedListRegex, match => {
    // Convert each list item
    const listItems = match.split('\n')
      .filter(line => line.trim().match(/^\d+\. /))
      .map(line => {
        const content = line.trim().replace(/^\d+\. /, '');
        return `<li>${content}</li>`;
      })
      .join('');
    return `<ol>${listItems}</ol>`;
  });

  // Process links
  processedContent = processedContent.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process horizontal rules
  processedContent = processedContent.replace(/^---$/gm, '<hr>');

  // Preserve line breaks in the original content
  // Convert single line breaks to <br> tags
  processedContent = processedContent.replace(/(?<!\n)\n(?!\n)(?!<\/blockquote>|<\/h[1-6]>|<\/li>|<\/pre>|<\/code>)/g, '<br>');

  // Convert double line breaks to paragraph breaks
  processedContent = processedContent.replace(/\n\n+/g, '</p><p>');

  // Ensure content is wrapped in paragraphs if it doesn't start with a tag
  if (!processedContent.trim().startsWith('<')) {
    processedContent = `<p>${processedContent}</p>`;
  }

  // Remove image markdown
  processedContent = processedContent.replace(/!\[(.*?)\]\((.*?)\)/g, '');

  // Remove base64 images
  processedContent = processedContent.replace(/<img\s+src="(data:image\/[^;]+;base64,[^"]+)"([^>]*)>/g, '');

  // Remove regular image tags
  processedContent = processedContent.replace(/<img\s+src="(?!data:)([^"]+)"([^>]*)>/g, '');

  // Fix spacing between paragraphs
  processedContent = processedContent.replace(/<\/p><p>/g, '</p>\n<p>');

  // Fix spacing after headers
  processedContent = processedContent.replace(/<\/h[1-6]><p>/g, (match) => match.replace('><p>', '>\n<p>'));

  // Fix spacing before and after lists
  processedContent = processedContent.replace(/<\/p><ul>/g, '</p>\n<ul>');
  processedContent = processedContent.replace(/<\/ul><p>/g, '</ul>\n<p>');

  // Fix spacing before and after blockquotes
  processedContent = processedContent.replace(/<\/p><blockquote>/g, '</p>\n<blockquote>');
  processedContent = processedContent.replace(/<\/blockquote><p>/g, '</blockquote>\n<p>');

  // Fix spacing before and after code blocks
  processedContent = processedContent.replace(/<\/p><pre>/g, '</p>\n<pre>');
  processedContent = processedContent.replace(/<\/pre><p>/g, '</pre>\n<p>');

  return processedContent;
};

export default function ClientBlogPost({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get the current user from localStorage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const fetchPost = async () => {
      try {
        setLoading(true);
        console.log(`Fetching post with slug: ${slug}`);

        // Try to fetch from API first
        try {
          console.log('Attempting to fetch post from API...');
          const postData = await apiBlogService.getPostBySlug(slug);

          if (postData) {
            console.log('Post found in API:', postData);
            setPost(postData);
          } else {
            console.log('Post not found in API, falling back to localStorage');
            // Fallback to localStorage
            const localPostData = await blogService.getPostBySlug(slug);

            if (!localPostData) {
              console.error('Post not found in localStorage either');
              setError('Post not found');
              setLoading(false);
              return;
            }

            console.log('Post found in localStorage:', localPostData);
            setPost(localPostData);
          }
        } catch (apiError) {
          console.error('Error fetching post from API:', apiError);

          // Fallback to localStorage
          console.log('Falling back to localStorage due to API error');
          const localPostData = await blogService.getPostBySlug(slug);

          if (!localPostData) {
            console.error('Post not found in localStorage either');
            setError('Post not found');
            setLoading(false);
            return;
          }

          console.log('Post found in localStorage:', localPostData);
          setPost(localPostData);
        }

        // At this point, post is set in state
        // Use the post from state to fetch likes and bookmarks
        const currentPost = post || {};

        // Fetch like count if we have a post
        if (currentPost.id) {
          console.log(`Fetching like count for post ID: ${currentPost.id}`);
          const likes = await likeService.getLikeCount(currentPost.id);
          setLikeCount(likes);

          // Check if user has liked or bookmarked the post
          if (currentUser) {
            const hasLiked = await likeService.hasLiked(currentPost.id, currentUser.id);
            setLiked(hasLiked);

            const hasBookmarked = await bookmarkService.hasBookmarked(currentPost.id, currentUser.id);
            setBookmarked(hasBookmarked);
          }
        } else {
          console.log('No post ID available yet, skipping like/bookmark fetch');
        }

        // Fetch related posts (posts with same category or by same author)
        if (currentPost.categories && currentPost.categories.length > 0) {
          console.log(`Fetching posts with category: ${currentPost.categories[0].slug}`);
          try {
            const { posts: related } = await blogService.getPosts({
              category: currentPost.categories[0].slug,
              limit: 3
            });

            // Filter out the current post
            const filteredPosts = related.filter(p => p.id !== currentPost.id);
            console.log(`Found ${filteredPosts.length} related posts by category`);
            setRelatedPosts(filteredPosts);
          } catch (error) {
            console.error('Error fetching related posts by category:', error);
          }
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
  }, [slug]);

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
          <a href="/blogs" className="text-primary hover:underline flex items-center dark:text-blue-400 dark:hover:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </a>
        </div>
        <h1 className="text-4xl font-bold mb-4 dark:text-text-dark">{post.title}</h1>
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden">
              {post.author && post.author.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={(post.author.full_name || post.author.username || 'Author')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-profile.svg';
                    console.log('Author avatar failed to load, using placeholder');
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-sm font-bold">
                  {post.author && post.author.username ? post.author.username.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>
            <div className="ml-3">
              <a href={`/user/${post.author && post.author.username ? post.author.username : ''}`} className="text-sm font-medium hover:underline dark:text-text-dark dark:hover:text-purple-400">
                {post.author ? (post.author.full_name || post.author.username || 'Anonymous') : (post.author_id ? 'Author' : 'Anonymous')}
              </a>
              <p className="text-xs text-text-muted dark:text-text-dark-muted">
                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Unknown date'}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <PostActions
              liked={liked}
              bookmarked={bookmarked}
              likeCount={likeCount}
              onLike={handleLike}
              onBookmark={handleBookmark}
              showEdit={user && post.author_id === user.id}
              onEdit={() => window.location.href = '/direct-edit'}
            />
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
                e.target.src = '/images/placeholder-blog.svg';
                console.log('Cover image failed to load, using local placeholder');
              }}
            />
          </div>
        )}
      </div>

      <div className="prose max-w-none mb-12 blog-content">
        <style jsx>{`
          /* Image styles removed */
          .blog-content p {
            margin-bottom: 1rem !important;
            line-height: 1.7 !important;
          }
          .blog-content br {
            display: block !important;
            content: "" !important;
            margin-top: 0.5rem !important;
          }
          .blog-content h1, .blog-content h2, .blog-content h3 {
            margin-top: 1.5rem !important;
            margin-bottom: 1rem !important;
            font-weight: 600 !important;
          }
          .blog-content h1 {
            font-size: 1.875rem !important;
          }
          .blog-content h2 {
            font-size: 1.5rem !important;
          }
          .blog-content h3 {
            font-size: 1.25rem !important;
          }
          .blog-content ul, .blog-content ol {
            margin-bottom: 1rem !important;
            padding-left: 1.5rem !important;
          }
          .blog-content ul {
            list-style-type: disc !important;
          }
          .blog-content ol {
            list-style-type: decimal !important;
          }
          .blog-content li {
            margin-bottom: 0.5rem !important;
          }
          .blog-content blockquote {
            border-left: 4px solid #3b82f6 !important;
            padding: 1rem !important;
            font-style: italic !important;
            margin: 1.5rem 0 !important;
            color: #4b5563 !important;
            background-color: #f0f7ff !important;
            border-radius: 0 0.375rem 0.375rem 0 !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          }
          .blog-content pre {
            background-color: #f3f4f6 !important;
            padding: 1rem !important;
            border-radius: 0.375rem !important;
            overflow-x: auto !important;
            margin: 1.5rem 0 !important;
          }
          .blog-content code {
            background-color: #f3f4f6 !important;
            padding: 0.2rem 0.4rem !important;
            border-radius: 0.25rem !important;
            font-size: 0.875rem !important;
            font-family: monospace !important;
          }
          .blog-content strong {
            font-weight: 700 !important;
            color: #111827 !important;
          }
          .blog-content em {
            font-style: italic !important;
            color: #4b5563 !important;
          }
          .blog-content a {
            color: #3b82f6 !important;
            text-decoration: underline !important;
            text-underline-offset: 2px !important;
            transition: color 0.2s ease !important;
          }
          .blog-content a:hover {
            color: #2563eb !important;
          }
          .blog-content hr {
            margin: 2rem 0 !important;
            border: 0 !important;
            border-top: 1px solid #e5e7eb !important;
          }
          /* Fix spacing between elements */
          .blog-content * + * {
            margin-top: 0.5rem !important;
          }
          .blog-content p + p {
            margin-top: 1rem !important;
          }
          .blog-content h1 + p,
          .blog-content h2 + p,
          .blog-content h3 + p {
            margin-top: 0.75rem !important;
          }
          .blog-content ul + p,
          .blog-content ol + p,
          .blog-content blockquote + p,
          .blog-content pre + p {
            margin-top: 1rem !important;
          }
          .blog-content p + ul,
          .blog-content p + ol,
          .blog-content p + blockquote,
          .blog-content p + pre {
            margin-top: 1rem !important;
          }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: processContent(post.content) }} />
      </div>

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
          <div className="w-16 h-16 bg-gray-800 rounded-full overflow-hidden">
            {post.author && post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={(post.author && (post.author.full_name || post.author.username)) || 'Author'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder-profile.svg';
                  console.log('Author avatar failed to load, using placeholder');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xl font-bold">
                {post.author && post.author.username ? post.author.username.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold dark:text-white">
              <a href={post.author && post.author.username ? `/user/${post.author.username}` : '#'} className="hover:underline hover:text-purple-500">
                {post.author ? (post.author.full_name || post.author.username || 'Anonymous') :
                  (post.author_id ? post.author_name || 'Author' : 'Anonymous')}
              </a>
            </h3>
            {post.author && post.author.bio && <p className="text-text-muted dark:text-gray-400 mt-1">{post.author.bio}</p>}
            {post.author && post.author.username && (
              <a href={`/user/${post.author.username}`} className="text-purple-500 hover:underline text-sm mt-2 inline-block">
                View Profile
              </a>
            )}
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
                <div className="h-40 bg-gray-800 rounded-lg overflow-hidden mb-3">
                  {relatedPost.cover_image && (
                    <img
                      src={relatedPost.cover_image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.log('Related post image failed to load:', relatedPost.title);
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder-blog.svg';
                      }}
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
        <ClientCommentSection postId={post.id} />
      </div>
    </article>
  );
}

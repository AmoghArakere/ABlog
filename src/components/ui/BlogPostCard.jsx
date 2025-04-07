import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Bookmark, Share2, Edit } from 'lucide-react';
import authService from '../../lib/authService';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';

export default function BlogPostCard({ post }) {
  const [user, setUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    // Check if the current user is the author of the post
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    if (currentUser && post.author_id === currentUser.id) {
      setIsAuthor(true);
    }
  }, [post.author_id]);

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'recently';

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {post.cover_image ? (
          <>
            {/* Use a placeholder while the image loads */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {/* The actual image */}
            <img
              src={post.cover_image}
              alt={post.title}
              className="relative z-10 h-full w-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none'; // Hide the image on error
                console.log('Image failed to load:', post.cover_image);
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          {post.categories && post.categories.map(category => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              {category.name}
            </a>
          ))}
        </div>

        <a href={`/blogs/${post.slug}`} className="group">
          <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors dark:text-text-dark dark:group-hover:text-blue-400">
            {post.title}
          </h3>
        </a>

        <div className="mt-2 flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {post.author && post.author.avatar_url ? (
              <AvatarImage src={post.author.avatar_url} alt={post.author.full_name || post.author.username} />
            ) : (
              <AvatarFallback className="bg-purple-600 text-white">
                A
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <a
              href={post.author ? `/profile/${post.author.username}` : '#'}
              className="text-sm font-medium hover:text-primary transition-colors dark:text-text-dark dark:hover:text-blue-400"
            >
              {post.author ? (post.author.full_name || post.author.username) :
                (post.author_id ? post.author_name || 'Amogh' : 'Amogh')}
            </a>
            <p className="text-xs text-text-muted dark:text-text-dark-muted">{formattedDate}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <p className="text-text-muted dark:text-text-dark-muted line-clamp-3">{post.excerpt}</p>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" className="gap-1 text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{Math.floor(Math.random() * 100)}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{Math.floor(Math.random() * 20)}</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
            <Bookmark className="h-4 w-4" />
          </Button>

          {isAuthor && (
            <a
              href={`/simple-edit?id=${post.id}`}
              className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              title="Edit this post"
            >
              <Edit className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

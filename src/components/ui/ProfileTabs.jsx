import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Card } from './card';
import BlogPostCard from './BlogPostCard';

export default function ProfileTabs({ profile, posts, bookmarks }) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full bg-white border-b border-gray-200 rounded-none p-0 h-auto">
        <TabsTrigger
          value="posts"
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-3"
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="bookmarks"
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-3"
        >
          Bookmarks
        </TabsTrigger>
        <TabsTrigger
          value="about"
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-3"
        >
          About
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-text-muted">No posts yet.</p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bookmarks" className="mt-6">
        {bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-text-muted">No bookmarks yet.</p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="about" className="mt-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">About {profile.full_name || profile.username}</h3>

          {profile.bio ? (
            <p className="mb-4">{profile.bio}</p>
          ) : (
            <p className="text-text-muted mb-4">No bio provided.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="font-medium mb-2">Location</h4>
              <p className="text-text-muted">{profile.location || 'Not specified'}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Website</h4>
              {profile.website ? (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 hover:underline"
                >
                  {profile.website}
                </a>
              ) : (
                <p className="text-text-muted">Not specified</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Joined</h4>
              <p className="text-text-muted">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

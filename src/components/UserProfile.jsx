import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService, blogService } from '../lib/localStorageService';
import { getImageUrl } from '../lib/imageUtils';

export default function UserProfile({ username }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Fetch profile by username
        const profileData = await profileService.getUserByUsername(username);

        if (!profileData) {
          setError('User not found');
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch user's posts
        const { posts: userPosts, total } = await blogService.getPosts({ authorId: profileData.id });
        setPosts(userPosts);

        // Update stats
        const followersData = await profileService.getFollowers(profileData.id);
        const followingData = await profileService.getFollowing(profileData.id);

        setStats({
          posts: total,
          followers: followersData.total,
          following: followingData.total
        });

        // Check if current user is following this profile
        if (user) {
          const following = await profileService.isFollowing(user.id, profileData.id);
          setIsFollowing(following);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, user]);

  const handleFollow = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      if (isFollowing) {
        await profileService.unfollowUser(user.id, profile.id);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await profileService.followUser(user.id, profile.id);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg inline-block">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">Please check the username and try again.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 bg-primary/20 relative">
          {user && user.id === profile.id && (
            <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
        <div className="px-6 py-8 relative">
          <div className="absolute -top-16 left-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={getImageUrl(profile.avatar_url, '/images/placeholder-profile.svg')}
                  alt={profile.full_name || profile.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-profile.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-bold">
                  {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {user && user.id === profile.id && (
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-16">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
                <p className="text-text-muted">@{profile.username}</p>
              </div>
              {user && user.id !== profile.id && (
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:opacity-90 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              {user && user.id === profile.id && (
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-md hover:opacity-90 transition-colors">
                  Edit Profile
                </button>
              )}
            </div>
            <div className="mt-6">
              {profile.bio && <p className="text-text-muted">{profile.bio}</p>}
              {!profile.bio && user && user.id === profile.id && (
                <p className="text-text-muted italic">Add a bio to tell people about yourself</p>
              )}
            </div>
            <div className="flex items-center mt-4 space-x-4">
              {profile.location && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="ml-1 text-sm text-text-muted">{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="ml-1 text-sm text-blue-500 hover:underline hover:text-blue-600">{profile.website.replace(/^https?:\/\//, '')}</a>
                </div>
              )}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-1 text-sm text-text-muted">Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex mt-6 space-x-6">
              <div>
                <span className="font-semibold">{stats.posts}</span>
                <span className="text-text-muted ml-1">Posts</span>
              </div>
              <div>
                <span className="font-semibold">{stats.followers}</span>
                <span className="text-text-muted ml-1">Followers</span>
              </div>
              <div>
                <span className="font-semibold">{stats.following}</span>
                <span className="text-text-muted ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 border-b-2 ${activeTab === 'posts' ? 'border-primary font-medium' : 'border-transparent text-text-muted hover:text-text'}`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 border-b-2 ${activeTab === 'saved' ? 'border-primary font-medium' : 'border-transparent text-text-muted hover:text-text'}`}
            >
              Saved
            </button>
            {user && user.id === profile.id && (
              <button
                onClick={() => setActiveTab('drafts')}
                className={`px-4 py-2 border-b-2 ${activeTab === 'drafts' ? 'border-primary font-medium' : 'border-transparent text-text-muted hover:text-text'}`}
              >
                Drafts
              </button>
            )}
            {user && user.id === profile.id && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 border-b-2 ${activeTab === 'settings' ? 'border-primary font-medium' : 'border-transparent text-text-muted hover:text-text'}`}
              >
                Settings
              </button>
            )}
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-muted">No posts yet.</p>
                  {user && user.id === profile.id && (
                    <a href="/create-post" className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                      Write your first post
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      {post.cover_image && (
                        <div className="h-48 bg-gray-200">
                          <img
                            src={getImageUrl(post.cover_image, '/images/placeholder-blog.svg')}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/placeholder-blog.svg';
                            }}
                          />
                        </div>
                      )}
                      {!post.cover_image && <div className="h-48 bg-gray-200"></div>}
                      <div className="p-6">
                        <div className="flex items-center mb-2">
                          <span className="text-xs bg-primary-light text-primary-dark px-2 py-1 rounded-full">
                            {post.categories?.[0]?.name || 'Uncategorized'}
                          </span>
                          <span className="text-xs text-text-muted ml-2">
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                        <p className="text-text-muted mb-4">{post.excerpt || `${post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...`}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xs text-text-muted">
                              {Math.ceil(post.content.length / 1000)} min read
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {user && user.id === profile.id && (
                              <>
                                <a href={`/edit-post/${post.slug}`} className="p-1 text-text-muted hover:text-text">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </a>
                                <button className="p-1 text-text-muted hover:text-text">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <a href={`/blogs/${post.slug}`} className="text-primary hover:underline text-sm">Read more</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <div className="text-center py-12">
              <p className="text-text-muted">Saved posts will appear here.</p>
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="text-center py-12">
              <p className="text-text-muted">Draft posts will appear here.</p>
              <a href="/create-post" className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                Create new post
              </a>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    id="username"
                    defaultValue={profile.username}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    defaultValue={profile.full_name || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    id="bio"
                    defaultValue={profile.bio || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="4"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    id="website"
                    defaultValue={profile.website || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    id="location"
                    defaultValue={profile.location || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

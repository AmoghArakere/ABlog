import React, { useState, useEffect } from 'react';
import { profileService, blogService, bookmarkService } from '../lib/localStorageService';
import authService from '../lib/authService';
import { useToastContext } from '../contexts/ToastContext';
import ClientBlogPostCard from './ClientBlogPostCard';
import ImageUploader from './ImageUploader';
import ImageAdjuster from './ImageAdjuster';

export default function ClientUserProfile({ username, isCurrentUser = false }) {
  const toast = useToastContext();
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
  const [user, setUser] = useState(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [showProfilePicAdjuster, setShowProfilePicAdjuster] = useState(false);
  const [showCoverImageAdjuster, setShowCoverImageAdjuster] = useState(false);
  const [tempProfilePic, setTempProfilePic] = useState(null);
  const [tempCoverImage, setTempCoverImage] = useState(null);

  useEffect(() => {
    // Get the current user from localStorage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

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
        if (currentUser) {
          const following = await profileService.isFollowing(currentUser.id, profileData.id);
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
  }, [username]);

  const fetchBookmarkedPosts = async () => {
    if (!user) return;

    try {
      setBookmarksLoading(true);
      const { posts } = await bookmarkService.getBookmarkedPosts(user.id);
      setBookmarkedPosts(posts);
      setBookmarksLoading(false);
    } catch (err) {
      console.error('Error fetching bookmarked posts:', err);
      setBookmarksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved' && user && bookmarkedPosts.length === 0 && !bookmarksLoading) {
      fetchBookmarkedPosts();
    }
  }, [activeTab, user]);

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
        toast.show('Unfollowed successfully');
      } else {
        await profileService.followUser(user.id, profile.id);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.show('Following successfully');
      }
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
      toast.show('Error updating follow status');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if ((!user || user.id !== profile.id) && !isCurrentUser) return;

    const formData = new FormData(e.target);
    const updatedProfile = {
      username: formData.get('username'),
      full_name: formData.get('fullName'),
      bio: formData.get('bio'),
      avatar_url: formData.get('avatar_url'),
      cover_image: formData.get('cover_image'),
      website: formData.get('website'),
      location: formData.get('location')
    };

    // Check if username is being changed
    const usernameChanged = updatedProfile.username !== profile.username;

    try {
      const result = await profileService.updateProfile(user.id, updatedProfile);
      if (result) {
        setProfile({ ...profile, ...updatedProfile });
        toast.success('Profile updated successfully!');

        // If username was changed, redirect to the new profile URL
        if (usernameChanged) {
          // Update the URL without refreshing the page
          window.history.pushState({}, '', `/user/${updatedProfile.username}`);
          // Reload the page to ensure everything is updated correctly
          window.location.href = `/user/${updatedProfile.username}`;
        } else {
          setActiveTab('posts');
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.message === 'Username already taken') {
        toast.error('Username already taken. Please choose a different username.');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden dark:border dark:border-slate-700">
        <div className="h-48 relative bg-gradient-to-r from-purple-900/50 to-black overflow-hidden">
          {profile.cover_image && (
            <img
              src={profile.cover_image}
              alt="Cover"
              className="w-full h-full object-cover header-cover-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder-cover.svg';
              }}
            />
          )}
          {/* Edit button removed */}
        </div>
        <div className="px-6 py-8 relative">
          <div className="absolute -top-16 left-6">
            <div className="w-32 h-32 bg-gray-800 rounded-full border-4 border-black dark:border-gray-900 overflow-hidden relative group">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  className="w-full h-full object-cover header-profile-pic"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-cover.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white text-4xl font-bold">
                  {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}

              {/* Edit button removed */}
            </div>
          </div>
          <div className="mt-16">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold dark:text-white">{profile.full_name || profile.username}</h1>
                <p className="text-text-muted dark:text-gray-400">@{profile.username}</p>
              </div>
              {user && user.id !== profile.id && (
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isFollowing
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:opacity-90 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              {(user && user.id === profile.id) || isCurrentUser ? (
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-md hover:opacity-90 transition-colors"
                >
                  Edit Profile
                </button>
              ) : null}
            </div>
            <div className="mt-6">
              {profile.bio && <p className="text-text-muted dark:text-gray-300">{profile.bio}</p>}
              {!profile.bio && ((user && user.id === profile.id) || isCurrentUser) && (
                <p className="text-text-muted dark:text-gray-400 italic">Add a bio to tell people about yourself</p>
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
              className={`px-4 py-2 border-b-2 ${activeTab === 'posts' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-text-muted hover:text-text dark:hover:text-white'}`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 border-b-2 ${activeTab === 'saved' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-text-muted hover:text-text dark:hover:text-white'}`}
            >
              Saved
            </button>
            {user && user.id === profile.id && (
              <button
                onClick={() => setActiveTab('drafts')}
                className={`px-4 py-2 border-b-2 ${activeTab === 'drafts' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-text-muted hover:text-text dark:hover:text-white'}`}
              >
                Drafts
              </button>
            )}
            {((user && user.id === profile.id) || isCurrentUser) && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 border-b-2 ${activeTab === 'settings' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-text-muted hover:text-text dark:hover:text-white'}`}
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
                  {((user && user.id === profile.id) || isCurrentUser) && (
                    <a href="/create-post" className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-md hover:opacity-90 transition-colors">
                      Write your first post
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map(post => (
                    <ClientBlogPostCard key={post.id} post={post} showAuthor={false} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {bookmarksLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-text-muted">Loading saved posts...</p>
                </div>
              ) : bookmarkedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-muted">No saved posts yet.</p>
                  <a href="/blogs" className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    Browse posts
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {bookmarkedPosts.map(post => (
                    <ClientBlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'drafts' && (
            <div className="text-center py-12">
              <p className="text-text-muted">Draft posts will appear here.</p>
              <a href="/create-post" className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Create new post
              </a>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 dark:text-white dark:border dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6 dark:text-blue-400">Profile Settings</h2>
              <form className="space-y-6" onSubmit={handleUpdateProfile}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2 dark:text-blue-300">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    defaultValue={profile.username}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2 dark:text-blue-300">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    defaultValue={profile.full_name || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-2 dark:text-blue-300">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    defaultValue={profile.bio || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                    rows="4"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="avatar_upload" className="block text-sm font-medium mb-2 dark:text-blue-300">Profile Picture</label>
                    <input type="hidden" name="avatar_url" id="avatar_url" value={profile.avatar_url || ''} />
                    <div className="space-y-4">
                      <ImageUploader
                        onImageSelect={(imageData) => {
                          if (imageData) {
                            // Store the image temporarily for adjustment
                            setTempProfilePic(imageData);
                            setShowProfilePicAdjuster(true);
                          }
                        }}
                        buttonText="Upload Profile Picture"
                      />
                      {profile.avatar_url && (
                        <div className="mt-2">
                          <p className="text-xs text-text-muted dark:text-gray-400">Current profile picture:</p>
                          <div className="relative mt-1 inline-block">
                            <img
                              src={profile.avatar_url}
                              alt="Current avatar"
                              className="h-20 w-20 object-cover rounded-full preview-profile-pic"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder-cover.svg';
                              }}
                            />
                            {/* Edit button removed */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cover_image" className="block text-sm font-medium mb-2 dark:text-blue-300">Cover Image</label>
                    <input type="hidden" name="cover_image" id="cover_image" value={profile.cover_image || ''} />
                    <div className="space-y-4">
                      <ImageUploader
                        onImageSelect={(imageData) => {
                          if (imageData) {
                            // Store the image temporarily for adjustment
                            setTempCoverImage(imageData);
                            setShowCoverImageAdjuster(true);
                          }
                        }}
                        buttonText="Upload Cover Image"
                      />
                      {profile.cover_image && (
                        <div className="mt-2">
                          <p className="text-xs text-text-muted dark:text-gray-400">Current cover image:</p>
                          <div className="relative mt-1">
                            <img
                              src={profile.cover_image}
                              alt="Current cover"
                              className="h-20 w-full object-cover rounded preview-cover-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder-cover.svg';
                              }}
                            />
                            {/* Edit button removed */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-2 dark:text-blue-300">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    defaultValue={profile.website || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2 dark:text-blue-300">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    defaultValue={profile.location || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-md hover:opacity-90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture Adjuster Modal */}
      {showProfilePicAdjuster && tempProfilePic && (
        <ImageAdjuster
          imageData={tempProfilePic}
          aspectRatio={1} // Square for profile pictures
          title="Adjust Profile Picture"
          minScale={1}
          maxScale={4}
          onSave={(adjustedImage) => {
            // Update the hidden input value
            const hiddenInput = document.getElementById('avatar_url');
            if (hiddenInput) hiddenInput.value = adjustedImage;

            // Show a preview
            const previewImg = document.querySelector('.preview-profile-pic');
            if (previewImg) {
              previewImg.src = adjustedImage;
              // Also update the profile picture in the header if it exists
              const headerProfilePic = document.querySelector('.header-profile-pic');
              if (headerProfilePic) headerProfilePic.src = adjustedImage;
            }

            setShowProfilePicAdjuster(false);
          }}
          onCancel={() => setShowProfilePicAdjuster(false)}
        />
      )}

      {/* Cover Image Adjuster Modal */}
      {showCoverImageAdjuster && tempCoverImage && (
        <ImageAdjuster
          imageData={tempCoverImage}
          aspectRatio={2.5} // Wide rectangle for cover images
          title="Adjust Cover Image"
          minScale={1}
          maxScale={4}
          onSave={(adjustedImage) => {
            // Update the hidden input value
            const hiddenInput = document.getElementById('cover_image');
            if (hiddenInput) hiddenInput.value = adjustedImage;

            // Show a preview
            const previewImg = document.querySelector('.preview-cover-image');
            if (previewImg) {
              previewImg.src = adjustedImage;
              // Also update the cover image in the header if it exists
              const headerCoverImg = document.querySelector('.header-cover-image');
              if (headerCoverImg) headerCoverImg.src = adjustedImage;
            }

            setShowCoverImageAdjuster(false);
          }}
          onCancel={() => setShowCoverImageAdjuster(false)}
        />
      )}
    </div>
  );
}

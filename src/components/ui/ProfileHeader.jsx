import React from 'react';
import { MapPin, Link as LinkIcon, Calendar, Users, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { getImageUrl } from '../../lib/imageUtils';

export default function ProfileHeader({ profile, isCurrentUser, onEditProfile }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/10 overflow-hidden">
        {profile.cover_image && (
          <img
            src={getImageUrl(profile.cover_image, '/images/placeholder-cover.svg')}
            alt="Cover"
            className="w-full h-full object-cover header-cover-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-cover.svg';
            }}
          />
        )}

        {isCurrentUser && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEditProfile}
            className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:opacity-90 text-white shadow-sm"
            title="Edit Profile"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end -mt-12 md:-mt-16 mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-md">
              {profile.avatar_url ? (
                <AvatarImage
                  src={getImageUrl(profile.avatar_url, '/images/placeholder-profile.svg')}
                  alt={profile.full_name || profile.username}
                  className="header-profile-pic"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-profile.svg';
                  }}
                />
              ) : (
                <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white">
                  {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Edit button removed */}
          </div>

          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-text-muted">@{profile.username}</p>
          </div>

          {!isCurrentUser && (
            <div className="mt-4 md:mt-0">
              <Button className="w-full md:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:opacity-90 text-white">
                Follow
              </Button>
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="mb-4">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-text-muted">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              <a href="#followers" className="hover:text-blue-500">
                <strong>123</strong> Followers
              </a>
              {' · '}
              <a href="#following" className="hover:text-blue-500">
                <strong>45</strong> Following
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

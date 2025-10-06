'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserProfile, Post } from '@/lib/types'; // Using our defined types
import { Grid, Edit3, Image as ImageIcon, Music, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Sub-Components ---

const ProfileHeader = ({ user, setActiveTab }: { user: UserProfile, setActiveTab: (tab: 'posts' | 'edit') => void }) => {
  const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `Joined ${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `Joined ${Math.floor(interval)} months ago`;
    return `Joined recently`;
  };

  return (
    <header className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row items-center">
      <img
        src={user.avatarUrl || '/default-avatar.png'}
        alt={user.username}
        className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#6A1B9A] object-cover shadow-lg mb-4 md:mb-0 md:mr-8 flex-shrink-0"
      />
      <div className="text-center md:text-left flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold text-[#212121]">{user.username}</h1>
        <div className="mt-4 flex justify-center md:justify-start space-x-8 text-md text-[#2F3E46]">
          <div><span className="font-bold text-[#212121] block text-xl">{user._count.posts}</span> posts</div>
          <div><span className="font-bold text-[#212121] block text-xl">{user._count.followers}</span> followers</div>
          <div><span className="font-bold text-[#212121] block text-xl">{user._count.following}</span> following</div>
        </div>
        <p className="mt-4 text-base text-[#2F3E46] max-w-md">{user.bio || 'No bio yet.'}</p>
        <p className="mt-2 text-xs text-gray-500">{timeSince(user.createdAt)}</p>
      </div>
    </header>
  );
};

const PostGrid = ({ posts }: { posts: Post[] }) => (
  <section>
    {posts.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="group relative aspect-square bg-white rounded-lg shadow overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[#6A1B9A]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Music size={40} className="text-white"/>
            </div>
            <div className="relative z-20 h-full flex flex-col justify-end p-3 text-white">
              <h3 className="font-bold text-sm leading-tight">{post.title}</h3>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-[#2F3E46] text-lg">No posts yet. Start creating!</p>
      </div>
    )}
  </section>
);

const EditProfileForm = ({ user, onProfileUpdate }: { user: UserProfile, onProfileUpdate: () => void }) => {
    const [formData, setFormData] = useState({ bio: user.bio || '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const data = new FormData();
        data.append('bio', formData.bio);
        if (avatarFile) {
            data.append('avatarFile', avatarFile);
        }

        try {
            // Replace with your actual API endpoint
            await axios.put(`${apiUrl}/api/users/profile`, data, { withCredentials: true });
            alert('Profile updated successfully!');
            onProfileUpdate(); // Triggers a re-fetch in the parent component
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-[#212121] mb-6">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Avatar Upload */}
                <div>
                    <label className="block text-sm font-medium text-[#2F3E46] mb-2">Profile Picture</label>
                    <div className="flex items-center space-x-4">
                        <img src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatarUrl || '/default-avatar.png'} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover"/>
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-[#F5F5DC] text-[#2F3E46] py-2 px-4 rounded-md border border-gray-300 hover:bg-[#EAB5C5]">
                            <Camera size={16} className="inline mr-2"/>
                            Change Picture
                        </label>
                        <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} />
                    </div>
                </div>
                {/* Bio Textarea */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-[#2F3E46] mb-1">Bio</label>
                    <textarea id="bio" rows={4} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-[#F5F5DC] border border-gray-300 text-[#212121] rounded-md p-3 focus:ring-[#6A1B9A] focus:border-[#6A1B9A]" placeholder="Tell us about yourself..."></textarea>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#6A1B9A] text-white rounded-lg hover:bg-[#D4AF37] transition-colors font-semibold shadow hover:shadow-lg disabled:bg-gray-400">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </section>
    );
};

// --- Main MyProfile Component ---
const MyProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'edit'>('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Key to force re-fetch
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    // Since we are not using an AuthProvider, we'll fetch the user data directly.
    // This assumes your HOC handles authentication and you have a way to get the current user's session.
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your actual API endpoint to get the current user's profile
        const response = await axios.get(`${apiUrl}/api/users/profile/me`, { withCredentials: true }); 
        setUserData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [key]); // Re-fetch if we manually trigger a refresh via `key`

  // Listen for openEditTab events to switch to edit tab
  useEffect(() => {
    const handler = () => setActiveTab('edit');
    window.addEventListener('openEditTab', handler as EventListener);
    return () => window.removeEventListener('openEditTab', handler as EventListener);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 size={32} className="animate-spin text-[#6A1B9A]" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="text-center">User data not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#212121] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader user={userData} setActiveTab={setActiveTab} />
        
    <div className="mb-8 border-b border-gray-300">
          <nav className="-mb-px flex space-x-8">
      <button data-open-posts onClick={() => setActiveTab('posts')} className={`py-4 px-1 font-medium text-lg border-b-2 ${activeTab === 'posts' ? 'border-[#6A1B9A] text-[#6A1B9A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Grid size={20} className="inline mr-2" /> My Posts
            </button>
      <button data-open-edit onClick={() => setActiveTab('edit')} className={`py-4 px-1 font-medium text-lg border-b-2 ${activeTab === 'edit' ? 'border-[#6A1B9A] text-[#6A1B9A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Edit3 size={20} className="inline mr-2" /> Edit Profile
            </button>
          </nav>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'posts' && <PostGrid posts={userData.posts} />}
            {activeTab === 'edit' && <EditProfileForm user={userData} onProfileUpdate={() => setKey(prev => prev + 1)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyProfile;

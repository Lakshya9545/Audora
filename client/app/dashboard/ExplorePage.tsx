// app/(app)/explore/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import axios from 'axios';
import apiClient from '@/lib/axios';
import { Post } from '@/lib/types';
import { Search, Music, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useAudio } from '@/lib/AudioProvider';
import FollowButton from '@/components/FollowButton';
import { useUser } from '@/lib/UserContext';

// --- UI Component: Grid Loading Skeleton ---
const PostCardSkeleton = () => (
  <div
    role="status"
    aria-label="Loading post"
    className="animate-pulse aspect-[4/5] w-full rounded-2xl border border-white/10 bg-gray-800/40 shadow-lg"
  >
    <div className="flex h-full flex-col justify-end p-4">
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-700/70"></div>
      <div className="h-4 w-1/2 rounded bg-gray-700/50"></div>
    </div>
  </div>
);

// --- UI Component: Compact Post Card for Grid ---
const PostCard = ({ post, currentUserId }: { post: Post, currentUserId: string | null }) => {
  const { playAudio } = useAudio();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0);

  const handlePlay = () => {
    playAudio(post.audioUrl, post.title);
  };

  const handleToggleLike = async () => {
    try {
      const res = await apiClient.post(`/interactions/${post.id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (e) {
      console.error('Failed to like:', e);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/dashboard?post=${post.id}`;
      if (navigator.share) {
        await navigator.share({ title: post.title, text: `${post.title} • ${post.subject}`, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied');
      } else {
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="post-card group relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-2xl border border-black bg-black shadow-xl"
    >
      {/* Author bar */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.author.avatarUrl || '/default-avatar.png'}
            alt={`${post.author.username}'s avatar`}
            className="h-8 w-8 rounded-full border-2 border-white/20 object-cover"
          />
          <span className="text-sm font-semibold text-white">{post.author.username}</span>
        </div>
        {post.author.id !== currentUserId && <FollowButton userId={post.author.id} />}
      </div>

      {/* Content */}
      <div className="relative z-20 mt-auto p-4">
        <h3 className="text-lg font-bold text-white">{post.title}</h3>
        <p className="text-sm text-white/80">{post.subject}</p>
        <div className="mt-3 flex items-center gap-5 text-white/80">
          <button onClick={handleToggleLike} className={`flex items-center text-sm transition-colors ${liked ? 'text-red-500' : 'hover:text-white'}`}>
            <Heart className={`mr-1 h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {likeCount}
          </button>
          <div className="flex items-center text-sm">
            <MessageCircle className="mr-1 h-4 w-4" /> {post._count?.comments ?? 0}
          </div>
          <button onClick={handleShare} className="ml-auto flex items-center text-sm hover:text-white">
            <Share2 className="mr-1 h-4 w-4" /> Share
          </button>
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={handlePlay}
        aria-label={`Play ${post.title}`}
        className="absolute bottom-4 right-4 z-30 flex h-14 w-14 scale-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform duration-200 ease-in-out group-hover:scale-100 hover:bg-purple-500"
      >
        <Music size={28} />
      </button>
    </motion.div>
  );
};

// --- The Main Explore Page Component ---
export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useUser();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Data Fetching Logic for Explore
  useEffect(() => {
    const fetchExplorePosts = async () => {
      setLoading(true);
      setError(null);
      try {
  const response = await axios.get(`${apiUrl}/api/posts/explore`);
        setPosts(response.data.data || []);
      } catch (err) {
        setError('Could not load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, [apiUrl]);

  // GSAP animation for grid items
  useGSAP(
    () => {
      if (!loading && posts.length > 0) {
        gsap.from('.post-card', {
          duration: 0.6,
          opacity: 1,
          y: 50,
          scale: 0.95,
          stagger: 0.05,
          ease: 'power3.out',
        });
      }
    },
    { scope: containerRef, dependencies: [posts, loading] }
  );

  // --- Render Logic ---
  const renderGrid = () => {
    if (loading) {
      return Array.from({ length: 8 }, (_, i) => <PostCardSkeleton key={i} />);
    }

    if (error) {
      return (
        <div className="col-span-full flex flex-col items-center gap-4 rounded-lg bg-red-500/10 p-6 text-center text-red-400">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400"
          >
            Retry
          </button>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="col-span-full py-16 text-center text-white/80">
          <h2 className="mb-2 text-2xl font-bold text-white">Nothing to explore yet</h2>
          <p>Be the first to create a post, or check back later!</p>
        </div>
      );
    }

    return posts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} />);
  };

  return (
    <div ref={containerRef} className="mx-auto max-w-7xl px-4 pb-24 pt-10">
      {/* Header with Search Bar */}
      <header className="mb-8">
        <label htmlFor="explore-search" className="sr-only">
          Search posts
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
          <input
            id="explore-search"
            type="text"
            placeholder="Search for titles, subjects, or creators..."
            className="h-12 w-full rounded-full border border-black bg-white pl-12 pr-4 text-sm text-black placeholder-black outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </header>

      {/* Responsive Grid for Posts */}
      <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {renderGrid()}
      </main>
    </div>
  );
}

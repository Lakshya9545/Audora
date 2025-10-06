// app/(app)/home/page.tsx (or wherever your authenticated home is)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios'; // Import axios for isCancel
import apiClient from '@/lib/axios'; // <-- IMPORT THE CUSTOM AXIOS INSTANCE
import { useAudio } from '@/lib/AudioProvider';
import { Post, Author, Comment as CommentType } from '@/lib/types'; // Adjust path if needed
import FollowButton from '@/components/FollowButton';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';

import { User, Clock, Music4, MessageCircle, Heart, Share2, Send } from 'lucide-react';

// --- UI Component: Loading Skeleton ---
const PostItemSkeleton = () => (
  <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-purple-400/20 mb-6 backdrop-blur-sm animate-pulse">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gray-700/80 rounded-full mr-4"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700/80 rounded w-1/3"></div>
        <div className="h-3 bg-gray-700/80 rounded w-1/4"></div>
      </div>
    </div>
    {/* Aligned content skeleton */}
    <div className="pl-16">
      <div className="h-6 bg-gray-700/80 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-700/80 rounded w-1/2 mb-4"></div>
      {/* Skeleton for the new play button area */}
      <div className="w-full flex items-center my-4">
        <div className="w-12 h-12 bg-gray-700/80 rounded-full"></div>
        <div className="ml-4 h-5 bg-gray-700/80 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);


// --- UI Component: Improved Post Item Card ---
const PostItem = ({ post, currentUserId }: { post: Post, currentUserId: string | null }) => {
  const { playAudio, isPlaying, audioUrl } = useAudio();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handlePlay = () => {
    playAudio(post.audioUrl, post.title);
  };

  const handleToggleLike = async () => {
    try {
      const response = await apiClient.post(`/interactions/${post.id}/like`);
      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleFetchComments = async () => {
    if (!showComments) {
      try {
        const response = await apiClient.get(`/interactions/${post.id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await apiClient.post(`/interactions/${post.id}/comment`, { text: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/dashboard?post=${post.id}`;
      const shareData = {
        title: post.title,
        text: `${post.title} • ${post.subject}`,
        url: shareUrl,
      } as ShareData;
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard');
      } else {
        // Fallback: open in new tab
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const isCurrentlyPlaying = isPlaying && audioUrl === post.audioUrl;

  // Simple date formatter
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="post-item bg-black p-5 sm:p-6 rounded-2xl shadow-2xl shadow-black/20 border border-white/10 mb-8 backdrop-blur-lg">
      {/* Author Info Header */}
      <div className="flex items-center mb-4">
        <img src={post.author.avatarUrl || '/default-avatar.png'} alt={post.author.username} className="w-12 h-12 rounded-full mr-4 border-2 border-purple-400/50" />
        <div className="flex-1">
          <p className="font-bold text-white text-lg">{post.author.username}</p>
          <p className="text-gray-400 text-sm flex items-center">
            <Clock className="w-3 h-3 mr-1.5" />
            {formatDate(post.createdAt)}
          </p>
        </div>
        {post.author.id !== currentUserId && <FollowButton userId={post.author.id} />}
      </div>

      {/* Post Content */}
      <div className="pl-16"> {/* Aligns content with username */}
        <h2 className="text-2xl font-bold text-purple-300 mb-2">{post.title}</h2>
        <p className="text-purple-200/70 text-sm mb-4 font-medium uppercase tracking-wider">{post.subject}</p>
        
        {/* Real Audio Player Trigger */}
        <div className="w-full flex items-center my-4">
            <button 
              onClick={handlePlay} 
              className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-500 transition-colors shadow-lg flex items-center justify-center w-12 h-12"
            >
                <Music4 size={24} />
            </button>
            <div className="ml-4">
              <p className="text-white font-semibold">{isCurrentlyPlaying ? "Now Playing..." : "Play Audio"}</p>
            </div>
        </div>
        
        {post.description && <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{post.description}</p>}

        {/* Action Bar */}
        <div className="flex items-center space-x-6 mt-6 pt-4 border-t border-white/10">
            <button onClick={handleToggleLike} className={`flex items-center transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                <Heart className={`w-5 h-5 mr-2 ${liked ? 'fill-current' : ''}`}/> <span>{likeCount} Like{likeCount !== 1 ? 's' : ''}</span>
            </button>
            <button onClick={handleFetchComments} className="flex items-center text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5 mr-2"/> <span>Comment</span>
            </button>
            <button onClick={handleShare} className="flex items-center text-gray-400 hover:text-white transition-colors ml-auto">
                <Share2 className="w-5 h-5 mr-2"/> <span>Share</span>
            </button>
        </div>
        {showComments && (
          <div className="mt-4 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-3">
                <img src={comment.user.avatarUrl || '/default-avatar.png'} alt={comment.user.username} className="w-8 h-8 rounded-full" />
                <div className="bg-gray-800 p-3 rounded-lg flex-1">
                  <p className="font-semibold text-sm text-white">{comment.user.username}</p>
                  <p className="text-gray-300">{comment.text}</p>
                </div>
              </div>
            ))}
            <form onSubmit={handlePostComment} className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="p-2 bg-purple-600 rounded-full text-white hover:bg-purple-500">
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};


// --- The Main Page Component ---
export default function AuthenticatedHomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useUser();
  
  const container = useRef(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Ensure this is set in your .env file
  // Data Fetching Logic
  useEffect(() => {
    // Tip: Using an AbortController is best practice for cleaning up fetch requests
    // if the component unmounts before the fetch is complete. It prevents potential memory leaks.
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the apiClient instance directly with a relative path
        const response = await apiClient.get(`${apiUrl}/api/posts/home-feed`, { 
           signal 
          }); 
        setPosts(response.data.data);
      } catch (err: any) { // It's good practice to type the error
        if (axios.isCancel(err)) { // Use axios.isCancel
          console.log('Request canceled:', err.message);
        } else {
          console.error("Failed to fetch home feed:", err);
          setError(err.response?.data?.message || "Could not load your feed. Please try again later.");
        }
      } finally {
        // Check if the component is still mounted before setting state
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, []); // Empty dependency array is correct for a "fetch once" behavior.

  // GSAP animation
  // Your implementation here is perfect. No changes needed.
  useGSAP(() => {
    if (!loading && posts.length > 0) {
      gsap.from(".post-item", {
        duration: 0.8,
        opacity: 0,
        y: 80,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.1,
      });
    }
  }, { scope: container, dependencies: [posts, loading] });

  // Render Logic
  // This is very well structured. Clear and easy to read.
  const renderContent = () => {
    if (loading) {
      return [...Array(3)].map((_, i) => <PostItemSkeleton key={i} />);
    }

    if (error) {
      return <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</div>;
    }

    if (posts.length === 0) {
      return (
        <div className="text-center text-gray-400 p-12 bg-black rounded-2xl">
          <h2 className="text-2xl font-bold mb-2 text-white">Your Feed is Quiet</h2>
          <p>Follow some creators or head to the Explore page to discover new audio!</p>

        </div>
      );
    }

    return posts.map((post) => (
      <PostItem key={post.id} post={post} currentUserId={userId} />
    ));
  };

  return (
    <div ref={container} className="max-w-3xl mx-auto">
      {renderContent()}
    </div>
  );
}
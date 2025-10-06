'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';

interface Props {
  userId: string;
  initialIsFollowing?: boolean;
}

export default function FollowButton({ userId, initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState<boolean>(!!initialIsFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialIsFollowing !== undefined) return;
    let mounted = true;
    apiClient.get(`/users/${userId}/is-following`)
      .then((res) => {
        if (!mounted) return;
        const isFollowingResp = res.data.isFollowing;
        if (typeof isFollowingResp === 'boolean') setIsFollowing(isFollowingResp);
      })
      .catch(() => {})
      .finally(() => { mounted = false; });
  }, [userId, initialIsFollowing]);

  const toggleFollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await apiClient.delete(`/users/${userId}/unfollow`);
        setIsFollowing(false);
      } else {
        await apiClient.post(`/users/${userId}/follow`);
        setIsFollowing(true);
      }
    } catch (e) {
      console.error('Follow toggle failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${isFollowing ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

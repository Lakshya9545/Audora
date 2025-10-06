import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/types.ts
export interface Author {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: Author;
}

export interface Post {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  audioUrl: string;
  createdAt: string; // Dates are often strings in JSON
  author: Author;
  isLiked: boolean;
  _count: {
    likes: number;
    comments: number;
  };
}

// This UserProfile type matches the expected API response
export interface UserProfile {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string; // Was joinedDate
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  posts: Post[];
}

export interface NotificationType {
  id: string;
  type: 'new_follower' | 'new_post' | 'like' | 'comment' | 'mention' | 'general';
  message: string;
  link?: string; // Optional link to navigate to (e.g., post, profile)
  isRead: boolean;
  createdAt: string; // ISO date string
  actor?: { // The user who triggered the notification
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

// Mock API response type (adjust as per your actual API)
export interface NotificationsApiResponse {
  success: boolean;
  notifications: NotificationType[];
  message?: string;
}
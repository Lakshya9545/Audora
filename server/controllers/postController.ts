// src/controllers/postController.ts

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prisma'; // Adjust path if necessary
import { NotificationType } from '../generated/prisma'; 
import cloudinary from '../config/cloudinary';
import fs from 'fs/promises';
import type { AuthenticatedRequest } from '../types';

// --- Cloudinary Configuration ---
// IMPORTANT: Configure Cloudinary with your credentials.
// It's best to use environment variables for this.

// --- Zod Schemas for Post Validation ---
const createPostSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255),
  subject: z.string().min(1, { message: "Subject is required" }).max(100),
  description: z.string().max(5000).optional().default(""),
});

const updatePostSchema = z.object({ // Unchanged for this request
  title: z.string().min(1).max(255).optional(),
  subject: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});


// --- Helper for Pagination ---
const getPaginationParams = (query: Request['query']) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};

// --- Controller Functions ---

/**
 * Create a new audio post.
 * Requires authentication.
 */

export const createPostController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const authorId = req.user.id;

  // 1. Check for uploaded file (assuming multer attaches it to req.file)
  if (!req.file) {
    return res.status(400).json({ message: "Audio file is required." });
  }

  // 2. Validate text fields
  const validationResult = createPostSchema.safeParse(req.body);
  if (!validationResult.success) {
    // If validation fails, delete the temporarily uploaded file if it exists on disk
    if (req.file.path) {
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error deleting temp file after validation fail:", e); }
    }
    return res.status(400).json({ message: "Validation failed", errors: validationResult.error.flatten().fieldErrors });
  }

  const { title, subject, description } = validationResult.data;
  const filePath = req.file.path; // Path to the file temporarily stored by multer

  try {
    // 3. Upload audio file to Cloudinary
    // For audio, resource_type 'video' is often used as it supports more audio codecs and transformations.
    // 'auto' might also work, but 'video' is safer for audio.
    // You can specify a folder in Cloudinary like 'audio_posts/${authorId}'
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Use 'video' for audio files to get better codec support and transformation options
      folder: `audio_posts/${authorId}`, // Optional: organize in Cloudinary
      // Eager transformations can be added here if needed (e.g., format conversion)
      // eager: [{ format: 'mp3', audio_codec: 'mp3' }],
      // quality: 'auto:good',
      // bit_rate: '128k' // Example: set bit rate
    });

    // 4. Create post in database with Cloudinary URL and public_id
    const newPost = await prisma.post.create({
      data: {
        title,
        subject,
        description,
        audioUrl: uploadResult.secure_url,
        audioPublicId: uploadResult.public_id, // Store this!
        authorId,
      },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });

    // 5. Clean up temporary file if multer saved it to disk
    if (filePath) {
        try { await fs.unlink(filePath); } catch (e) { console.error("Error deleting temp file after successful upload:", e); }
    }

    // 6. MVP Bonus: Create notifications for followers (same as before)
    const followers = await prisma.follow.findMany({
      where: { followingId: authorId },
      select: { followerId: true },
    });

    if (followers.length > 0) {
      const notificationsData = followers.map(follow => ({
        recipientId: follow.followerId,
        type: NotificationType.NEW_POST,
        triggerUserId: authorId,
        postId: newPost.id,
      }));
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }

    res.status(201).json({ success: true, message: "Post created successfully", post: newPost });

  } catch (error) {
    console.error("Error creating post or uploading to Cloudinary:", error);
    // If file was uploaded and DB save failed, ideally delete from Cloudinary too (more complex rollback)
    // For now, clean up temp file if it exists from multer
    if (filePath) {
        try { await fs.unlink(filePath); } catch (e) { console.error("Error deleting temp file after error:", e); }
    }
    res.status(500).json({ message: "Failed to create post. Please try again." });
  }
};

/**
 * Get a single post by its ID.
 * Publicly accessible.
 */
export const getPostByIdController = async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

/**
 * Get the Explore feed (all public posts, newest first).
 * Publicly accessible with pagination.
 */
export const getExploreFeedController = async (req: AuthenticatedRequest, res: Response) => {
  const { skip, take, page, limit } = getPaginationParams(req.query);
  const userId = req.user?.id ?? null;

  try {
    const postsData = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Determine which of these posts are liked by the current user (if any)
    let likedSet = new Set<string>();
    if (userId && postsData.length) {
      const liked = await prisma.like.findMany({
        where: { userId, postId: { in: postsData.map((p) => p.id) } },
        select: { postId: true },
      });
      likedSet = new Set(liked.map((l) => l.postId));
    }

    const posts = postsData.map((p) => ({
      ...p,
      isLiked: likedSet.has(p.id),
    }));

    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching explore feed:", error);
    res.status(500).json({ message: "Failed to fetch explore feed" });
  }
};

/**
 * Get the Home feed (posts from followed users and self, newest first).
 * Requires authentication.
 * Publicly accessible with pagination.
 */
export const getHomeFeedController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const userId = req.user.id;
  const { skip, take, page, limit } = getPaginationParams(req.query);

  try {
    const followedUsers = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followedUserIds = followedUsers.map((follow) => follow.followingId);

    // Add the current user's ID to the list to include their own posts
    const authorIds = [...new Set([userId, ...followedUserIds])];

    const postsData = await prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Which of these posts are liked by the current user?
    let likedSet = new Set<string>();
    if (postsData.length) {
      const liked = await prisma.like.findMany({
        where: { userId, postId: { in: postsData.map((p) => p.id) } },
        select: { postId: true },
      });
      likedSet = new Set(liked.map((l) => l.postId));
    }

    const posts = postsData.map((p) => ({
      ...p,
      isLiked: likedSet.has(p.id),
    }));

    const totalPosts = await prisma.post.count({ where: { authorId: { in: authorIds } } });
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching home feed:", error);
    res.status(500).json({ message: "Failed to fetch home feed" });
  }
};

/**
 * Update a post's metadata (title, subject, description).
 * Requires authentication and ownership.
 */
export const updatePostController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const userId = req.user.id;
  const { postId } = req.params as { postId: string };

  // Validate payload; ensure at least one field is present
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }

  try {
    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (existing.authorId !== userId) {
      return res.status(403).json({ message: "You are not allowed to update this post" });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: parsed.data,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    res.status(200).json({ success: true, message: "Post updated", post: updated });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
};

/**
 * Delete a post (and attempt to remove its audio from Cloudinary).
 * Requires authentication and ownership.
 */
export const deletePostController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const userId = req.user.id;
  const { postId } = req.params as { postId: string };

  try {
    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (existing.authorId !== userId) {
      return res.status(403).json({ message: "You are not allowed to delete this post" });
    }

    // Try to remove asset from Cloudinary (do not fail hard if this errors)
    if (existing.audioPublicId) {
      try {
        await cloudinary.uploader.destroy(existing.audioPublicId, { resource_type: 'video' });
      } catch (e) {
        console.warn("Cloudinary deletion failed for", existing.audioPublicId, e);
      }
    }

    await prisma.post.delete({ where: { id: postId } });
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

// src/controllers/userController.ts

import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prisma'; // Adjust path if necessary
import cloudinary from '../config/cloudinary'; // Import configured Cloudinary instance
import { NotificationType,Prisma } from '../generated/prisma'; // Import enum
import fs from 'fs/promises'; // For deleting temp files if multer saves to disk
import type { AuthenticatedRequest } from '../types';

// --- Zod Schemas for Validation ---
const updateUserProfileSchema = z.object({
  bio: z.string().max(250, "Bio cannot exceed 250 characters").optional(),
  // Avatar is handled via req.file, not in Zod schema for req.body here
});

// --- Helper for Pagination (if not already globally available) ---
const getPaginationParams = (query: Request['query']) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10; // Default to 10 items per page
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};


// --- Controller Functions ---

/**
 * Get a user's profile by their username.
 * Includes their posts, follower count, and following count.
 * Also indicates if the currently authenticated user (if any) is following this profile.
 */
export const getUserProfileByUsernameController = async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.params;
  const currentUserId = req.user?.id; // ID of the user making the request (if authenticated)

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const profileUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }, // Store and query usernames in lowercase for consistency
      select: {
        id: true,
        username: true,
        email: false, // Typically don't expose email publicly unless intended
        avatarUrl: true,
        bio: true,
        createdAt: true,
        posts: { // Paginate posts on profile later if needed, for now, take recent few
          orderBy: { createdAt: 'desc' },
          take: 10, // Example: show latest 10 posts
          select: {
            id: true,
            title: true,
            audioUrl: true,
            createdAt: true,
            subject: true,
            // Add other fields like _count for likes/comments when implemented
          }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true, // Total post count for this user
          },
        },
        // Conditionally include 'followedByCurrentUser' if a user is logged in
        ...(currentUserId ? {
          followers: { // Check if the current user is in the list of followers
            where: { followerId: currentUserId },
            select: { id: true } // We only need to know if the record exists
          }
        } : {})
      },
    });

    if (!profileUser) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Process the followers check to a boolean
    let isFollowing = false;
    if (currentUserId && (profileUser as any).followers?.length > 0) {
        isFollowing = true;
    }
    // Remove the verbose followers check structure from the response
    const { followers, ...userProfileData } = profileUser as any;


    res.status(200).json({ ...userProfileData, isFollowing });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};


/**
 * Update the currently authenticated user's profile (bio, avatar).
 * Avatar upload handled by Cloudinary.
 * Requires authentication.
 */
export const updateUserProfileController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const userId = req.user.id;

  const validationResult = updateUserProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    // If validation fails and a file was uploaded, delete the temp file
    if (req.file?.path) {
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error deleting temp file after validation fail:", e); }
    }
    return res.status(400).json({ message: "Validation failed", errors: validationResult.error.flatten().fieldErrors });
  }

  const { bio } = validationResult.data;
  const newAvatarFile = req.file;
  let dataToUpdate: Prisma.UserUpdateInput = {};

  try {
    if (newAvatarFile) {
      // Fetch current user to get old avatarPublicId for deletion
      const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { avatarPublicId: true } });

      // Upload new avatar to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(newAvatarFile.path, {
        folder: `avatars/${userId}`,
        resource_type: 'image', // Explicitly image
        transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }] // Example transformation
      });

      dataToUpdate.avatarUrl = uploadResult.secure_url;
      dataToUpdate.avatarPublicId = uploadResult.public_id;

      // Delete old avatar from Cloudinary if it exists
      if (currentUser?.avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(currentUser.avatarPublicId, { resource_type: 'image' });
        } catch (cloudinaryDeleteError) {
          console.error("Failed to delete old avatar from Cloudinary:", cloudinaryDeleteError);
          // Log error but continue, as new avatar is already uploaded.
        }
      }
      // Clean up temporary file from multer
      try { await fs.unlink(newAvatarFile.path); } catch (e) { console.error("Error deleting temp avatar file:", e); }
    }

    if (bio !== undefined) { // Only update bio if it's provided
      dataToUpdate.bio = bio;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(200).json({ message: "No changes provided to update." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { // Return only necessary fields
        id: true,
        username: true,
        email: true, // Or false if you don't want to return it
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });

  } catch (error) {
    console.error("Error updating profile:", error);
    // Clean up temp file if an error occurred mid-process and file exists
    if (newAvatarFile?.path) {
        try { await fs.unlink(newAvatarFile.path); } catch (e) { console.error("Error deleting temp avatar file on error:", e); }
    }
    res.status(500).json({ message: "Failed to update profile" });
  }
};


/**
 * Follow another user.
 * Requires authentication.
 */
export const followUserController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const followerId = req.user.id; // Current authenticated user
  const { userIdToFollow } = req.params;

  if (followerId === userIdToFollow) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    // Check if user to follow exists
    const userToFollowExists = await prisma.user.findUnique({ where: { id: userIdToFollow } });
    if (!userToFollowExists) {
      return res.status(404).json({ message: "User to follow not found." });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId: userIdToFollow },
      },
    });

    if (existingFollow) {
      return res.status(409).json({ message: "You are already following this user." });
    }

    // Create the follow relationship and the notification in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.follow.create({
        data: {
          followerId,
          followingId: userIdToFollow,
        },
      });

      // Create a notification for the user being followed
      await tx.notification.create({
        data: {
          recipientId: userIdToFollow,
          triggerUserId: followerId,
          type: NotificationType.NEW_FOLLOWER,
          // postId is not relevant for NEW_FOLLOWER
        },
      });
    });

    res.status(201).json({ message: `Successfully followed user ${userToFollowExists.username}.` });

  } catch (error) {
    console.error("Error following user:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // This should ideally be caught by the findUnique check above, but as a fallback
        return res.status(409).json({ message: "Already following this user (concurrent request) or unique constraint failed." });
    }
    res.status(500).json({ message: "Failed to follow user." });
  }
};


/**
 * Unfollow another user.
 * Requires authentication.
 */
export const unfollowUserController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const followerId = req.user.id; // Current authenticated user
  const { userIdToUnfollow } = req.params;

  if (followerId === userIdToUnfollow) {
    return res.status(400).json({ message: "Invalid operation." });
  }

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId: userIdToUnfollow },
      },
    });
    // Optionally: Delete the 'NEW_FOLLOWER' notification if desired, though typically they remain
    res.status(200).json({ message: "Successfully unfollowed user." });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record to delete not found (means they weren't following or already unfollowed)
      return res.status(404).json({ message: "You are not following this user or user not found." });
    }
    res.status(500).json({ message: "Failed to unfollow user." });
  }
};


/**
 * Get a list of users who are following a specific user.
 * Publicly accessible, paginated.
 */
export const getFollowersController = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { skip, take, page, limit } = getPaginationParams(req.query);

  try {
    const targetUserExists = await prisma.user.findUnique({ where: { id: userId }});
    if (!targetUserExists) {
        return res.status(404).json({ message: "User not found." });
    }

    const followersData = await prisma.follow.findMany({
      where: { followingId: userId }, // Users whose 'followingId' matches the target user
      select: {
        follower: { // Select details of the user who is doing the following
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const totalFollowers = await prisma.follow.count({ where: { followingId: userId } });
    const totalPages = Math.ceil(totalFollowers / limit);

    res.status(200).json({
      data: followersData.map(f => f.follower), // Extract just the user objects
      pagination: { currentPage: page, totalPages, totalItems: totalFollowers, itemsPerPage: limit }
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Failed to fetch followers." });
  }
};


/**
 * Get a list of users whom a specific user is following.
 * Publicly accessible, paginated.
 */
export const getFollowingController = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { skip, take, page, limit } = getPaginationParams(req.query);

  try {
    const targetUserExists = await prisma.user.findUnique({ where: { id: userId }});
    if (!targetUserExists) {
        return res.status(404).json({ message: "User not found." });
    }

    const followingData = await prisma.follow.findMany({
      where: { followerId: userId }, // Users whose 'followerId' matches the target user
      select: {
        following: { // Select details of the user who is being followed
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const totalFollowing = await prisma.follow.count({ where: { followerId: userId } });
    const totalPages = Math.ceil(totalFollowing / limit);

    res.status(200).json({
      data: followingData.map(f => f.following), // Extract just the user objects
      pagination: { currentPage: page, totalPages, totalItems: totalFollowing, itemsPerPage: limit }
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ message: "Failed to fetch following list." });
  }
};

/**
 * Get the profile of the currently authenticated user.
 * Optimized to select specific fields and limit the number of posts returned.
 * Requires authentication.
 */
export const getCurrentUserProfileController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Authentication required." });
  }
  const userId = req.user.id;

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Use `select` for performance and to avoid exposing sensitive data
        id: true,
        username: true,
        email: true, // It's the user's own profile, so returning email is acceptable
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: { // Efficiently get counts of related models
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
        posts: { // Paginate/limit posts to avoid over-fetching
          orderBy: { createdAt: 'desc' },
          take: 20, // Return only the 20 most recent posts
          select: {
            id: true,
            title: true,
            audioUrl: true,
            createdAt: true,
            subject: true,
          },
        },
      },
    });

    if (!userProfile) {
      // This case can happen if the user is deleted but the token is still valid
      return res.status(404).json({ message: "User profile not found." });
    }

    res.status(200).json(userProfile);

  } catch (error) {
    console.error("Error fetching current user profile:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};

/**
 * Check whether the current authenticated user is following another user (by id).
 * Returns { isFollowing: boolean }.
 */
export const checkIsFollowingController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    // If user is not authenticated, return false.
    return res.status(200).json({ isFollowing: false });
  }

  const currentUserId = req.user.id;
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ message: 'userId required' });
  if (currentUserId === userId) return res.status(200).json({ isFollowing: false });

  try {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
    });
    return res.status(200).json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return res.status(500).json({ message: 'Failed to check follow status' });
  }
};
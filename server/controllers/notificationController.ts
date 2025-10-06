// src/controllers/notificationController.ts

import type { Request, Response } from 'express';
import prisma from '../prisma/prisma'; // Adjust path if necessary
import { Prisma } from '@prisma/client'; // Import types if needed
import type { AuthenticatedRequest } from '../types';

// --- Helper for Pagination (reuse if defined globally) ---
const getPaginationParams = (query: Request['query']) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 15; // Default to 15 notifications per page
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};


// --- Controller Functions ---

/**
 * Get the authenticated user's notifications.
 * Paginated, ordered by newest first. Includes related data.
 * Requires authentication.
 */
export const getNotificationsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const userId = req.user.id;
  const { skip, take, page, limit } = getPaginationParams(req.query);

  try {
    // Fetch the paginated list of notifications
    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        // Include the user who triggered the notification (e.g., new follower, post author)
        triggerUser: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        // Include details of the post if the notification relates to one
        post: {
          select: {
            id: true,
            title: true, // Show post title for context
            subject: true,
          },
        },
      },
    });

    // Get total count of notifications for pagination
    const totalNotifications = await prisma.notification.count({
      where: { recipientId: userId },
    });

    // Get count of unread notifications (useful for badges)
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    });

    const totalPages = Math.ceil(totalNotifications / limit);

    res.status(200).json({
      success: true,
      notifications: notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalNotifications,
        itemsPerPage: limit,
      },
      unreadCount: unreadCount,
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * Mark a specific notification as read.
 * Requires authentication. User must be the recipient.
 */
export const markNotificationAsReadController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const userId = req.user.id;
  const { notificationId } = req.params;

  if (!notificationId) {
    return res.status(400).json({ message: "Notification ID is required" });
  }

  try {
    // Use updateMany to ensure user ownership and handle non-existent IDs gracefully
    const updateResult = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId, // IMPORTANT: Ensure the user owns this notification
        read: false,         // Optional: Only update if it's currently unread
      },
      data: {
        read: true,
        updatedAt: new Date(), // Explicitly set updatedAt if needed by client logic
      },
    });

    if (updateResult.count === 0) {
      // This could mean the notification doesn't exist, doesn't belong to the user,
      // or was already marked as read.
      // Check if the notification exists at all for a more specific error
       const notificationExists = await prisma.notification.findFirst({
           where: { id: notificationId, recipientId: userId }
       });
       if (!notificationExists) {
            return res.status(404).json({ message: "Notification not found or you do not have permission to modify it." });
       }
       // If it exists but count is 0, it was likely already read
       return res.status(200).json({ message: "Notification was already marked as read." });
    }

    res.status(200).json({ message: "Notification marked as read successfully." });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

/**
 * Mark all unread notifications for the authenticated user as read.
 * Requires authentication.
 */
export const markAllNotificationsAsReadController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(403).json({ message: "User authentication required." });
  }
  const userId = req.user.id;

  try {
    const updateResult = await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false, // Only target unread notifications
      },
      data: {
        read: true,
        updatedAt: new Date(), // Explicitly set updatedAt
      },
    });

    res.status(200).json({ message: `Successfully marked ${updateResult.count} notifications as read.` });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};
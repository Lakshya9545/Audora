import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types'; // Import AuthenticatedRequest
import prisma from '../prisma/prisma';
import { z } from 'zod';

const commentSchema = z.object({
    text: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
});

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const validationResult = commentSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
    }

    const { text } = validationResult.data;

    try {
        const newComment = await prisma.$transaction(async (tx) => {
            const created = await tx.comment.create({
                data: { text, userId, postId },
                include: { user: { select: { id: true, username: true, avatarUrl: true } } },
            });
            // Create notification for the post author (if not the commenter)
            const post = await tx.post.findUnique({ where: { id: postId }, select: { authorId: true } });
                if (post && post.authorId !== userId) {
                    await tx.notification.create({
                        data: { recipientId: post.authorId, triggerUserId: userId, type: ('COMMENT' as any), postId },
                    });
                }
            return created;
        });
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Create Comment Error:', error);
        res.status(500).json({ message: 'Failed to create comment.' });
    }
};

export const getCommentsForPost = async (req: AuthenticatedRequest, res: Response) => {
    const { postId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        res.status(200).json(comments);
    } catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ message: 'Failed to fetch comments.' });
    }
};

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.id; // From verifyToken middleware

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        // Check if the like already exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existingLike) {
            // If it exists, unlike the post
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            const likeCount = await prisma.like.count({ where: { postId } });
            res.status(200).json({ message: 'Post unliked successfully.', liked: false, likeCount });
        } else {
            // If it doesn't exist, like the post
            // Use transaction to create like and notification together
            await prisma.$transaction(async (tx) => {
                await tx.like.create({ data: { userId, postId } });
                const post = await tx.post.findUnique({ where: { id: postId }, select: { authorId: true } });
                if (post && post.authorId !== userId) {
                    await tx.notification.create({
                        data: { recipientId: post.authorId, triggerUserId: userId, type: ('LIKE' as any), postId },
                    });
                }
            });
            const likeCount = await prisma.like.count({ where: { postId } });
            res.status(201).json({ message: 'Post liked successfully.', liked: true, likeCount });
        }
    } catch (error) {
        console.error('Toggle Like Error:', error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
};

import { Router } from 'express';
import verifyToken from '../middleware/verifyToken';
import {
    createComment,
    getCommentsForPost,
    toggleLike,
} from '../controllers/postInteractionController';

const router = Router();

// Like a post
router.post('/:postId/like', verifyToken, toggleLike);

// Comment on a post
router.post('/:postId/comment', verifyToken, createComment);

// Get all comments for a post
router.get('/:postId/comments', getCommentsForPost);

export default router;

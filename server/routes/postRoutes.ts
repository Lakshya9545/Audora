// src/routes/postRoutes.ts
import { Router } from 'express';
import {
  createPostController,
  getPostByIdController,
  getExploreFeedController,
  getHomeFeedController,
  updatePostController,
  deletePostController
} from '../controllers/postController'; // Adjust path
import verifyToken  from '../middleware/verifyToken';
import upload from '../middleware/multerUpload';  // Your actual auth middleware

const router = Router();

// Create a new post (requires authentication)
router.post('/', verifyToken, upload.single('audioFile'), createPostController);

// Get Explore feed (public)
router.get('/explore', getExploreFeedController);

// Get Home feed (requires authentication)
router.get('/home-feed', verifyToken, getHomeFeedController);

// Get a single post by ID (public)
router.get('/:postId', getPostByIdController);

// Update a post (requires authentication, author only)
router.put('/:postId', verifyToken, updatePostController);

// Delete a post (requires authentication, author only)
router.delete('/:postId', verifyToken, deletePostController);

export default router;
// src/routes/userRoutes.ts
import { Router } from 'express';
import {
  getUserProfileByUsernameController,
  updateUserProfileController,
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
  checkIsFollowingController,
  getCurrentUserProfileController
} from '../controllers/userController'; // Adjust path
import  verifyToken  from '../middleware/verifyToken'; // Your actual auth middleware
import uploadImage from '../middleware/multerImageUpload'; // Multer for image uploads

const router = Router();

// Get user profile by username (public)
router.get('/:username', verifyToken, getUserProfileByUsernameController); // Pass authenticateToken to know if current user is following

// Update current authenticated user's profile (protected, handles avatar upload)
// 'avatarFile' should match the name attribute in your form's file input for avatar
router.put('/profile', verifyToken, uploadImage.single('avatarFile'), updateUserProfileController);

// Follow a user (protected)
router.post('/:userIdToFollow/follow', verifyToken, followUserController);

// Unfollow a user (protected)
router.delete('/:userIdToUnfollow/unfollow', verifyToken, unfollowUserController);

// Get a user's followers list (public)
router.get('/:userId/followers', getFollowersController);

// Check whether current authenticated user is following a user (by id)
router.get('/:userId/is-following', verifyToken, checkIsFollowingController);

// Get a list of users a user is following (public)
router.get('/:userId/following', getFollowingController);

// Get current authenticated user's profile (protected)
router.get('/profile/me', verifyToken, getCurrentUserProfileController);


export default router;
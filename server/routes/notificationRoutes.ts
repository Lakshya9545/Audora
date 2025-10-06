// src/routes/notificationRoutes.ts
import { Router } from 'express';
import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from '../controllers/notificationController'; // Adjust path
import  verifyToken  from '../middleware/verifyToken'; // Your actual auth middleware

const router = Router();

// All notification routes require authentication
router.use(verifyToken);

// Get current user's notifications (paginated)
router.get('/', getNotificationsController);

// Mark a specific notification as read
router.patch('/:notificationId/read', markNotificationAsReadController); // Using PATCH for single item state change

// Mark all user's notifications as read
router.post('/read-all', markAllNotificationsAsReadController); // Using POST for a bulk action

export default router;
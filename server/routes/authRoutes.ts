// Example: src/routes/authRoutes.ts
import express from 'express';
import { signupController, loginController,checkAuth,logoutController } from '../controllers/auth'; // Adjust path

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/check', checkAuth);
router.post('/logout', logoutController);


export default router;
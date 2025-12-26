import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { loginUser, registerTenant, logoutUser, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register-tenant', registerTenant);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logoutUser);


export default router;

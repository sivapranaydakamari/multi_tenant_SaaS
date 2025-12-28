import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { updateUser, deleteUser } from '../controllers/userController.js';
import { authorizeUserUpdate, authorizeUserDelete } from '../middleware/authorizeUser.js';

const router = express.Router();

router.put('/:userId', authenticate, authorizeUserUpdate, updateUser);

router.delete('/:userId', authenticate, authorizeUserDelete, deleteUser);

export default router;

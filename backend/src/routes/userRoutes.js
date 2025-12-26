import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { updateUser } from '../controllers/userController.js';
import { authorizeUserUpdate } from '../middleware/authorizeUser.js';
import { deleteUser } from '../controllers/userController.js';
import { authorizeUserDelete } from '../middleware/authorizeUser.js';

const router = express.Router();

router.put('/:userId',
  authenticate,
  authorizeUserUpdate,
  updateUser
);

router.delete('/:userId',
  authenticate,
  authorizeUserDelete,
  deleteUser
);


export default router;

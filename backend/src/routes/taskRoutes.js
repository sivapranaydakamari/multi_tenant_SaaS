import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createTask } from '../controllers/taskController.js';
import { listTasks } from '../controllers/taskController.js';
import { updateTaskStatus } from '../controllers/taskController.js';
import { updateTask } from '../controllers/taskController.js';

const router = express.Router();

router.post('/:projectId/tasks', authenticate, createTask);
router.get('/:projectId/tasks', authenticate, listTasks);
router.patch('/tasks/:taskId/status', authenticate, updateTaskStatus);
router.put('/tasks/:taskId', authenticate, updateTask);

export default router;

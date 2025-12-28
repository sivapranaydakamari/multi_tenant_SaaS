import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTask,
  listTasks,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });
router.post('/:projectId/tasks', authenticate, createTask);
router.get('/:projectId/tasks', authenticate, listTasks);
router.put('/:projectId/tasks/:taskId', authenticate, updateTask);
router.patch('/:projectId/tasks/:taskId/status', authenticate, updateTaskStatus);
router.delete('/:projectId/tasks/:taskId', authenticate, deleteTask);

export default router;

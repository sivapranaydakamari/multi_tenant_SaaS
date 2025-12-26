import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createTask } from '../controllers/taskController.js';
import { listTasks } from '../controllers/taskController.js';
import { updateTaskStatus } from '../controllers/taskController.js';
import { updateTask } from '../controllers/taskController.js';
import { deleteTask } from '../controllers/taskController.js';

const router = express.Router();


router.post("/:projectId/tasks", authenticate, createTask);
router.get("/:projectId/tasks", authenticate, listTasks);

router.put("/tasks/:taskId", authenticate, updateTask);
router.patch("/tasks/:taskId/status", authenticate, updateTaskStatus);
router.delete("/tasks/:taskId", authenticate, deleteTask);


export default router;

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createProject, listProjects, updateProject, deleteProject, getProjectById } from '../controllers/projectController.js';
import { authorizeProjectUpdate } from '../middleware/authorizeProject.js';
import { authorizeProjectDelete } from '../middleware/authorizeProject.js';

const router = express.Router();

router.post('/', authenticate, createProject);
router.get('/', authenticate, listProjects);
router.get('/:projectId', authenticate, getProjectById);

router.put('/:projectId',
  authenticate,
  authorizeProjectUpdate,
  updateProject
);

router.delete('/:projectId',
  authenticate,
  authorizeProjectDelete,
  deleteProject
);

export default router;

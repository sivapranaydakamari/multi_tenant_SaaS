import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
// tenant route
app.use('/api/tenants', tenantRoutes);
// user route
app.use('/api/users', userRoutes);
// project route
app.use('/api/projects', projectRoutes);
// task route
app.use('/api/projects', taskRoutes);
app.use('/api/', taskRoutes);

app.use('/api', healthRoutes);


// error handler
app.use(errorHandler);


export default app;

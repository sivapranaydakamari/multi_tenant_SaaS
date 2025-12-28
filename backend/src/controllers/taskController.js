import {
  createTaskService,
  listTasksService,
  updateTaskService,
  updateTaskStatusService,
  deleteTaskService
} from '../services/taskService.js';


export const createTask = async (req, res, next) => {
  try {
    const data = await createTaskService(
      req.user,
      req.params.projectId,
      req.body,
      req.ip
    );

    return res.status(201).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    const data = await listTasksService(
      req.user,
      req.params.projectId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const data = await updateTaskStatusService(
      req.user,
      req.params.taskId,
      req.body.status,
      req.ip
    );

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const data = await updateTaskService(
      req.user,
      req.params.taskId,
      req.body,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data
    });

  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;

    const data = await deleteTaskService(
      req.user,
      projectId,
      taskId,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data
    });
  } catch (err) {
    next(err);
  }
};

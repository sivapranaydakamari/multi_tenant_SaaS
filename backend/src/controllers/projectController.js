import { createProjectService, listProjectsService, updateProjectService, deleteProjectService, getProjectByIdService } from '../services/projectService.js';

export const createProject = async (req, res, next) => {
  try {
    const data = await createProjectService(req.user, req.body, req.ip);

    return res.status(201).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const data = await listProjectsService(req.user, req.query);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};


export const updateProject = async (req, res, next) => {
  try {
    const data = await updateProjectService(
      req.user,
      req.params.projectId,
      req.body,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data
    });

  } catch (err) {
    next(err);
  }
};


export const deleteProject = async (req, res, next) => {
  try {
    await deleteProjectService(
      req.user,
      req.params.projectId,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const data = await getProjectByIdService(
      req.user,
      req.params.projectId
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

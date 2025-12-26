export const authorizeProjectUpdate = async (req, res, next) => {
  const { role, userId, tenantId } = req.user;
  const { projectId } = req.params;

  // fetch project details
  const { rows } = await req.db.query(
    `SELECT tenant_id, created_by FROM projects WHERE id = $1`,
    [projectId]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found"
    });
  }

  const project = rows[0];

  // tenant must match
  if (project.tenant_id !== tenantId) {
    return res.status(403).json({
      success: false,
      message: "Cannot modify project from another tenant"
    });
  }

  // tenant admin OR creator allowed
  if (role === 'tenant_admin' || project.created_by === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Not authorized to update this project"
  });
};

export const authorizeProjectDelete = async (req, res, next) => {
  const { role, userId, tenantId } = req.user;
  const { projectId } = req.params;

  const result = await req.db.query(
    `SELECT tenant_id, created_by FROM projects WHERE id = $1`,
    [projectId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found"
    });
  }

  const project = result.rows[0];

  if (project.tenant_id !== tenantId) {
    return res.status(403).json({
      success: false,
      message: "Cannot delete project from another tenant"
    });
  }

  if (role === 'tenant_admin' || project.created_by === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Not authorized to delete this project"
  });
};


import { pool } from '../config/db.js';
import { logAudit } from '../utils/auditLogger.js';

export const createProjectService = async (authUser, body, ip) => {
  const { tenantId, userId } = authUser;
  const { name, description, status = 'active' } = body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // get max limits
    const tenantRes = await client.query(
      `SELECT max_projects FROM tenants WHERE id = $1`,
      [tenantId]
    );

    const maxProjects = tenantRes.rows[0].max_projects;

    // count existing
    const countRes = await client.query(
      `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
      [tenantId]
    );

    if (parseInt(countRes.rows[0].count) >= maxProjects) {
      const err = new Error("Project limit reached");
      err.statusCode = 403;
      throw err;
    }

    const result = await client.query(
      `
      INSERT INTO projects
      (tenant_id, name, description, status, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tenant_id, name, description, status, created_by, created_at
      `,
      [tenantId, name, description, status, userId]
    );

    const project = result.rows[0];

    // audit
    await logAudit(
      tenantId,
      userId,
      "CREATE_PROJECT",
      "project",
      project.id,
      ip
    );

    await client.query('COMMIT');

    return project;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const listProjectsService = async (authUser, query) => {
  const { tenantId } = authUser;

  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const status = query.status;
  const search = query.search;

  let filter = [`p.tenant_id = $1`];
  let values = [tenantId];
  let idx = 2;

  if (status) {
    filter.push(`status = $${idx}`);
    values.push(status);
    idx++;
  }

  if (search) {
    filter.push(`LOWER(name) LIKE $${idx}`);
    values.push(`%${search.toLowerCase()}%`);
    idx++;
  }

  const where = `WHERE ${filter.join(' AND ')}`;

  // main query
  const projectRes = await pool.query(
    `
    SELECT p.id, p.name, p.description, p.status, p.created_at,
           u.id AS creator_id, u.full_name AS creator_name
    FROM projects p
    JOIN users u ON p.created_by = u.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
    `,
    values
  );

  // count for pagination
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM projects p ${where}`,
    values
  );


  const total = parseInt(countRes.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  // add task stats
  const projects = [];

  for (const p of projectRes.rows) {
    const tasks = await pool.query(
      `SELECT COUNT(*) FROM tasks WHERE project_id = $1`,
      [p.id]
    );
    const completed = await pool.query(
      `SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND status = 'completed'`,
      [p.id]
    );

    projects.push({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdBy: {
        id: p.creator_id,
        fullName: p.creator_name
      },
      taskCount: parseInt(tasks.rows[0].count),
      completedTaskCount: parseInt(completed.rows[0].count),
      createdAt: p.created_at
    });
  }

  return {
    projects,
    total,
    pagination: {
      currentPage: page,
      totalPages,
      limit
    }
  };
};

export const updateProjectService = async (authUser, projectId, body, ip) => {
  const client = await pool.connect();

  try {
    const { tenantId, userId, role } = authUser;
    const { name, description, status } = body;

    // check project exists and belongs to tenant
    const projectRes = await client.query(
      `SELECT tenant_id, created_by FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectRes.rowCount === 0) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    const project = projectRes.rows[0];

    if (project.tenant_id !== tenantId) {
      const err = new Error("Project does not belong to this tenant");
      err.statusCode = 403;
      throw err;
    }

    // only tenant_admin OR creator
    if (role !== 'tenant_admin' && project.created_by !== userId) {
      const err = new Error("Not authorized to update this project");
      err.statusCode = 403;
      throw err;
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      const err = new Error("No valid fields to update");
      err.statusCode = 400;
      throw err;
    }

    values.push(projectId);

    await client.query('BEGIN');

    const result = await client.query(
      `
      UPDATE projects
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, name, description, status, updated_at
      `,
      values
    );

    // audit
    await logAudit(
      tenantId,
      userId,
      "UPDATE_PROJECT",
      "project",
      projectId,
      ip
    );

    await client.query('COMMIT');

    return result.rows[0];

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteProjectService = async (authUser, projectId, ip) => {
  const client = await pool.connect();

  try {
    const { tenantId, userId } = authUser;

    const projectRes = await client.query(
      `SELECT tenant_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectRes.rowCount === 0) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    const project = projectRes.rows[0];

    if (project.tenant_id !== tenantId) {
      const err = new Error("Cannot delete project from another tenant");
      err.statusCode = 403;
      throw err;
    }

    await client.query('BEGIN');

    await client.query(
      `DELETE FROM tasks WHERE project_id = $1`,
      [projectId]
    );

    await client.query(
      `DELETE FROM projects WHERE id = $1`,
      [projectId]
    );

    await logAudit(
      tenantId,
      userId,
      "DELETE_PROJECT",
      "project",
      projectId,
      ip
    );

    await client.query('COMMIT');

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getProjectByIdService = async (authUser, projectId) => {
  const { tenantId } = authUser;

  const result = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.status,
      p.created_at
    FROM projects p
    WHERE p.id = $1 AND p.tenant_id = $2
    `,
    [projectId, tenantId]
  );

  if (result.rowCount === 0) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

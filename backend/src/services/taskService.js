import { pool } from '../config/db.js';
import { logAudit } from '../utils/auditLogger.js';

export const createTaskService = async (authUser, projectId, body, ip) => {
  const { title, description, priority = 'medium', assignedTo, dueDate } = body;

  const client = await pool.connect();

  try {
    // Check project exists & belongs to tenant
    const projectRes = await client.query(
      `SELECT tenant_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectRes.rowCount === 0) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    const tenantId = projectRes.rows[0].tenant_id;

    if (tenantId !== authUser.tenantId) {
      const err = new Error("Project does not belong to your tenant");
      err.statusCode = 403;
      throw err;
    }

    // Validate assigned user
    if (assignedTo) {
      const userRes = await client.query(
        `SELECT tenant_id FROM users WHERE id = $1`,
        [assignedTo]
      );

      if (userRes.rowCount === 0) {
        const err = new Error("Assigned user not found");
        err.statusCode = 400;
        throw err;
      }

      if (userRes.rows[0].tenant_id !== tenantId) {
        const err = new Error("Assigned user not in this tenant");
        err.statusCode = 400;
        throw err;
      }
    }

    await client.query('BEGIN');

    const result = await client.query(
      `
      INSERT INTO tasks
      (project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
      RETURNING id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at
      `,
      [projectId, tenantId, title, description, priority, assignedTo || null, dueDate || null]
    );

    const task = result.rows[0];

    await logAudit(
      tenantId,
      authUser.userId,
      "CREATE_TASK",
      "task",
      task.id,
      ip
    );

    await client.query('COMMIT');

    return task;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const listTasksService = async (authUser, projectId, query) => {
  const { tenantId } = authUser;

  // verify project exists & tenant check
  const projectRes = await pool.query(
    `SELECT tenant_id FROM projects WHERE id = $1`,
    [projectId]
  );

  if (projectRes.rowCount === 0) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  if (projectRes.rows[0].tenant_id !== tenantId) {
    const err = new Error("Project does not belong to your tenant");
    err.statusCode = 403;
    throw err;
  }

  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  const status = query.status;
  const priority = query.priority;
  const assignedTo = query.assignedTo;
  const search = query.search;

  const filter = [`project_id = $1`];
  const values = [projectId];
  let idx = 2;

  if (status) {
    filter.push(`status = $${idx}`);
    values.push(status);
    idx++;
  }

  if (priority) {
    filter.push(`priority = $${idx}`);
    values.push(priority);
    idx++;
  }

  if (assignedTo) {
    filter.push(`assigned_to = $${idx}`);
    values.push(assignedTo);
    idx++;
  }

  if (search) {
    filter.push(`LOWER(title) LIKE $${idx}`);
    values.push(`%${search.toLowerCase()}%`);
    idx++;
  }

  const where = `WHERE ${filter.join(' AND ')}`;

  const result = await pool.query(
    `
    SELECT t.id, t.title, t.description, t.status, t.priority, 
           t.assigned_to, t.due_date, t.created_at,
           u.full_name AS assigned_name,
           u.email AS assigned_email
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    ${where}
    ORDER BY priority DESC, due_date ASC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
    `,
    values
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM tasks ${where}`,
    values
  );

  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  const tasks = result.rows.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assignedTo: t.assigned_to ? {
      id: t.assigned_to,
      fullName: t.assigned_name,
      email: t.assigned_email
    } : null,
    dueDate: t.due_date,
    createdAt: t.created_at
  }));

  return {
    tasks,
    total,
    pagination: {
      currentPage: page,
      totalPages,
      limit
    }
  };
};

export const updateTaskStatusService = async (authUser, taskId, status, ip) => {
  const client = await pool.connect();

  try {
    const { tenantId, userId } = authUser;

    // verify task exists
    const taskRes = await client.query(
      `SELECT tenant_id FROM tasks WHERE id = $1`,
      [taskId]
    );

    if (taskRes.rowCount === 0) {
      const err = new Error("Task not found");
      err.statusCode = 404;
      throw err;
    }

    if (taskRes.rows[0].tenant_id !== tenantId) {
      const err = new Error("Task does not belong to your tenant");
      err.statusCode = 403;
      throw err;
    }

    await client.query('BEGIN');

    const result = await client.query(
      `
      UPDATE tasks
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status, updated_at
      `,
      [status, taskId]
    );

    await logAudit(
      tenantId,
      userId,
      "UPDATE_TASK_STATUS",
      "task",
      taskId,
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

export const updateTaskService = async (authUser, taskId, body, ip) => {
  const client = await pool.connect();

  try {
    const { tenantId, userId } = authUser;
    const { title, description, status, priority, assignedTo, dueDate } = body;

    const taskRes = await client.query(
      `SELECT tenant_id FROM tasks WHERE id = $1`,
      [taskId]
    );

    if (taskRes.rowCount === 0) {
      const err = new Error("Task not found");
      err.statusCode = 404;
      throw err;
    }

    if (taskRes.rows[0].tenant_id !== tenantId) {
      const err = new Error("Task does not belong to your tenant");
      err.statusCode = 403;
      throw err;
    }

    // validate assignedTo
    if (assignedTo) {
      const userRes = await client.query(
        `SELECT tenant_id FROM users WHERE id = $1`,
        [assignedTo]
      );

      if (userRes.rowCount === 0) {
        const err = new Error("Assigned user not found");
        err.statusCode = 400;
        throw err;
      }

      if (userRes.rows[0].tenant_id !== tenantId) {
        const err = new Error("Assigned user not in this tenant");
        err.statusCode = 400;
        throw err;
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (title) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }

    if (description) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }

    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }

    if (priority) {
      fields.push(`priority = $${idx++}`);
      values.push(priority);
    }

    if (body.hasOwnProperty('assignedTo')) {
      fields.push(`assigned_to = $${idx++}`);
      values.push(assignedTo || null);
    }

    if (body.hasOwnProperty('dueDate')) {
      fields.push(`due_date = $${idx++}`);
      values.push(dueDate || null);
    }

    if (fields.length === 0) {
      const err = new Error("No valid fields provided");
      err.statusCode = 400;
      throw err;
    }

    values.push(taskId);

    await client.query('BEGIN');

    const result = await client.query(
      `
      UPDATE tasks
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, title, description, status, priority, assigned_to, due_date, updated_at
      `,
      values
    );

    const updatedTask = result.rows[0];

    await logAudit(
      tenantId,
      userId,
      "UPDATE_TASK",
      "task",
      taskId,
      ip
    );

    await client.query('COMMIT');

    return updatedTask;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteTaskService = async (user, projectId, taskId, ip) => {
  const { tenantId, role, id: userId } = user;

  // Only tenant_admin or super_admin can delete
  if (!['tenant_admin', 'super_admin'].includes(role)) {
    throw new AppError('Not authorized to delete task', 403);
  }

  const result = await pool.query(
    `
    DELETE FROM tasks
    WHERE id = $1
      AND project_id = $2
      AND tenant_id = $3
    RETURNING id
    `,
    [taskId, projectId, tenantId]
  );

  if (result.rowCount === 0) {
    const err = new Error('Not authorized to delete task');
    err.statusCode = 403;
    throw err;

  }

  // Optional: audit log here
  await pool.query(
    `
    INSERT INTO audit_logs (tenant_id, user_id, action, ip_address)
    VALUES ($1, $2, $3, $4)
    `,
    [tenantId, userId, 'DELETE_TASK', ip]
  );

  return { id: taskId };
};

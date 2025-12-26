import { pool } from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.js';
import { logAudit } from '../utils/auditLogger.js';

export const addUserToTenantService = async (authUser, tenantId, body, ip) => {
  const { email, password, fullName, role = 'user' } = body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify tenant exists
    const tenantRes = await client.query(
      `SELECT max_users FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantRes.rowCount === 0) {
      const err = new Error("Tenant not found");
      err.statusCode = 404;
      throw err;
    }

    const maxUsers = tenantRes.rows[0].max_users;

    // Count users
    const countRes = await client.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );

    if (parseInt(countRes.rows[0].count) >= maxUsers) {
      const err = new Error("Subscription limit reached");
      err.statusCode = 403;
      throw err;
    }

    // unique email check (within tenant)
    const existing = await client.query(
      `SELECT id FROM users WHERE tenant_id = $1 AND email = $2`,
      [tenantId, email]
    );

    if (existing.rowCount > 0) {
      const err = new Error("Email already exists in this tenant");
      err.statusCode = 409;
      throw err;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const result = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
      [tenantId, email, hashedPassword, fullName, role]
    );


    const createdUser = result.rows[0];

    // Audit
    await logAudit(
      tenantId,
      authUser.userId,
      'CREATE_USER',
      'user',
      createdUser.id,
      ip
    );

    await client.query('COMMIT');

    return createdUser;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};


export const listTenantUsersService = async (tenantId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  const search = query.search;
  const role = query.role;

  const filter = [`tenant_id = $1`];
  const values = [tenantId];
  let idx = 2;

  if (search) {
    filter.push(`(LOWER(full_name) LIKE $${idx} OR LOWER(email) LIKE $${idx})`);
    values.push(`%${search.toLowerCase()}%`);
    idx++;
  }

  if (role) {
    filter.push(`role = $${idx}`);
    values.push(role);
    idx++;
  }

  const where = `WHERE ${filter.join(' AND ')}`;

  const users = await pool.query(
    `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    values
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users ${where}`,
    values
  );

  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  return {
    users: users.rows,
    total,
    pagination: {
      currentPage: page,
      totalPages,
      limit
    }
  };
};

export const updateUserService = async (authUser, userId, body, ip) => {
  const client = await pool.connect();

  try {
    const { role, tenantId } = authUser;

    const userRes = await client.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rowCount === 0) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const target = userRes.rows[0];

    // ensure same tenant
    if (target.tenant_id !== tenantId) {
      const err = new Error("Cannot update user from another tenant");
      err.statusCode = 403;
      throw err;
    }

    const { fullName, role: newRole, isActive } = body;

    await client.query('BEGIN');

    const fields = [];
    const values = [];
    let idx = 1;

    // self can update only fullName
    if (authUser.userId === userId) {
      if (fullName) {
        fields.push(`full_name = $${idx++}`);
        values.push(fullName);
      } else {
        const err = new Error("Self-update allowed for fullName only");
        err.statusCode = 403;
        throw err;
      }
    } else if (role === 'tenant_admin') {
      if (fullName) {
        fields.push(`full_name = $${idx++}`);
        values.push(fullName);
      }
      if (newRole) {
        fields.push(`role = $${idx++}`);
        values.push(newRole);
      }
      if (typeof isActive === 'boolean') {
        fields.push(`is_active = $${idx++}`);
        values.push(isActive);
      }
    } else {
      const err = new Error("Unauthorized update attempt");
      err.statusCode = 403;
      throw err;
    }

    if (fields.length === 0) {
      const err = new Error("No valid fields to update");
      err.statusCode = 400;
      throw err;
    }

    values.push(userId);

    const result = await client.query(
      `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, email, full_name, role, is_active, updated_at
      `,
      values
    );

    // audit log
    await logAudit(
      tenantId,
      authUser.userId,
      "UPDATE_USER",
      "user",
      userId,
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


export const deleteUserService = async (authUser, userId, ip) => {
  const client = await pool.connect();

  try {
    const { tenantId } = authUser;

    const userRes = await client.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rowCount === 0) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const target = userRes.rows[0];

    // ensure same tenant
    if (target.tenant_id !== tenantId) {
      const err = new Error("Cannot delete user from another tenant");
      err.statusCode = 403;
      throw err;
    }

    await client.query('BEGIN');

    // remove assigned tasks (set null)
    await client.query(
      `UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1`,
      [userId]
    );

    // delete user
    await client.query(
      `DELETE FROM users WHERE id = $1`,
      [userId]
    );

    // audit log
    await logAudit(
      tenantId,
      authUser.userId,
      "DELETE_USER",
      "user",
      userId,
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


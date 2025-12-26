import { pool } from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.js';
import { logAudit } from '../utils/auditLogger.js';

export const getTenantDetailsService = async (tenantId) => {
  const tenantResult = await pool.query(
    `SELECT id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at
     FROM tenants
     WHERE id = $1`,
    [tenantId]
  );

  if (tenantResult.rowCount === 0) {
    const err = new Error("Tenant not found");
    err.statusCode = 404;
    throw err;
  }

  const tenant = tenantResult.rows[0];

  // stats
  const usersCount = await pool.query(
    `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
    [tenantId]
  );

  const projectsCount = await pool.query(
    `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
    [tenantId]
  );

  const tasksCount = await pool.query(
    `SELECT COUNT(*) FROM tasks WHERE tenant_id = $1`,
    [tenantId]
  );

  return {
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    status: tenant.status,
    subscriptionPlan: tenant.subscription_plan,
    maxUsers: tenant.max_users,
    maxProjects: tenant.max_projects,
    createdAt: tenant.created_at,
    stats: {
      totalUsers: parseInt(usersCount.rows[0].count),
      totalProjects: parseInt(projectsCount.rows[0].count),
      totalTasks: parseInt(tasksCount.rows[0].count)
    }
  };
};

// logAudit

export const updateTenantService = async (authUser, tenantId, body, ip) => {
  const client = await pool.connect();

  try {
    const { role } = authUser;
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = body;

    // tenant must exist
    const tenantRes = await client.query(
      `SELECT * FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantRes.rowCount === 0) {
      const err = new Error("Tenant not found");
      err.statusCode = 404;
      throw err;
    }

    const tenant = tenantRes.rows[0];

    // tenant admin restrictions
    if (role === "tenant_admin") {
      if (status || subscriptionPlan || maxUsers || maxProjects) {
        const err = new Error("Tenant admin cannot modify restricted fields");
        err.statusCode = 403;
        throw err;
      }
    }

    await client.query('BEGIN');

    // build update dynamic SQL
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (status && role === 'super_admin') { fields.push(`status = $${idx++}`); values.push(status); }
    if (subscriptionPlan && role === 'super_admin') { fields.push(`subscription_plan = $${idx++}`); values.push(subscriptionPlan); }
    if (maxUsers && role === 'super_admin') { fields.push(`max_users = $${idx++}`); values.push(maxUsers); }
    if (maxProjects && role === 'super_admin') { fields.push(`max_projects = $${idx++}`); values.push(maxProjects); }

    if (fields.length === 0) {
      const err = new Error("No valid fields to update");
      err.statusCode = 400;
      throw err;
    }

    values.push(tenantId);

    const updateQuery = `
      UPDATE tenants SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, name, updated_at
    `;

    const result = await client.query(updateQuery, values);

    // audit log
    await logAudit(
      tenantId,
      authUser.userId,
      "UPDATE_TENANT",
      "tenant",
      tenantId,
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


export const listTenantsService = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const offset = (page - 1) * limit;

  const status = query.status;
  const plan = query.subscriptionPlan;

  let filter = [];
  let values = [];
  let idx = 1;

  if (status) {
    filter.push(`status = $${idx}`);
    values.push(status);
    idx++;
  }

  if (plan) {
    filter.push(`subscription_plan = $${idx}`);
    values.push(plan);
    idx++;
  }

  const where = filter.length ? `WHERE ${filter.join(' AND ')}` : '';

  const tenants = await pool.query(
    `
      SELECT id, name, subdomain, status, subscription_plan, created_at
      FROM tenants
      ${where}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    values
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM tenants ${where}`,
    values
  );

  const totalTenants = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalTenants / limit);

  const enriched = [];

  for (const t of tenants.rows) {
    const usersCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [t.id]
    );
    const projectsCount = await pool.query(
      `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
      [t.id]
    );

    enriched.push({
      id: t.id,
      name: t.name,
      subdomain: t.subdomain,
      status: t.status,
      subscriptionPlan: t.subscription_plan,
      totalUsers: parseInt(usersCount.rows[0].count),
      totalProjects: parseInt(projectsCount.rows[0].count),
      createdAt: t.created_at
    });
  }

  return {
    tenants: enriched,
    pagination: {
      currentPage: page,
      totalPages,
      totalTenants,
      limit
    }
  };
};



export const addUserToTenantService = async (authUser, tenantId, body, ip) => {

  const { email, password, fullName, role = 'user' } = body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // verify tenant exists
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

    // count current users
    const countRes = await client.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );

    if (parseInt(countRes.rows[0].count) >= maxUsers) {
      const err = new Error("Subscription limit reached");
      err.statusCode = 403;
      throw err;
    }

    // check unique email per tenant
    const existing = await client.query(
      `SELECT id FROM users WHERE tenant_id = $1 AND email = $2`,
      [tenantId, email]
    );

    if (existing.rowCount > 0) {
      const err = new Error("Email already exists in tenant");
      err.statusCode = 409;
      throw err;
    }

    const hashed = await hashPassword(password);

    const result = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
      [tenantId, email, hashed, fullName, role]
    );

    // audit
    await logAudit(
      tenantId,
      authUser.userId,
      "CREATE_USER",
      "user",
      result.rows[0].id,
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

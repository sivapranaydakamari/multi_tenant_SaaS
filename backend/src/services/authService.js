import { pool } from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.js';

export const registerTenantService = async (body) => {
  const client = await pool.connect();

  try {
    const {
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName
    } = body;

    await client.query('BEGIN');

    // check subdomain exists
    const existingTenant = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (existingTenant.rowCount > 0) {
      const err = new Error("Subdomain already exists");
      err.statusCode = 409;
      throw err;
    }

    // check admin email exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingUser.rowCount > 0) {
      const err = new Error("Admin email already exists");
      err.statusCode = 409;
      throw err;
    }

    // hash password
    const hashedPassword = await hashPassword(adminPassword);

    // create tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'active', 'free', 5, 3)
       RETURNING id, subdomain`,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    // create admin user
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, hashedPassword, adminFullName]
    );

    await client.query('COMMIT');

    return {
      tenantId,
      subdomain,
      adminUser: userResult.rows[0]
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};


import { comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';

export const loginUserService = async (body) => {
  const { email, password, tenantSubdomain, tenantId } = body;

  // find tenant
  const tenantQuery = tenantSubdomain
    ? 'SELECT * FROM tenants WHERE subdomain = $1'
    : 'SELECT * FROM tenants WHERE id = $1';

  const tenantValue = tenantSubdomain ? tenantSubdomain : tenantId;

  const tenantResult = await pool.query(tenantQuery, [tenantValue]);

  if (tenantResult.rowCount === 0) {
    const err = new Error("Tenant not found");
    err.statusCode = 404;
    throw err;
  }

  const tenant = tenantResult.rows[0];

  // check tenant active
  if (tenant.status !== 'active') {
    const err = new Error("Tenant is suspended or inactive");
    err.statusCode = 403;
    throw err;
  }

  // find user
  const userResult = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND tenant_id = $2`,
    [email, tenant.id]
  );

  if (userResult.rowCount === 0) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const user = userResult.rows[0];

  // compare password
  const passwordMatch = await comparePassword(password, user.password_hash);

  if (!passwordMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({
    userId: user.id,
    tenantId: tenant.id,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      tenantId: tenant.id
    },
    token,
    expiresIn: 86400
  };
};


export const getCurrentUserService = async (authUser) => {
  const { userId, tenantId } = authUser;

  // get user
  const userResult = await pool.query(
    `SELECT id, email, full_name, role, is_active, tenant_id
     FROM users WHERE id = $1`,
    [userId]
  );

  if (userResult.rowCount === 0) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const user = userResult.rows[0];

  // get tenant
  const tenantResult = await pool.query(
    `SELECT id, name, subdomain, subscription_plan, max_users, max_projects
     FROM tenants
     WHERE id = $1`,
    [tenantId]
  );

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    isActive: user.is_active,
    tenant: tenantResult.rows[0]
  };
};

import { logAudit } from '../utils/auditLogger.js';

export const logoutUserService = async (authUser, ip) => {
  // For JWT only auth, no DB session delete required
  
  // Log audit
  await logAudit(
    authUser.tenantId,
    authUser.userId,
    "LOGOUT",
    "session",
    null,
    ip
  );

  return;
};

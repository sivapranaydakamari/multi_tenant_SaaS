import { pool } from '../config/db.js';
import { v4 as uuid } from 'uuid';

export const logAudit = async (
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  ipAddress
) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs
      (id, tenant_id, user_id, action, entity_type, entity_id, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        uuid(),
        tenantId,
        userId || null,
        action,
        entityType,
        entityId,
        ipAddress || null
      ]
    );
  } catch (err) {
    console.error("Audit Log Failed:", err.message);
  }
};

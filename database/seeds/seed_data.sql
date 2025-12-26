-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

WITH demo_tenant AS (
  INSERT INTO tenants (
    id, name, subdomain, status, subscription_plan, max_users, max_projects
  )
  VALUES (
    uuid_generate_v4(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    3
  )
  RETURNING id
),

super_admin AS (
  INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
  )
  VALUES (
    uuid_generate_v4(),
    NULL,
    'superadmin@system.com',
    '$2a$10$GhU9S5E7wM4q1glSKDqxeO9xQ8rmDbCT/weatherQQiMZr2YqKouC',
    'System SuperAdmin',
    'super_admin'
  )
  RETURNING id
),

tenant_admin AS (
  INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
  )
  SELECT
    uuid_generate_v4(),
    id,
    'admin@demo.com',
    '$2a$10$y4VYkbFHrRZgVxB3SlcwoeUFjkfrD19iQrskHr7vSGE8f9MxNvtMm',
    'Demo Admin',
    'tenant_admin'
  FROM demo_tenant
  RETURNING id, tenant_id
),

regular_users AS (
  INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
  )
  SELECT uuid_generate_v4(), tenant_id, email, password_hash, full_name, 'user'
  FROM (
    SELECT tenant_id,
           'user1@demo.com' AS email,
           '$2a$10$YCyRTHxW5EhUypMlnGZpxe61WFC2uvv8p1g8/qrZFxuF6oAiYby0i' AS password_hash,
           'Demo User 1' AS full_name
    FROM tenant_admin
    UNION ALL
    SELECT tenant_id,
           'user2@demo.com',
           '$2a$10$YCyRTHxW5EhUypMlnGZpxe61WFC2uvv8p1g8/qrZFxuF6oAiYby0i',
           'Demo User 2'
    FROM tenant_admin
  ) u
  RETURNING id
),

projects AS (
  INSERT INTO projects (
    id, tenant_id, name, description, status, created_by
  )
  SELECT
    uuid_generate_v4(),
    tenant_id,
    name,
    description,
    'active',
    id
  FROM tenant_admin
  CROSS JOIN (
    VALUES
      ('Project Alpha', 'Initial demo project'),
      ('Project Beta', 'Second demo project')
  ) p(name, description)
  RETURNING id, tenant_id
)

INSERT INTO tasks (
  id, project_id, tenant_id, title, description, status, priority
)
SELECT
  uuid_generate_v4(),
  p.id,
  p.tenant_id,
  t.title,
  t.description,
  t.status::task_status_enum,
  t.priority::priority_enum
FROM projects p
CROSS JOIN (
  VALUES
    ('Setup environment', 'Initial setup', 'todo', 'medium'),
    ('Create DB schema', 'Core schema setup', 'in_progress', 'high'),
    ('Write migrations', 'Core DB migrations', 'completed', 'high')
) t(title, description, status, priority);

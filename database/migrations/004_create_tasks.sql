-- UP Migration
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status task_status_enum NOT NULL DEFAULT 'todo',
    priority priority_enum NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_tenant_project ON tasks (tenant_id, project_id);

CREATE TRIGGER update_tasks_timestamp
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


-- -- DOWN Migration
-- DROP TABLE IF EXISTS tasks;

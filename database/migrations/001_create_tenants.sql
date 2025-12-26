-- UP Migration
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    status tenant_status_enum NOT NULL DEFAULT 'active',
    subscription_plan subscription_plan_enum NOT NULL DEFAULT 'free',
    max_users INTEGER NOT NULL,
    max_projects INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_tenants_timestamp
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- -- DOWN Migration
-- DROP TABLE IF EXISTS tenants;


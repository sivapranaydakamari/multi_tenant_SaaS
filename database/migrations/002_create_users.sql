-- UP Migration
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role_enum NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_email_per_tenant UNIQUE (tenant_id, email)
);

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- -- DOWN Migration
-- DROP TABLE IF EXISTS users;

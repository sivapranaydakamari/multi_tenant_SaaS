-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ENUM for tenant status
CREATE TYPE tenant_status_enum AS ENUM ('active', 'suspended', 'trial');

-- ENUM for subscription plans
CREATE TYPE subscription_plan_enum AS ENUM ('free', 'pro', 'enterprise');

-- ENUM for user roles
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'tenant_admin', 'user');

-- ENUM for project status
CREATE TYPE project_status_enum AS ENUM ('active', 'archived', 'completed');

-- ENUM for task status
CREATE TYPE task_status_enum AS ENUM ('todo', 'in_progress', 'completed');

-- ENUM for priority
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high');

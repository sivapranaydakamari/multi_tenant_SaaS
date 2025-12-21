# Technical Specification

## 1. Database Choice

We are using **PostgreSQL** as our database because it is robust, scalable, and supports relational data with strong integrity. It allows us to enforce **tenant-level isolation**, unique constraints, and indexes efficiently, which is critical for a multi-tenant SaaS platform.

---

## 2. Tables & Structure

### **Tenants**

Stores information about each organization using the system.

* `id` (PK)
* `name`
* `subdomain` (used for login)
* `plan` (free, pro, enterprise)
* `created_at`

### **Users**

All users in the system.

* `id` (PK)
* `tenant_id` (FK → tenants.id, NULL for Super Admin)
* `name`
* `email` (unique per tenant)
* `password` (hashed with bcrypt)
* `role` (super_admin, tenant_admin, user)

### **Projects**

Stores all projects for tenants.

* `id` (PK)
* `tenant_id` (FK → tenants.id)
* `name`
* `created_by` (FK → users.id)

### **Tasks**

Stores tasks under projects.

* `id` (PK)
* `project_id` (FK → projects.id)
* `tenant_id` (FK → tenants.id)
* `assigned_to` (FK → users.id)
* `title`
* `description`
* `status` (todo, in_progress, done)

### **Audit Logs**

Tracks important actions for accountability.

* `id` (PK)
* `tenant_id` (FK → tenants.id)
* `action` (string describing the action)
* `performed_by` (FK → users.id)
* `timestamp`

---

## 3. Relationships & Constraints

* **Foreign Keys** ensure proper associations (tenant → user → project → task).
* **Cascade delete** where appropriate (e.g., deleting a tenant removes its users, projects, and tasks).
* **Unique constraints**: Emails must be unique **within a tenant**.
* **Indexes**: Every table with `tenant_id` has an index for fast queries.

---

## 4. Multi-Tenancy Rules

* Every record is associated with a `tenant_id` except for Super Admin.
* Tenant isolation is enforced at the **backend level**.
* Subdomain-based login helps identify tenants for incoming requests.

---

## 5. Subscription Plan Enforcement

* Free, Pro, and Enterprise plans define `max_users` and `max_projects`.
* Backend checks limits before creating users or projects.
* Violations return **HTTP 409 Conflict** with descriptive error messages.

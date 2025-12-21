# API.md — Multi-Tenant SaaS Platform

## 1. Overview

This document lists all APIs for the **Multi-Tenant Project & Task Management platform**.

**Key Points:**

* Every API requires a **JWT token** (except login/register).
* Data is **tenant-scoped**, meaning you can only access your own organization’s data.
* Roles: `Super Admin`, `Tenant Admin`, `User`. Access is enforced via **RBAC**.
* Response format is always:

```json
{
  "success": true,
  "message": "Some description",
  "data": {}
}
```

* Standard HTTP codes:

  * `200` — OK
  * `201` — Created
  * `400` — Bad Request
  * `401` — Unauthorized
  * `403` — Forbidden
  * `404` — Not Found
  * `409` — Conflict / Limit exceeded

---

## 2. Authentication APIs

### 2.1 Login

**POST** `/api/auth/login`
**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "subdomain": "tenant1"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "role": "Tenant Admin",
    "tenantId": "1"
  }
}
```

### 2.2 Register Tenant (Super Admin Only)

**POST** `/api/auth/register-tenant`
**Body:**

```json
{
  "name": "Tenant Name",
  "adminName": "John Doe",
  "adminEmail": "john@tenant.com",
  "password": "pass123",
  "plan": "free"
}
```

**Rules:**

* Tenant `subdomain` is unique
* Admin becomes **Tenant Admin**
* Super Admin only

---

## 3. Tenant APIs (Super Admin)

* **Get all tenants** — `GET /api/tenants`
* **Update tenant plan** — `PATCH /api/tenants/:id/plan`
* **Delete tenant** — `DELETE /api/tenants/:id`

✅ Only accessible by **Super Admin**

---

## 4. User APIs (Tenant Admin)

* **Create user** — `POST /api/users`

  * Must check **max_users** for tenant plan
* **List users** — `GET /api/users`
* **Update user role/info** — `PATCH /api/users/:id`
* **Delete user** — `DELETE /api/users/:id`

**Notes:**

* Super Admin users are global, `tenant_id = NULL`
* Users can only see other users in their tenant

---

## 5. Project APIs (Tenant Admin)

* **Create project** — `POST /api/projects`

  * Must check **max_projects** limit
* **List projects** — `GET /api/projects`
* **Update project** — `PATCH /api/projects/:id`
* **Delete project** — `DELETE /api/projects/:id`

**Rules:**

* Projects belong to a tenant
* Tenant Admin manages projects for their tenant only

---

## 6. Task APIs (Tenant Admin/User)

* **Create task** — `POST /api/tasks`
* **List tasks by project** — `GET /api/projects/:id/tasks`
* **Update task** — `PATCH /api/tasks/:id`
* **Delete task** — `DELETE /api/tasks/:id`
* **Assign task** — `PATCH /api/tasks/:id/assign`

**Notes:**

* Users can only view tasks **assigned to them**
* Tenant Admin can assign any task in their tenant

---

## 7. Audit Logging

All critical actions are logged:

* User creation/deletion
* Project creation/deletion
* Task assignment/status update

**Table:** `audit_logs`
**Fields:** `tenant_id`, `action`, `performed_by`, `timestamp`

---

## 8. Errors & Limits

* **User Limit Exceeded:** `409 Conflict`
* **Project Limit Exceeded:** `409 Conflict`
* **Unauthorized Access:** `403 Forbidden`
* **Invalid JWT:** `401 Unauthorized`

---
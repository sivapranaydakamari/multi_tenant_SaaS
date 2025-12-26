# API Documentation – Multi-Tenant SaaS Platform

This document describes all backend APIs exposed by the **Multi-Tenant SaaS Project Management System**.

All APIs are RESTful, JSON-based, and secured using **JWT authentication** where required.

---

## Authentication Overview

* Authentication is handled using **JWT (Bearer Token)**
* After login, the token must be sent in headers:

```
Authorization: Bearer <JWT_TOKEN>
```

* Tenant isolation is enforced on every protected route
* Super Admin has no `tenant_id`
* Tenant Admin & Users belong to a tenant

---

## Base URL

### Local / Docker

```
http://localhost:5000/api
```

---

## Health Check

### 1. Health Check API

**Endpoint**

```
GET /health
```

**Auth Required:** No

**Response**

```json
{
  "status": "ok",
  "database": "connected"
}
```

Used by Docker & evaluation scripts to verify readiness.

---

## Authentication APIs

### 2. Register Tenant

Registers a new tenant along with its Tenant Admin.

**Endpoint**

```
POST /auth/register-tenant
```

**Auth Required:** No

**Request Body**

```json
{
  "organizationName": "Acme Corp",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminName": "Acme Admin",
  "password": "Admin@123"
}
```

**Response**

```json
{
  "message": "Tenant registered successfully"
}
```

---

### 3. Login

Authenticate a user and receive JWT token.

**Endpoint**

```
POST /auth/login
```

**Auth Required:** No

**Request Body**

```json
{
  "email": "admin@demo.com",
  "password": "Admin@123"
}
```

**Response**

```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "uuid",
    "email": "admin@demo.com",
    "role": "tenant_admin",
    "tenant_id": "uuid"
  }
}
```

---

### 4. Logout

Client-side logout (token invalidation handled on frontend).

**Endpoint**

```
POST /auth/logout
```

**Auth Required:** Yes

**Response**

```json
{
  "message": "Logged out successfully"
}
```

---

## User Management APIs

### 5. Create User (Tenant Admin Only)

**Endpoint**

```
POST /users
```

**Auth Required:** Yes (Tenant Admin)

**Request Body**

```json
{
  "email": "user3@demo.com",
  "fullName": "Demo User 3",
  "password": "User@123",
  "role": "user"
}
```

**Response**

```json
{
  "message": "User created successfully"
}
```

---

### 6. List Users

**Endpoint**

```
GET /users
```

**Auth Required:** Yes

**Response**

```json
[
  {
    "id": "uuid",
    "email": "user1@demo.com",
    "role": "user"
  }
]
```

---

### 7. Delete User

**Endpoint**

```
DELETE /users/:userId
```

**Auth Required:** Yes (Tenant Admin)

**Response**

```json
{
  "message": "User deleted successfully"
}
```

---

## Project APIs

### 8. Create Project

**Endpoint**

```
POST /projects
```

**Auth Required:** Yes

**Request Body**

```json
{
  "name": "New Project",
  "description": "Project description"
}
```

**Response**

```json
{
  "message": "Project created successfully"
}
```

---

### 9. List Projects

**Endpoint**

```
GET /projects
```

**Auth Required:** Yes

**Response**

```json
[
  {
    "id": "uuid",
    "name": "Project Alpha",
    "status": "active"
  }
]
```

---

### 10. Get Project Details

**Endpoint**

```
GET /projects/:projectId
```

**Auth Required:** Yes

**Response**

```json
{
  "id": "uuid",
  "name": "Project Alpha",
  "description": "Initial demo project"
}
```

---

### 11. Update Project

**Endpoint**

```
PUT /projects/:projectId
```

**Auth Required:** Yes

**Request Body**

```json
{
  "name": "Updated Project Name",
  "status": "active"
}
```

---

### 12. Delete Project

**Endpoint**

```
DELETE /projects/:projectId
```

**Auth Required:** Yes

**Response**

```json
{
  "message": "Project deleted successfully"
}
```

---

## Task APIs

### 13. Create Task

**Endpoint**

```
POST /projects/:projectId/tasks
```

**Auth Required:** Yes

**Request Body**

```json
{
  "title": "Setup Database",
  "description": "Initial DB setup",
  "priority": "high"
}
```

---

### 14. List Tasks

**Endpoint**

```
GET /projects/:projectId/tasks
```

**Auth Required:** Yes

**Response**

```json
[
  {
    "id": "uuid",
    "title": "Setup Database",
    "status": "todo",
    "priority": "high"
  }
]
```

---

### 15. Update Task

**Endpoint**

```
PUT /tasks/:taskId
```

**Auth Required:** Yes

**Request Body**

```json
{
  "status": "in_progress",
  "priority": "medium"
}
```

---

### 16. Delete Task

**Endpoint**

```
DELETE /tasks/:taskId
```

**Auth Required:** Yes

**Response**

```json
{
  "message": "Task deleted successfully"
}
```

---

## Audit Logs

### 17. List Audit Logs

**Endpoint**

```
GET /audit-logs
```

**Auth Required:** Yes (Admin)

**Response**

```json
[
  {
    "action": "PROJECT_CREATED",
    "performed_by": "admin@demo.com",
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

---

## Tenant APIs

### 18. Get Tenant Info

**Endpoint**

```
GET /tenant
```

**Auth Required:** Yes

**Response**

```json
{
  "id": "uuid",
  "name": "Demo Company",
  "subdomain": "demo",
  "status": "active"
}
```

---

## Super Admin APIs

### 19. List All Tenants (Super Admin Only)

**Endpoint**

```
GET /tenants
```

**Auth Required:** Yes (Super Admin)

**Response**

```json
[
  {
    "name": "Demo Company",
    "status": "active"
  }
]
```

---

## Role Summary

| Role         | Permissions                   |
| ------------ | ----------------------------- |
| Super Admin  | View all tenants              |
| Tenant Admin | Manage users, projects, tasks |
| User         | Manage assigned tasks         |

---

## API Coverage Checklist

* ✔ Authentication
* ✔ Multi-tenant isolation
* ✔ Role-based access
* ✔ Projects & tasks
* ✔ Automatic seed support
* ✔ Health check


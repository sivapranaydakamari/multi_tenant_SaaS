# Architecture.md

## Multi-Tenant Project & Task Management System

---

## 1. Overview

This project is designed as a **multi-tenant SaaS application** where multiple organizations (tenants) can use the same system while keeping their data completely isolated.

The main goal of the architecture is to:

* Support multiple tenants in a **single deployment**
* Ensure **strict data isolation**
* Provide **role-based access control**
* Keep the system **simple, scalable, and secure**

The application follows a **client–server architecture** with a shared database model.

---

## 2. High-Level System Architecture

At a high level, the system consists of three main components:

```
Frontend (React)
      |
      |  REST APIs (JWT Auth)
      |
Backend (Node.js + Express)
      |
      |  SQL Queries
      |
PostgreSQL Database
```

### Explanation:

* The **Frontend** handles UI, routing, and user interactions.
* The **Backend** handles authentication, authorization, tenant isolation, and business logic.
* The **Database** stores data for all tenants using a shared schema with tenant-based separation.

---

## 3. Multi-Tenancy Strategy

### 3.1 Shared Database, Shared Schema

This system uses a **shared database and shared schema** approach.

* All tenants use the **same database**
* All major tables contain a `tenant_id` column
* Data is filtered at the application level using `tenant_id`

This approach is chosen because it:

* Is cost-efficient
* Is easy to manage
* Scales well for small and medium SaaS applications

---

### 3.2 Tenant Isolation Logic

Tenant isolation is enforced **strictly at the backend**.

Key rules:

* Every request (except Super Admin) is associated with a `tenant_id`
* The `tenant_id` is extracted from the **JWT token**
* All database queries include a tenant filter

Example (conceptual):

```
SELECT * FROM projects 
WHERE tenant_id = currentUser.tenant_id;
```

This ensures:

* One tenant cannot access another tenant’s data
* Even if API requests are manipulated, data remains protected

---

## 4. User Roles and Access Control

The system supports **three roles**:

### 4.1 Super Admin

* Exists at system level
* Not linked to any tenant (`tenant_id = NULL`)
* Can view and manage all tenants
* Mostly used for platform administration

### 4.2 Tenant Admin

* Belongs to exactly one tenant
* Can manage:

  * Users
  * Projects
  * Tasks
* Can invite users within the tenant
* Cannot access other tenants

### 4.3 User

* Regular team member
* Can view assigned projects and tasks
* Cannot manage users or system settings

---

## 5. Authentication & Authorization Flow

### 5.1 Authentication (JWT-Based)

* Users log in using email and password
* On successful login, a **JWT token** is generated
* Token expiry is set to **24 hours**

JWT payload contains:

* `userId`
* `role`
* `tenantId`

---

### 5.2 Authorization

Authorization is handled using **middleware**:

1. **Auth Middleware**

   * Validates JWT token
   * Extracts user details

2. **Role Middleware**

   * Checks if the user has permission to access the route

3. **Tenant Middleware**

   * Enforces tenant-level data filtering

This layered approach keeps security logic **centralized and clean**.

---

## 6. Backend Architecture

The backend follows a **layered architecture**:

```
Routes → Controllers → Services → Database
```

### Responsibilities:

* **Routes**: Define API endpoints
* **Controllers**: Handle request & response
* **Services**: Business logic
* **Middleware**: Auth, roles, tenant isolation
* **Models**: Database interaction

This structure improves:

* Code readability
* Maintainability
* Testing

---

## 7. Database Design Overview

* PostgreSQL is used as the primary database
* All core entities include `tenant_id`
* Relationships are enforced using foreign keys
* Indexes are added on `tenant_id` for performance

Detailed schema is explained in **technical-spec.md**

---

## 8. Scalability & Security Considerations

### Scalability

* Stateless backend (JWT-based auth)
* Can be horizontally scaled using Docker
* Database can be optimized with indexing and caching

### Security

* Passwords are hashed using bcrypt
* JWT authentication with expiration
* Strict role-based and tenant-based access control
* No cross-tenant data exposure

---

## 9. Summary

This architecture provides:

* Clear separation of concerns
* Strong tenant isolation
* Secure authentication & authorization
* Scalability for future growth

It is designed to be **simple enough for development** while still following **real-world SaaS architecture principles**.

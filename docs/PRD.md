# 📄 Product Requirements Document (PRD)

**Multi-Tenant SaaS Project & Task Management System**

---

## 1. Why This Project Exists

As teams and organizations grow, managing projects and tasks using simple tools becomes inefficient. Most companies need a centralized system where teams can collaborate, track work, and manage responsibilities — without exposing their data to other organizations.

This project aims to build a **multi-tenant SaaS platform** where multiple organizations can use the same application, but each organization’s data remains completely private and isolated. The system should feel like a dedicated app for every tenant, even though it runs on shared infrastructure.

---

## 2. What We Are Building

We are building a **Project & Task Management application** similar in concept to tools like Jira or Asana, but designed from the ground up to support **multi-tenancy**.

Each organization (tenant) will be able to:

* Create and manage its own users
* Organize work into projects
* Assign tasks to team members
* Operate independently from other tenants

At the same time, the system will support a **Super Admin** who can oversee the entire platform.

---

## 3. Who Will Use the System

### 3.1 User Roles

#### 🔹 Super Admin

* Exists at the system level
* Not tied to any specific tenant
* Can view and manage all tenants
* Used mainly for platform administration and monitoring

#### 🔹 Tenant Admin

* Admin of a single organization
* Can create users, projects, and tasks within their tenant
* Cannot see or access data from other tenants

#### 🔹 User

* Regular team member
* Can view and update tasks assigned to them
* Has no administrative permissions

---

## 4. Key Features

### 4.1 Authentication & Access Control

* Users log in using secure credentials
* Authentication is handled using JWT tokens
* Tokens expire after 24 hours
* Access to APIs is controlled using role-based permissions

---

### 4.2 Tenant Management

* Each organization is represented as a tenant
* Every tenant has:

  * A unique name
  * A unique subdomain
  * A subscription plan
* Tenant data is strictly isolated using a tenant-based access model

---

### 4.3 User Management

* Tenant Admins can invite and manage users
* Users belong to exactly one tenant
* Email addresses must be unique within a tenant
* User creation is restricted based on the tenant’s subscription plan

---

### 4.4 Project Management

* Projects are created within a tenant
* Only Tenant Admins can create projects
* Each project belongs to one tenant
* Project limits depend on the subscription plan

---

### 4.5 Task Management

* Tasks are created under projects
* Tasks can be assigned to users within the same tenant
* Supported task states:

  * Pending
  * In Progress
  * Completed

---

### 4.6 Audit Logging

* Important system actions are logged, such as:

  * User creation
  * Project creation
  * Task updates
* Logs help in tracking activity and debugging issues

---

## 5. Subscription Plans

Each tenant is assigned a subscription plan that defines usage limits.

| Plan       | Max Users | Max Projects |
| ---------- | --------- | ------------ |
| Free       | 5         | 3            |
| Pro        | 25        | 15           |
| Enterprise | 100       | 50           |

### Plan Rules

* All new tenants start on the **Free plan**
* Limits are enforced at the API level
* If a limit is exceeded, the system returns a **409 Conflict** response

---

## 6. Non-Functional Requirements

### Security

* All APIs are protected using JWT authentication
* Tenant isolation is enforced in middleware
* No tenant can access another tenant’s data

### Scalability

* The system uses a shared database with logical isolation
* Designed to support many tenants without code changes
* Easy to add new plans or features in the future

### Performance

* Database queries are optimized using indexes
* Tenant-based filtering is applied at query level
* API responses are lightweight and consistent

### Maintainability

* Clean and modular folder structure
* Clear separation of responsibilities
* Database migrations used for schema changes

---

## 7. Assumptions & Constraints

### Assumptions

* A user belongs to only one tenant
* Tasks and projects cannot span multiple tenants
* Super Admin access is limited to internal use

### Constraints

* Single PostgreSQL database
* Shared backend application
* Internet connectivity required

---

## 8. How We Measure Success

This project will be considered successful if:

* Tenant data remains fully isolated
* Role-based access works correctly
* Subscription limits are enforced consistently
* APIs behave as documented
* The application runs smoothly using Docker

---

## 9. Possible Future Enhancements

* Email notifications for task updates
* Tenant-level analytics dashboards
* Paid subscription handling
* Advanced reporting and exports

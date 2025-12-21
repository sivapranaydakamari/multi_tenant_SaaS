# Research

## 1. Introduction

This project focuses on building a **Multi-Tenant SaaS Project and Task Management System**. The main idea is to allow multiple organizations (tenants) to use a single application while keeping their data completely separate and secure. Each organization should feel like they are using their own private system, even though everything runs on the same backend and database.

In today’s software industry, many popular platforms such as Jira, Asana, Trello, and ClickUp follow this SaaS model. Studying how such systems work helps in understanding real-world backend design, security concerns, and scalability challenges.

---

## 2. What is Multi-Tenancy?

Multi-tenancy is a software architecture where **a single application instance serves multiple customers**, called tenants. Each tenant represents a separate organization with its own users, projects, and tasks.

Although tenants share the same application and database, their data must be strictly isolated. This means one tenant should never be able to see or access another tenant’s data, even accidentally.

There are different ways to implement multi-tenancy:

* Separate database per tenant
* Separate schema per tenant
* Shared database with tenant identifier

For this project, a **shared database with a tenant identifier (`tenant_id`)** is chosen because it is cost-effective, scalable, and widely used in real-world SaaS systems.

---

## 3. Why Data Isolation is Important

Data isolation is the most critical requirement in a multi-tenant system. Since multiple organizations use the same backend, even a small mistake in query filtering can expose sensitive data.

Proper data isolation ensures:

* Privacy of each tenant’s data
* Security against unauthorized access
* Trust in the platform
* Compliance with basic data protection principles

In this project, data isolation is enforced by:

* Including `tenant_id` in all relevant database tables
* Extracting tenant information from JWT tokens or subdomains
* Applying tenant-based filtering in every API request

---

## 4. SaaS Model and Subscription Plans

Most SaaS products operate on a subscription-based model. Organizations start with a basic plan and upgrade as their needs grow. This project simulates a real SaaS business model by introducing multiple subscription plans.

To reflect real-world SaaS platforms, the system introduces **subscription plans** with predefined limits.

| Plan       | Max Users | Max Projects |
| ---------- | --------- | ------------ |
| Free       | 5         | 3            |
| Pro        | 25        | 15           |
| Enterprise | 100       | 50           |

These limits are enforced at the API level to:

* Prevent excessive resource usage
* Encourage scalable growth
* Simulate realistic SaaS business models

---

## 5. Role-Based Access Control (RBAC)

Different users in the system have different responsibilities. To manage this effectively, the system implements **Role-Based Access Control (RBAC)**.

### Defined User Roles

**Super Admin**

* Has system-wide access
* Can view and manage all tenants
* Does not belong to any specific tenant

**Tenant Admin**

* Manages a specific tenant
* Can create and manage users, projects, and tasks within their organization
* Responsible for tenant-level operations

**User**

* Regular member of a tenant
* Can view and work on assigned projects and tasks
* Cannot perform administrative actions

RBAC ensures that users can only access features and data permitted by their role, improving both security and usability.

---

## 6. Why This Project Approach Was Chosen

This project is designed to closely match real-world backend systems used in production SaaS applications. Instead of building a simple CRUD app, it focuses on:

* Scalable architecture
* Secure authentication and authorization
* Proper documentation before implementation
* Clear separation of concerns

By following this approach, the project helps in gaining practical experience with system design, backend development, and SaaS concepts, which are highly relevant in modern software engineering.

---

## 7. Conclusion

The research phase helps in clearly understanding the problem domain before starting development. By studying multi-tenancy, SaaS architecture, data isolation, and role-based access control, this project lays a strong foundation for building a secure and scalable application.

This understanding guides the architectural decisions, database design, and API implementation in the later stages of the project.
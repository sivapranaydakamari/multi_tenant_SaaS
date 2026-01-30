# Multi-Tenant SaaS Project Management System

This project is a **production-ready Multi-Tenant SaaS application** built to manage organizations, users, projects, and tasks with proper isolation and role-based access control.

The system is fully containerized using **Docker**, automatically initializes the database with migrations and seed data, and is designed to be easily evaluated using a single command.

---

## What This Project Solves

Many SaaS platforms require:

* Multiple organizations (tenants)
* Separate data per tenant
* Admin and user roles
* Secure authentication
* Easy deployment

This project demonstrates **how to build that correctly**, end-to-end.

---

## Target Users

* SaaS product teams
* Backend / Full-stack developers
* Interview / evaluation assignments
* Organizations learning multi-tenant architecture

---

## Key Features

* True multi-tenant architecture (tenant isolation)
* JWT-based authentication & authorization
* Role-based access (Super Admin, Tenant Admin, User)
* Tenant registration with subdomain support
* Project management per tenant
* Task management with status & priority
* Enum-based task progress tracking
* Audit logging for critical actions
* Fully Dockerized (frontend + backend + database)
* Automatic migrations & seed data
* Health check endpoint for monitoring

---

## Architecture Overview

**High-level flow:**

```
Browser (React)
      ↓
Frontend (Port 3000)
      ↓
Backend API (Port 5000)
      ↓
PostgreSQL Database (Port 5432)
```

### Design Highlights

* Each request is validated with tenant context
* Super Admin is global (tenant_id = NULL)
* Tenant Admin manages users, projects, and tasks
* Stateless backend using JWT
* Database integrity enforced via foreign keys & enums

---

## Technology Stack

### Frontend

* React 18
* Material UI (MUI)
* Axios
* React Router

### Backend

* Node.js 18
* Express.js
* PostgreSQL
* JWT Authentication
* bcrypt password hashing

### Database

* PostgreSQL 15
* UUID primary keys
* ENUM types for status & priority

### DevOps

* Docker
* Docker Compose
* Nginx (frontend production serving)

---

## Environment Configuration

### Backend Environment Variables

A template is provided in `.env.example`:

```env
# Database
DB_HOST=database
DB_PORT=5432
DB_NAME=multi_tenant
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# Frontend (CORS)
FRONTEND_URL=http://frontend:3000
```

---

## Docker Setup (Mandatory)

### Prerequisites

* Docker Desktop
* Docker Compose

### Start Everything (One Command)

```bash
docker-compose up -d
```

This command will:

* Start PostgreSQL
* Run migrations automatically
* Load seed data
* Start backend API
* Start frontend UI

### Reset Everything (Fresh Database)

```bash
docker-compose down -v
docker-compose up -d
```

---

## Health Check

### Endpoint

```http
GET /api/health
```

### Response

```json
{
  "status": "ok",
  "database": "connected"
}
```

Health check becomes **ready only after**:

* Database connection
* Migrations completed
* Seed data loaded

---

## 🔐 Seeded Test Credentials

All required data is **automatically created**.

### Super Admin

```
Email: superadmin@system.com
Password: Admin@123
```

### Tenant Admin

```
Email: admin@demo.com
Password: Admin@123
```

### Regular User

```
Email: user1@demo.com
Password: User@123
```

---

## 📦 Database Initialization (Automatic)

No manual steps required.

Folder structure:

```
database/
 ├── migrations/
 │   ├── 000_init.sql
 │   ├── 001_create_tenants.sql
 │   ├── 002_create_users.sql
 │   ├── 003_create_projects.sql
 │   ├── 004_create_tasks.sql
 │   └── 005_create_audit_logs.sql
 └── seeds/
     └── seed_data.sql
```

Migrations and seeds run automatically on first startup.

---

## 📚 API Documentation

Detailed API documentation is available here:

```
docs/API.md
```

Includes:

* All endpoints
* Authentication requirements
* Request & response examples

---

## 🚀 Deployment

* Backend and frontend are fully containerized
* HTTPS-ready for production platforms
* Environment-based configuration
* Health check compatible with CI/CD

---

## Application Access URLs

After starting the application using Docker, the services will be available at the following URLs:

### Frontend (UI)

```
http://localhost:3000
```

### Backend API

```
http://localhost:5000/api
```

### Health Check

```
http://localhost:5000/api/health
```

The health endpoint confirms:

* Database connectivity
* Successful migrations
* Seed data initialization

---

## API Base URL Used by Frontend

The frontend communicates with the backend using the following base URL (configured via environment variables):

```
REACT_APP_API_URL=http://backend:5000/api
```

> Inside Docker, service names (`backend`, `frontend`, `database`) are used instead of `localhost` for inter-service communication.

---

## Quick Verification Checklist

After running:

```bash
docker-compose up -d
```

Verify:

* Frontend loads at `http://localhost:3000`
* Login works using seeded credentials
* Backend responds at `http://localhost:5000/api/health`
* Tenant, projects, and tasks are visible after login

---

## Docker Hub Images

If you are also providing Docker Hub images, add **this small section**:

```md
## Docker Hub Images

Prebuilt images are available on Docker Hub for faster evaluation.

- Backend: https://hub.docker.com/r/siva1426/multi-tenant-backend
- Frontend: https://hub.docker.com/r/siva1426/multi-tenant-frontend

Run using:
docker-compose -f docker-compose.prod.yml up -d
```

---

## Live Deployment (Production)

The application is deployed and accessible publicly:

### Frontend
https://multi-tenant-saas-frontend-gilt.vercel.app

### Backend API
https://multi-tenant-saas-sef3.onrender.com

### Health Check
https://multi-tenant-saas-sef3.onrender.com/api/healt

## Deployment

This project supports both **local Docker-based deployment** and **cloud production deployment**.

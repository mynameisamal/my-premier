# MY PREMIER – System Architecture

MY PREMIER is a B2B industrial product catalog platform designed as a lightweight, scalable entry point for sales and technical inquiries.

---

## 1. High-Level Overview

MY PREMIER consists of three main client applications connected to a single backend API.

- Mobile Client (Flutter)
- Mobile Sales App (Flutter)
- Admin Web App (Next.js)
- Backend API (Golang)
- Firebase (Auth, Firestore, Storage)

The system is designed to be **read-heavy**, **form-driven**, and **non-transactional** (no e-commerce).

---

## 2. Architecture Diagram (Conceptual)

Client Apps
→ REST API (Golang)
→ Firebase Services

- Authentication: Firebase Authentication
- Database: Firestore
- File Storage: Firebase Storage

---

## 3. Backend Architecture

### 3.1 Language & Style
- Golang
- net/http
- REST API
- Modular folder structure

### 3.2 Module-Based Design

Each domain is isolated into its own module:

- category
- product
- request
- support

Each module contains:
- model
- repository
- handler

This keeps the system easy to maintain and extend.

---

## 4. Authentication Flow

1. User logs in via Firebase (Client / Sales / Admin)
2. Firebase issues ID Token
3. Client sends token via: Authorization: Bearer <token>
4. Backend verifies token using Firebase Admin SDK
5. User UID is injected into request context

Public endpoints do not require authentication.

---

## 5. Role & Access Strategy (v1.0)

### Public (Guest / Client)
- Browse product catalog
- Submit request info
- Submit support request

### Authenticated (Sales / Admin)
- View all request info
- View support requests
- Update support status

Role enforcement is intentionally deferred to later versions.

---

## 6. API Design Philosophy

- Read-first API
- Simple JSON responses
- No business logic in handlers
- Firestore server timestamps
- No over-engineering

---

## 7. Why This Architecture

This architecture is chosen to:
- Minimize development complexity
- Scale read-heavy workloads
- Support future expansion (roles, analytics, notifications)
- Remain suitable as a portfolio-grade project

---

## 8. Future Improvements (Out of Scope v1.0)

- Role-based authorization
- Admin CRUD for products
- Notification system
- Search optimization
- Audit logs
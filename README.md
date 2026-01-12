# Retail Management System – Backend

A production-grade backend for a **single-business retail management system**, designed with correctness, scalability, and clarity as first-class concerns.

This system manages:

- Products & variants (SKUs)
- Purchases & sales
- Ledger-based inventory
- Role-based access
- Inventory availability & reporting queries

The architecture intentionally balances **Prisma (ORM)** with **raw SQL**, using each where it makes the most sense.

---

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma (hybrid usage)
- **Authentication**: JWT
- **Authorization**: Role-Based Access Control (RBAC)
- **Deployment**: Render

---

## 🧠 Architectural Principles

### 1. Inventory is a ledger, not a mutable counter

There is **no `inventory` table**.

Inventory is derived as:

```
SUM(purchase_items.quantity) - SUM(sale_items.quantity)
```

This ensures:

- auditability
- correctness under concurrency
- no race conditions
- easy support for future returns & adjustments

---

### 2. Business actions drive inventory

Inventory changes are **side-effects** of business events:

- purchases increase stock
- sales decrease stock

There are **no public APIs** such as `/inventory/in` or `/inventory/out`.

---

### 3. Hybrid data-access strategy (intentional)

| Use case             | Tool                  |
| -------------------- | --------------------- |
| Simple CRUD          | Prisma                |
| Relational reads     | Prisma relations      |
| Transactional writes | Prisma `$transaction` |
| Aggregates / reports | Raw SQL               |

Prisma is used where it improves clarity; SQL is used where correctness and performance matter.

---

### 4. Clear layering

```
HTTP (Express)
 ├─ Authentication / Authorization middleware
 ├─ Controllers (request boundary)
 └─ Services (business logic)
      ├─ Prisma (writes & relations)
      └─ Raw SQL (aggregates & reports)
```

Controllers never contain database logic.  
Services never depend on HTTP details.

---

## 📦 Domain Model Overview

### Core entities

- `categories`
- `products` (designs)
- `product_variants` (sellable SKUs)
- `purchase_orders` + `purchase_items`
- `sale_orders` + `sale_items`
- `users`

### Inventory

Inventory is **derived**, not stored, using purchase and sale item ledgers.

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based authorization
- Supported roles:
  - `ADMIN`
  - `STAFF`
  - `VIEWER`

Write operations are restricted to `ADMIN` and `STAFF`.

---

## 🧩 API Overview

### Catalog

```
GET  /categories
GET  /products
GET  /products?categoryId=...
GET  /products/:productId/variants
```

### Purchases & Sales

```
POST /purchases
POST /sales
```

### Inventory

```
GET /inventory
GET /inventory/:variantId/available
```

> Inventory writes occur implicitly via purchases and sales.

---

## 🗃️ Database & Transactions

- PostgreSQL owns timestamps (`DEFAULT NOW()`)
- Multi-step writes use **Prisma interactive transactions**
- Transactions automatically rollback on thrown errors
- Overselling is prevented at the transaction level

---

## ⚙️ Performance & Indexing

Indexes are added **only after real query patterns exist**.

Key indexed paths include:

- `products(category_id, name)`
- `product_variants(product_id)`
- `purchase_items(product_variant_id)`
- `sale_items(product_variant_id)`
- Time-based indexes for reporting (`purchased_at`, `sold_at`)

This system is designed to scale to:

- 100k+ products
- millions of purchase/sale ledger rows
- concurrent inventory operations

---

## 🧪 Local Development

### Prerequisites

- Node.js (LTS)
- PostgreSQL
- npm

### Setup

```bash
npm install
cp .env.example .env
npm run build
npm start
```

---

## 🧬 Prisma Notes

- Prisma CLI and Client versions are **explicitly locked**
- Prisma client generation is part of the build process
- Prisma is **not** used for complex aggregations
- No Prisma internal imports are used

---

## ❗ Important Design Decisions

- No mutable inventory table
- No optional path parameters for filters
- No formatted date strings passed to ORM
- No over-indexing without query evidence
- Database is the source of truth for timestamps

These decisions are deliberate and experience-driven.

---

## 📈 Future Enhancements

- Returns & stock adjustments
- Pagination & advanced filtering
- Reporting APIs
- Observability (metrics & tracing)
- Caching (only if proven necessary)

---

## 🧠 Who This Project Is For

- Developers interested in **real-world backend architecture**
- Engineers learning how retail systems are actually built
- Interview reviewers evaluating architectural maturity

---

## 📄 License

MIT (or update as required)

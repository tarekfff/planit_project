# Planit Security & Role Architecture

This document maps out exactly how the Planit authentication system keeps your application secure, how Postgres Row Level Security (RLS) protects data, and how Next.js Middleware physically prevents unauthorized users from loading hidden pages.

---

## 1. The Role System

Every user in the system is assigned a role in the database upon creation. Your application specifically uses four distinct roles, structured hierarchically:

| Role | Responsibility | Data Access (Database RLS) |
| :--- | :--- | :--- |
| **`admin`** | System Administrator | Can view, update, insert, and delete **everything** in the entire database. Bypasses all restrictions. |
| **`manager`** | Establishment Owner | Can view and modify data **only** related to the specific `establishment_id` they own. They can manage professionals, services, and manually book/edit appointments for clients strictly within their own walls. |
| **`professional`**| Service Provider | Can view only their own assigned `appointments` and update their own `bio` and `working_hours`. They can manually book appointments on behalf of clients. Cannot view other professionals' schedules. |
| **`client`** | End User / Customer | Can only read public establishments/services. Can only book appointments for themselves, and only view their own booking history. |
| *(Anonymous)* | Unregistered Visitor| Cannot write data. Can only view `is_active = TRUE` establishments, services, and professionals to browse the marketplace. |

> **Database Trigger Magic:** When a user registers (via Email or Google), the database trigger `handle_new_user` natively intercepts them and auto-generates their `profile`, defaulting them securely to the `client` role.

---

## 2. Next.js Middleware (Page Protection)

The `src/middleware.ts` file is the "bouncer" of your application. It runs physically on the server **before** any page is allowed to load or render.

### How Middleware works on Planit:
1. **Unregistered Visitors (No Login)**: 
   If a user is completely anonymous and tries to visit any URL starting with `/dashboard/...`, the middleware immediately intercepts the request and throws them back to the `/login` page. **They cannot see any application routes or data.**
2. **Logged-in Users returning to Auth**: 
   If a user is already logged in, and tries to visit `/login` or `/register`, the middleware pushes them directly to `/dashboard`.
3. **Strict Route Segregation (RBAC)**:
   The middleware pulls the user's explicit role directly from the database to see which folder they are allowed to look inside:
   - If a user tries to load a URL starting with `/dashboard/admin` but isn't an `admin`, they are forcefully bounced back to `/dashboard`.
   - If a user tries to load `/dashboard/manager` but is just a `client`, they are forcefully bounced back to `/dashboard`.

---

## 3. How to Create & Protect New Pages

If you want to create a new page and strictly lock it down to a specific user base, you just rely on the established Middleware structure!

### Scenario A: Creating a new Manager-Only Page
Say you want to create an exclusive financial summary page for Managers only.
1. Place the new page code precisely inside the manager locked folder: 
   `src/app/(dashboard)/dashboard/manager/finances/page.tsx`
2. **You are done.** Because its URL is `/dashboard/manager/finances`, the middleware automatically intercepts anyone trying to visit it. If they aren't a Manager (or Admin), they are forbidden.

### Scenario B: Adding a completely new Custom Role Exception
If you invent a totally new role (e.g. `staff`) and a folder designated for them (`/dashboard/staff`), you simply add a tiny check to the bottom of `src/middleware.ts`:

```typescript
// Inside src/middleware.ts :
if (path.startsWith('/dashboard/staff') && role !== 'staff') {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

If you combine Next.js Middleware handling the front door, and Postgres RLS locking down the vault underneath, your application becomes mathematically impenetrable to normal hacking methods.

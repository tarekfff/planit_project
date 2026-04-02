# Planit 🚀

**Planit** is a premium, enterprise-grade appointment scheduling and establishment management platform. Built on cutting-edge server-side architectures, the platform flawlessly connects Service Establishments (managers and professionals) with their target clientele.

![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2015%20%7C%20Supabase%20%7C%20Tailwind%20%7C%20Shadcn-black?style=flat-square&logo=next.js)

---

## 🌟 Key Features

- **Enterprise Security Auth**: Secure dual-flow authentication featuring both 8-digit OTP Email Verification and seamless Google OAuth SSO integrations. Completely passwordless-capable.
- **Strict Role-Based Access Control (RBAC)**: A hierarchical access framework explicitly governed by Postgres Row-Level Security (RLS) policies enforcing complete isolation between `admin`, `manager`, `professional`, and `client` data.
- **Next.js 15 App Router**: Fully leverages Next.js Server Components, Server Actions for massive data mutations, and strict Middleware for route protection.
- **Premium Aesthetics**: Built utilizing Shadcn UI combinations layered with hyper-premium, animated glass-morphism techniques, curated typography (Inter), and structured input methodologies.

---

## 🏗️ Project Architecture

```plaintext
planit/frontend/
├── src/
│   ├── app/                        # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/                 # Public-facing auth boundaries
│   │   │   ├── login/page.tsx      # Login with Google/Email
│   │   │   ├── register/page.tsx   # OTP Signup with Google/Email
│   │   │   └── forgot-password/    # Secure OTP account recovery
│   │   │
│   │   ├── (dashboard)/            # Authenticated boundaries natively protected by Middleware
│   │   │   └── dashboard/page.tsx  # Central routing hub post-login
│   │   │
│   │   ├── api/auth/callback/      # Native OAuth token interceptor & session generator
│   │   ├── globals.css             # Tailwind base layers and CSS variables
│   │   └── layout.tsx              # Root HTML wrapper
│   │
│   ├── components/                 # React UI Architecture
│   │   ├── features/               # Business/Domain Components
│   │   │   └── auth/               # LoginForm, RegisterForm, ForgotPasswordForm
│   │   └── ui/                     # Isolated, reusable generic Shadcn primitives (Buttons, Cards, Inputs)
│   │
│   ├── modules/                    # State, Validation, and Server Interactions
│   │   ├── auth/                   # Core Security Operations
│   │   │   ├── actions.ts          # Backend Server Actions (verifyOtp, signInWithGoogle, etc.)
│   │   │   └── validators.ts       # Zod Schemas enforcing strict form data typing
│   │   └── appointments/           # Appointment domain logic
│   │
│   ├── lib/                        # Core Utilities
│   │   ├── constants/              # Global variables (e.g., ROUTES mapping)
│   │   ├── utils.ts                # Shadcn `cn` utility
│   │   └── supabase/               # Secure `@supabase/ssr` architecture wrappers
│   │       ├── client.ts           # Browser-safe client mapping
│   │       ├── server.ts           # Secure server-side query mapping
│   │       └── middleware.ts       # Specialized middleware engine constructor
│   │
│   ├── types/                      # Explicit TypeScript Definitions
│   │   └── database.types.ts       # Generated from PostgreSQL schemas dynamically
│   │
│   └── middleware.ts               # Security Bouncer: Native Next.js route protection
│
├── supabase/
│   └── migrations/                 # Postgres Structure and RLS policies (001_initial_schema.sql)
│
├── SECURITY_ROLES.md               # Explicit documentation on RLS, RBAC, and Middleware functions
├── next.config.mjs                 # Framework configuration
├── tailwind.config.ts              # Custom UI tokens, colors, and animations mapping
└── components.json                 # Shadcn internal configuration
```

---

## 🛠️ Tech Stack Core

1. **Framework:** Next.js 15 (React 19)
2. **Backend/Database:** Supabase (PostgreSQL)
3. **Styling/Animation:** TailwindCSS / Tailwind-Animate
4. **Component System:** Radix / Shadcn-UI 
5. **Validation Pipeline:** Zod
6. **Icons:** Lucide-React

---

## 🚀 Getting Started

### 1. Environment Preparation
Ensure your `.env.local` is properly configured matching the repository requirements:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 2. Startup Server
Run the Next.js development environment:
```bash
npm run dev
# or
pnpm dev
# or 
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application locally.

---

## 🔒 Security Flow & Role Documentation
For specific insights on how this repository natively locks down user access across `/dashboard` and specifically protects database queries utilizing custom RLS algorithms, please explicitly read the `SECURITY_ROLES.md` document mapping out the internal architecture.

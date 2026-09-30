# PromptTrace - Vercel Deployment & Environment Configuration Guide

This guide details all environment variables and step-by-step instructions to deploy **PromptTrace** on **Vercel** with full-stack support (Vite frontend + Serverless Express API + End-to-End Encryption + JazzCash/Card Payments).

---

## 📋 Required & Optional Environment Variables

Add these in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable Name | Required? | Example / Default Value | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables production optimizations and security headers. |
| `APP_URL` | **Yes** | `https://your-project.vercel.app` | Canonical production domain for CORS and callbacks. |
| `VITE_APP_URL` | **Yes** | `https://your-project.vercel.app` | Frontend copy of the public application URL. |
| `JAZZCASH_NUMBER` | **Yes** | `+923105905246` | Server-side recipient number for JazzCash payments. |
| `VITE_JAZZCASH_NUMBER` | **Yes** | `+923105905246` | Client-side recipient number shown on checkout & pricing cards. |
| `VITE_JAZZCASH_ACCOUNT_TITLE` | Optional | `Ali Mustafa (PromptTrace Official)` | Account holder title displayed to buyers during JazzCash checkout. |
| `ADMIN_EMAIL` | **Yes** | `alimustafaskp338@gmail.com` | Primary administrator email for payment approvals. |
| `VITE_ADMIN_EMAIL` | Optional | `alimustafaskp338@gmail.com` | Public admin contact email. |
| `ADMIN_SECRET_KEY` | **Yes** | *(Generate random 32+ char string)* | Master secret for signing admin session tokens and approval verification. |
| `E2EE_PEPPER_SECRET` | Optional | *(Generate random 32+ char string)* | Server-side cryptographic salt pepper for client E2EE vault derivations. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Required only if running AI audit reasoning or transcriptions. |
| `PROMPTTRACE_API_KEY` | Optional | `pt_live_9f8302ba1c4d92` | Default API key for developer SDK ingestion playground. |

---

## 🚀 Quick Deploy Instructions

### Option A: Deploy via GitHub / GitLab / Bitbucket (Recommended)
1. Push this repository to your Git provider (e.g. GitHub).
2. Go to [https://vercel.com/new](https://vercel.com/new) and import your repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `vite build` (or `npm run build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and paste the variables listed above.
5. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
# 1. Install Vercel CLI if not installed
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

---

## 🛠️ How Architecture Works on Vercel

1. **Static Frontend**:
   Vercel compiles the React/Tailwind application via `vite build` into the `dist/` directory and distributes it globally across the Vercel Edge CDN.

2. **Serverless API Routes (`/api/*`)**:
   `vercel.json` rewrites all requests matching `/api/(.*)` to `api/index.ts`, which boots your Express backend as a high-performance Vercel Serverless Function.

3. **Client-Side SPA Routing**:
   All non-API paths are routed to `/index.html`, ensuring clean client-side navigation.

4. **Security & E2EE**:
   All sensitive payloads (prompts, RAG passages, outputs) are encrypted in the browser with AES-GCM 256-bit before reaching the server. The cryptographic SHA-256 hash chain validates EU AI Act compliance (Articles 12 & 13) both client-side and server-side.

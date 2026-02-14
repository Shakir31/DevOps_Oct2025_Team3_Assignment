# DevOps_Oct2025_Team3_Assignment

**Live Demo:** https://devopsassignment.pages.dev  
**Backend API:** https://devopsassignment-xw1s.onrender.com

> **Note:** The server sleeps after inactivity on the free tier. Visit the API link to wake it up if needed.

---

## Overview

This is a full-stack DevSecOps authentication system with automated CI/CD pipelines, security scanning, and branch protection. The application demonstrates secure user authentication, file management, and role-based access control.

**Key Features:**
- User authentication with JWT tokens
- File upload/download with data isolation
- Admin dashboard for user management
- Automated security scanning (SAST, SCA, secret detection)
- CI/CD with GitHub Actions
- Email notifications for build status
- Docker containerization

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS + Radix UI
- React Router
- Supabase client
- Vitest + React Testing Library
- Playwright (E2E testing)

**Backend**
- Node.js + Express
- JWT authentication
- bcrypt password hashing
- Multer for file uploads
- PostgreSQL via Supabase
- Jest + Supertest for testing

**DevOps**
- GitHub Actions for CI/CD
- Docker
- Semgrep, npm audit, TruffleHog for security
- SMTP email notifications
- Cloudflare Pages (frontend hosting)
- Render (backend hosting)

---

## Team Roles

| Name | Role | Main Responsibilities |
|------|------|---------------------|
| Ethan | Scrum Master | CI/CD pipelines, security scans, branch protection, notifications, sprint management |
| Shakir | Developer | Backend APIs, authentication, file management, database design, unit tests, frontend auth pages, Docker setup |
| Yilin | Developer | Database schema, user dashboard, backend integration |
| Charlotte | QA | Deployment workflows, quality assurance, deployment validation |
| Lim Zhi | QA | Integration tests, security tests, vulnerability assessment |

**Individual Contributions:**

**Ethan:**
- Set up GitHub Actions workflows (build-client.yml, security-scan.yml)
- Configured email notifications via SMTP
- Implemented branch protection rules
- Managed sprints and backlog
- Integrated Semgrep and TruffleHog security scanning

**Shakir:**
- Built backend authentication system (register, login, logout)
- Implemented file management API (upload, download, delete)
- Created admin features (view/create/delete users)
- Designed database schema (users and files tables)
- Developed frontend auth pages (Login, Register, SimpleDashboard)
- Wrote 63 backend unit tests (83% controller coverage, 90% middleware coverage)
- Created backend Dockerfile
- Set up initial project structure

**Yilin:**
- Built user dashboard UI and functionality
- Integrated frontend with backend services

**Charlotte:**
- Configured deployment pipelines to Cloudflare Pages and Render
- Set up frontend testing infrastructure (Vitest, Playwright)
- Validated deployment processes
- Performed end-to-end deployment testing
- Ensured workflow reliability

**Lim Zhi:**
- Wrote integration tests for API workflows
- Implemented security tests (SQL injection, XSS prevention)
- Created acceptance test criteria
- Performed vulnerability assessments
- Validated security scan configurations

---

## Project Structure

```
DevOps_Oct2025_Team3_Assignment/
├── .github/workflows/
│   ├── build-client.yml          # Frontend build & security
│   └── security-scan.yml         # SAST, SCA, secret scanning
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Login, Register, Dashboard, Admin
│   │   ├── contexts/             # AuthContext
│   │   ├── tests/                # Unit tests (Vitest)
│   │   └── App.jsx
│   ├── e2e/                      # E2E tests (Playwright)
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── controllers/              # authController, adminController, fileController
│   ├── models/                   # authModel, adminModel, fileModel
│   ├── routes/                   # authRoutes, adminRoutes, fileRoutes
│   ├── middleware/               # authMiddleware (JWT + RBAC)
│   ├── tests/                    # Jest test suites
│   ├── uploads/                  # File storage
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
│
├── package.json                  # Root scripts (install:all, test, dev)
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- Git
- Docker (optional)

### Installation

Clone the repo:
```bash
git clone https://github.com/YOUR_ORG/DevOps_Oct2025_Team3_Assignment.git
cd DevOps_Oct2025_Team3_Assignment
```

**Quick Start (from root directory):**
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Run all tests
npm test

# Start both frontend and backend
npm run dev
```

**Or install individually:**
```bash
# Frontend
cd frontend
npm ci

# Backend
cd ../backend
npm ci
```

### Environment Setup

Create `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
PORT=3000
NODE_ENV=development
```

Create `frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

### Running Locally

Start backend:
```bash
cd backend
npm run dev
```

Start frontend (in another terminal):
```bash
cd frontend
npm run dev
```

Access the app at `http://localhost:5173`

---

## Docker

Build images:
```bash
# Backend
cd backend
docker build -t devsecops-backend .

# Frontend
cd frontend
docker build -t devsecops-frontend .
```

Run containers:
```bash
# Backend
docker run -p 3000:3000 --env-file backend/.env devsecops-backend

# Frontend
docker run -p 5173:5173 devsecops-frontend
```

---

## Testing

### Backend Tests

Run all tests:
```bash
cd backend
npm test
```

Watch mode:
```bash
npm run test:watch
```

Coverage report:
```bash
npm run test:coverage
```

**Backend Test Stats:**
- 63 tests across 6 test suites
- 83% controller coverage
- 90% middleware coverage
- 65%+ overall coverage

**Test Suites:**
- `authController.test.js` - Authentication endpoints
- `adminController.test.js` - Admin operations
- `fileController.test.js` - File management
- `authMiddleware.test.js` - JWT verification
- `integration.test.js` - End-to-end API flows
- `security.test.js` - SQL injection, XSS, access control

### Frontend Tests

Run unit tests:
```bash
cd frontend
npm test
```

Coverage report:
```bash
npm run test:coverage
```

Run E2E tests:
```bash
npm run test:e2e
```

**Frontend Test Stats:**
- 17 unit tests across 3 test suites
- Component tests: LoginPage, Header
- Context tests: AuthContext
- E2E tests: Authentication, Dashboard, Admin flows

### Run All Tests

From root directory:
```bash
npm test              # All unit tests
npm run test:e2e      # E2E tests only
npm run test:all      # Everything
```

**Total:** 80 tests (63 backend + 17 frontend)

---

## CI/CD Pipeline

### Workflows

**build-client.yml** (runs on PR to main)
1. Security checks - npm audit for vulnerabilities
2. Build - install deps and build frontend
3. Frontend unit tests with coverage
4. E2E tests with Playwright
5. Email notification with status

**security-scan.yml** (runs on PR and push to main)
1. SAST scanning with Semgrep
2. SCA scanning with npm audit (frontend + backend)
3. Secret scanning with TruffleHog
4. Dependency review
5. Email notification with results

### Branch Protection

The `main` branch requires:
- Pull request reviews
- Passing CI/CD checks (build-client + security-scan)
- Up-to-date branches
- No direct pushes allowed

### Email Notifications

Automated emails sent to stakeholders after each workflow run:
- Workflow status (PASS/FAIL)
- Job results summary
- GitHub Actions run link

Configured via GitHub Secrets:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `EMAIL_FROM`, `EMAIL_TO`

---

## Security

### Application Security

- JWT token authentication
- bcrypt password hashing
- Role-based access control (user vs admin)
- Input validation on all endpoints
- Data isolation (users only see their own files)
- Environment variable protection

### Pipeline Security

- SAST scanning (Semgrep) for code vulnerabilities
- SCA scanning (npm audit) for dependency CVEs
- Secret scanning (TruffleHog) for exposed credentials
- Security gates - deployment blocked if scans fail
- Branch protection enforcement

### Database Security

- Foreign key constraints with CASCADE delete
- Indexed columns for performance
- Separation of auth and profile data
- Row-level security via Supabase

---

## API Endpoints

### Authentication

| Route | Method | Description | Access |
|-------|--------|-------------|--------|
| `/api/auth/register` | POST | Register new user | Public |
| `/api/auth/login` | POST | Login user | Public |
| `/api/auth/logout` | POST | Logout user | Authenticated |
| `/api/auth/profile` | GET | Get user profile | Authenticated |

### File Management

| Route | Method | Description | Access |
|-------|--------|-------------|--------|
| `/api/files` | GET | Get user's files | Authenticated |
| `/api/files/upload` | POST | Upload file | Authenticated |
| `/api/files/download/:id` | GET | Download file | Authenticated (own files) |
| `/api/files/:id` | DELETE | Delete file | Authenticated (own files) |

### Admin

| Route | Method | Description | Access |
|-------|--------|-------------|--------|
| `/api/admin` | GET | Get all users | Admin only |
| `/api/admin/create_user` | POST | Create user | Admin only |
| `/api/admin/delete_user/:id` | POST | Delete user | Admin only |

---

## Sprints

### Sprint 1 (Jan 20 - Feb 4, 2026)

**Goal:** Deliver a working core application that allows users to securely log in, manage accounts, and handle their own files.

**Completed:**
- User authentication (register, login, logout)
- User dashboard with file management
- Admin dashboard with user management
- Database schema
- Frontend UI (login, register, dashboards)
- Backend API endpoints
- Initial deployment

### Sprint 2 (Feb 4 - Feb 15, 2026)

**Goal:** Improve security, testing, and CI/CD reliability to prepare the system for stable deployment and assessment.

**Completed:**
- 39 unit tests with 83% coverage
- Integration and security test suites
- CI/CD pipeline with GitHub Actions
- Security scanning (SAST, SCA, secrets)
- Branch protection and PR governance
- Email notification system
- Docker containerization
- Documentation

**Retrospective:**
- What went well: Clear role separation, effective collaboration, automated testing
- Challenges: Integration test complexity, Node.js version compatibility
- Improvements: Earlier security integration, more frequent testing

---

## Deployment

**Frontend:** Deployed to Cloudflare Pages  
**Backend:** Deployed to Render  
**Database:** Supabase (PostgreSQL)

Frontend auto-deploys on merge to `main`. Backend is configured for auto-deployment on Render.

---

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push: `git push origin feature/your-feature`
4. Create Pull Request on GitHub
5. Wait for CI/CD checks to pass
6. Get PR review approval
7. Merge to main

Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`

---

## GitHub Secrets Setup

Required secrets for CI/CD:

**Supabase:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

**Email Notifications:**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_TO`

Add these in: Repository Settings → Secrets and variables → Actions

---

## License

MIT License

DevOps_Oct2025_Team3_Assignment
Site
Server (The server will sleep after inactivity, so you will have to wake it up by visiting the API.)

DevSecOps Full-Stack Application

Overview
This repository contains a full-stack web application developed for a DevOps assignment, designed to demonstrate CI/CD automation, security enforcement, and governance using DevSecOps practices.

The system consists of:

A React (Vite) frontend

A Node.js (Express) backend

Automated CI/CD pipelines using GitHub Actions

Integrated security scanning and email-based stakeholder notifications

The project enforces pull-request–only changes to the protected main branch and blocks insecure or failing builds automatically.

Architecture Frontend
Framework: React (Vite)

Styling: Tailwind CSS + Radix UI

Routing: React Router

Authentication context managed via React Context API

Supabase client integration for authentication and data access

Testing: Vitest + React Testing Library + Playwright (E2E)

Backend

Runtime: Node.js

Framework: Express

Authentication: JWT

Password hashing: bcrypt

File handling: multer

Database & auth provider: Supabase

Testing: Jest + Supertest

Team & Technical Roles
Charlotte – Frontend and backend deployment, workflow setup

Shakir – Backend feature implementation and unit testing

Yilin – Database schema design and user dashboard development

Lim Zhi – QA Tester, responsible for integration testing, security testing, and validation

Ethan – CI/CD pipelines, DevSecOps security scans, branch protection, email notifications

Repository Structure / ├── frontend/ │ ├── src/ │ │ └── tests/ │ ├── e2e/ │ ├── public/ │ └── package.json ├── backend/ │ ├── app.js │ ├── tests/ │ └── package.json ├── package.json └── .github/workflows/

Local Development Setup Prerequisites

Node.js v18+

npm

Git

Quick Start (from root directory) npm run install:all npm test npm run dev

Frontend cd frontend npm ci npm run dev

Available scripts:

npm run build npm run preview npm run lint npm test npm run test:coverage npm run test:e2e

Backend cd backend npm ci npm run dev

Available scripts:

npm test npm run test:watch npm run test:coverage

Environment Configuration Backend .env SUPABASE_URL= SUPABASE_ANON_KEY= SUPABASE_SERVICE_ROLE_KEY= JWT_SECRET= PORT=3000 NODE_ENV=development
Frontend .env VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= VITE_API_URL=http://localhost:3000

Secrets are never committed and are injected securely in CI via GitHub Secrets.

Testing Strategy Backend Testing
63 tests across 6 test suites

Unit tests for authentication, admin, and file features

Integration tests to validate API behaviour

Security tests for SQL injection, XSS, unauthorized access

Tests executed automatically during CI

Coverage: 65%+ lines

Frontend Testing

17 unit tests across 3 test suites

Component tests: LoginPage, Header

Context tests: AuthContext

E2E tests for authentication, dashboard, admin flows

Tests executed automatically during CI

Run All Tests npm test npm run test:e2e npm run test:all

CI/CD Pipeline Design Branch Governance
main branch is protected

No direct pushes allowed

All changes must go through Pull Requests

PRs require:

CI success

Security scan success

Approval before merge

GitHub Actions Workflows build-client.yml

Trigger: Pull Request to main

Steps:

Dependency installation

Frontend vulnerability scan (npm audit)

Frontend build

Frontend unit tests with coverage

E2E tests (Playwright)

Final notification job (email)

security-scan.yml

Trigger:

Pull Request to main

Push/merge to main

Steps:

SAST scanning (Semgrep)

SCA scanning (frontend + backend)

Secret scanning (TruffleHog)

Security gate enforcement

Final notification job (email)

Automated Stakeholder Notifications
Email notifications sent using SMTP

Triggered on:

PR validation

Post-merge security scans

Single consolidated email per workflow run

Email includes:

PASS / FAIL status

Workflow name

Repository and branch

Job results summary

GitHub Actions run URL

Required GitHub Secrets SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS EMAIL_FROM EMAIL_TO

Security Controls
Dependency vulnerability scanning (SCA)

Static application security testing (SAST)

Secret scanning

Automated security gates

Role-based unauthorized access testing

CI-enforced merge blocking

Summary
This project demonstrates practical application of DevSecOps principles, including automated testing, security enforcement, protected branch governance, and continuous stakeholder feedback through CI/CD pipelines.

Test Results: 80 tests total (63 backend + 17 frontend) | Node.js 18+ required
# DevOps_Oct2025_Team3_Assignment

[Site](https://devopsassignment.pages.dev) \
[Server](https://devopsassignment-xw1s.onrender.com) (The server will sleep after inactivity, so you will have to wake it up by visiting the API.)


DevSecOps Full-Stack Application
1. Overview

This repository contains a full-stack web application developed for a DevOps assignment, designed to demonstrate CI/CD automation, security enforcement, and governance using DevSecOps practices.

The system consists of:

A React (Vite) frontend

A Node.js (Express) backend

Automated CI/CD pipelines using GitHub Actions

Integrated security scanning and email-based stakeholder notifications

The project enforces pull-request–only changes to the protected main branch and blocks insecure or failing builds automatically.

2. Architecture
Frontend

Framework: React (Vite)

Styling: Tailwind CSS + Radix UI

Routing: React Router

Authentication context managed via React Context API

Supabase client integration for authentication and data access

Backend

Runtime: Node.js

Framework: Express

Authentication: JWT

Password hashing: bcrypt

File handling: multer

Database & auth provider: Supabase

Testing: Jest + Supertest

3. Team & Technical Roles

Charlotte – Frontend and backend deployment, workflow setup

Shakir – Backend feature implementation and unit testing

Yilin – Database schema design and user dashboard development

Lim Zhi – QA Tester, responsible for integration testing, security testing, and validation

Ethan – CI/CD pipelines, DevSecOps security scans, branch protection, email notifications

4. Repository Structure
/
├── frontend/              # React (Vite) frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/               # Express backend
│   ├── app.js
│   └── package.json
└── .github/workflows/     # CI/CD pipelines

5. Local Development Setup
Prerequisites

Node.js v18+

npm

Git

Frontend
cd frontend
npm ci
npm run dev


Available scripts:

npm run build      # Production build
npm run preview    # Preview build output
npm run lint       # ESLint
npm test           # CI placeholder test

Backend
cd backend
npm ci
npm run dev


Available scripts:

npm test               # Run Jest tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

6. Environment Configuration
Backend .env
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=

Frontend .env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=


Secrets are never committed and are injected securely in CI via GitHub Secrets.

7. Testing Strategy
Backend Testing

Unit tests for authentication, admin, and file features

Integration tests to validate API behaviour

Tests executed automatically during CI

Frontend Testing

Placeholder test stage included to validate CI pipeline structure

Future expansion planned for UI and E2E testing

8. CI/CD Pipeline Design
Branch Governance

main branch is protected

No direct pushes allowed

All changes must go through Pull Requests

PRs require:

CI success

Security scan success

Approval before merge

GitHub Actions Workflows
build-client.yml

Trigger: Pull Request to main

Steps:

Dependency installation

Frontend vulnerability scan (npm audit)

Frontend build

Test placeholder

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

9. Automated Stakeholder Notifications

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

Required GitHub Secrets
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
EMAIL_FROM
EMAIL_TO

10. Security Controls

Dependency vulnerability scanning (SCA)

Static application security testing (SAST)

Secret scanning

Automated security gates

Role-based unauthorized access testing

CI-enforced merge blocking

11. Project Management

Agile Scrum methodology

Jira used for backlog, sprint planning, and tracking

Two sprints executed:

Sprint 1: Core functionality and deployment

Sprint 2: Security hardening, CI/CD automation, documentation

Sprint reviews and retrospectives conducted after each sprint

12. Sprint Goals

Sprint 1: Deliver core backend and frontend functionality and ensure the system runs end-to-end.
Sprint 2: Harden security, expand test coverage, strengthen CI/CD automation, and prepare submission-ready documentation.

13. Summary

This project demonstrates practical application of DevSecOps principles, including automated testing, security enforcement, protected branch governance, and continuous stakeholder feedback through CI/CD pipelines.

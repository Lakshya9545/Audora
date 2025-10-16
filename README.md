# Audora

Audora is an audio-first social platform: short audio posts, follows, likes, comments and in-app notifications.

This repository contains two main apps:

- `client/` — Next.js (App Router) frontend (React + TypeScript, Tailwind).
- `server/` — Express + Bun server with Prisma ORM and Cloudinary for media storage.

This README covers local setup, running the apps in development, database migrations, and troubleshooting notes specific to this repository.

## Table of contents

## Table of contents

- [Project overview](#project-overview)
- [Architecture and key folders](#architecture--important-folders)
- [Requirements](#requirements)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
  - [Start server](#3-run-the-server)
  - [Start client](#4-run-the-client)
- [Database (Prisma)](#database-and-prisma)
- [Running migrations](#running-migrations)
- [Production notes](#production--deployment-notes)
- [Troubleshooting](#troubleshooting)
- [DevOps, Deployment, and Monitoring 🚀](#devops-deployment-and-monitoring-)
  - [Infrastructure as Code (Terraform)](#1-infrastructure-as-code-terraform-️)
  - [Continuous Deployment (GitHub Actions)](#2-continuous-deployment-github-actions-)
  - [Code Quality & Security (SonarCloud)](#3-code-quality--security-sonarcloud-)
  - [Process Management (PM2)](#4-process-management-pm2)
- [Contributing](#contributing)
- [Contact / References](#contact--references)


## Project overview

Audora is designed as a single-page dashboard experience (Next.js App Router) with an API server that exposes REST endpoints under `/api/*`. The server uses Prisma to talk to a Postgres-compatible database and Cloudinary to host uploaded audio and images.


## Architecture / Important folders

- `client/` — Next.js app (app router). Key files:
  - `app/` — pages and dashboard UI components
  - `components/` — shared UI components (FollowButton, AudioPlayer, etc.)
  - `lib/` — shared utilities, axios instance

- `server/` — Express API server. Key files:
  - `index.ts` — server entrypoint
  - `routes/` — express route definitions (auth, users, posts, interactions, notifications)
  - `controllers/` — controller implementations for business logic
  - `prisma/` — generated Prisma client (do not edit)
  - `prisma/schema.prisma` — (typically) the DB schema. NOTE: in this workspace the schema file may live in `server/prisma/schema.prisma` depending on how you run Prisma.

- `infra/` — Terraform helpers and infra definitions (if present).


## Requirements

- Node.js / Bun: The server scripts use Bun in package.json (`bun run index.ts`, `bun --watch index.ts`). You can use Bun for fastest iteration, or run the server with Node after transpiling if you prefer.
- npm / yarn / pnpm — for client dependency management.
- A Postgres-compatible database for Prisma.
- Cloudinary account (for media uploads) — optional for local development if you stub uploads.


## Environment variables

Create a `.env` file in the `server/` directory (and a root `.env` if you prefer) with values similar to:

```
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/audora_dev
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Notes:
- `DATABASE_URL` should point to a Postgres instance. When running Prisma locally, this is used to run migrations.
- `PORT` is read by the server. The example server configuration allows requests from `http://localhost:3000` (the Next dev server).


## Local development

1) Install dependencies

- Server (using Bun):

```powershell
cd server
bun install
```

- Client (using npm/yarn/pnpm/bun):

```powershell
cd client
npm install
# or: bun install
```

2) Ensure your `.env` in `server/` is set, and your database is available.

3) Run the server

Using Bun (recommended per repo package.json):

```powershell
cd server
bun --watch index.ts
```

Or run without watcher:

```powershell
bun run index.ts
```

If you prefer Node + ts-node or compiling to JS, adapt the command accordingly.

4) Run the client

```powershell
cd client
npm run dev
# or: bun dev
```

Open the client in your browser at http://localhost:3000 and the API runs on the port you set in `.env` (default 5001 in examples).


## Database and Prisma

The server uses Prisma. The generated client is under `server/generated/prisma/` in this repo — do not edit generated files.

If you modify `schema.prisma` (usually located in `server/prisma/schema.prisma`), run migrations.

Create and run migrations (dev):

```powershell
cd server
# create a migration and apply locally
npx prisma migrate dev --name descriptive_migration_name

# or to deploy pending migrations (CI / production)
npm run prisma:migrate
```

Regenerate client if needed:

```powershell
cd server
npx prisma generate
```

Tip: If you edit enums in Prisma, run migrations and regenerate the client before importing typed enum values in TS. Otherwise you may get type errors.


## Notifications, follows, likes, comments

- The server creates Notification records for actions such as follows, likes and comments. Notification endpoints are under `/api/notifications`.
- The frontend maps server notification objects into a client-friendly shape before rendering; see `client/app/dashboard/Notifications.tsx` for details.


## Running tests / scripts

There aren't test scripts in package.json by default. For quick database inspection or small scripts, you can place Node/Bun scripts in `server/scripts/` and execute them with Bun or Node.


## Production / Deployment notes

- Build the Next.js client (`npm run build` in `client/`) and deploy to Vercel or a platform that supports Next.js.
- The API server can be run with Bun in production, or compiled and run under Node with a process manager (pm2, systemd). Ensure environment variables (DATABASE_URL, JWT_SECRET, Cloudinary creds) are set in production.
- Use a managed Postgres database and secure credentials.


## Troubleshooting

- Server logs incoming requests to the console; check `server/index.ts` for the request logger.
- If you edited Prisma enums and see TypeScript compile errors, regenerate the Prisma client (`npx prisma generate`) and recompile.
- If media uploads fail, ensure Cloudinary environment variables are set and reachable.





## Contact / References

If you need help reproducing a bug or running the app locally, include the server logs and a minimal reproduction (steps to login, create users, and which endpoints you called).

---

## DevOps, Deployment, and Monitoring 🚀
The Audora platform is deployed with a robust, multi-server DevOps toolchain designed for automation, quality assurance, and real-time observability.

### Overall Architecture
The environment consists of two primary EC2 instances on AWS:

- **Application & Monitoring Server (t2.medium | Ubuntu):** Hosts the Audora backend, SonarQube (via Docker), Prometheus, and Node Exporter.
- **Grafana Server (t3.micro | Ubuntu):** Hosts the Grafana visualization platform.

### 1. Infrastructure as Code (Terraform) 🏗️
The cloud infrastructure is provisioned and managed declaratively using Terraform, ensuring a repeatable and consistent setup.

**Location:** All configuration files (`.tf`) are located in the `infra/` directory.

**Managed Resources:** Terraform handles the creation of EC2 instances, security groups (firewall rules), and associated networking.

**Standard Workflow:** To deploy or update the infrastructure, run the following commands from the `infra/` directory:

Bash

```bash
# Initialize the Terraform workspace
terraform init

# Preview the changes
terraform plan

# Apply the changes to create/update infrastructure
terraform apply
```

PowerShell

```powershell
Set-Location infra

# Initialize the Terraform workspace
terraform init

# Preview the changes
terraform plan

# Apply the changes to create/update infrastructure
terraform apply
```

### 2. Continuous Inspection (SonarQube) 🕵️
Code quality is enforced through static analysis with SonarQube, which runs as a Docker container on the main application server for efficiency.

**Access the Dashboard:** http://<sonarqube-server-ip>:9000

**Login:** user: `admin`

**Analysis Execution:** To run a scan, clone the repository onto the SonarQube server and execute the SonarScanner CLI from the project's root directory.

Bash

```bash
# Example command to run a new scan
sonar-scanner \
  -Dsonar.projectKey=Audora \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://<sonarqube-server-ip>:9000 \
  -Dsonar.token=<your-generated-project-token>
```

PowerShell

```powershell
# Example command to run a new scan
sonar-scanner `
  -Dsonar.projectKey=Audora `
  -Dsonar.sources=. `
  -Dsonar.host.url=http://<sonarqube-server-ip>:9000 `
  -Dsonar.token=<your-generated-project-token>
```

### 3. Monitoring & Observability (Grafana + Prometheus) 📊
Real-time performance and health of the SonarQube/application server are monitored using Prometheus and visualized with Grafana.

**Architecture:**

- Node Exporter runs as a `systemd` service on the application server to expose hardware and OS metrics on port `9100`.
- Prometheus runs as a `systemd` service on the same server, scraping metrics from Node Exporter and storing them.
- Grafana runs on a dedicated server and queries Prometheus as its data source to build visualizations.

**Service Management:** The monitoring services run automatically. You can manage them with:

Bash

```bash
# Check the status of the services on the app server
sudo systemctl status prometheus
sudo systemctl status node_exporter
```

PowerShell (when using remote SSH session):

```powershell
# Run these on the app server via SSH
ssh ubuntu@<app-server-ip>
sudo systemctl status prometheus
sudo systemctl status node_exporter
```

**Access the Dashboards:**

- Prometheus UI (for debugging): http://<sonarqube-server-ip>:9090
- Grafana Live Dashboard: http://<grafana-server-ip>:3000

### 4. Process Management (PM2)
The Audora frontend and backend Node.js applications are managed by PM2. This ensures they run continuously in the background, are automatically restarted on failure, and are restored after a server reboot.

**Starting Applications:**

Bash

```bash
# Navigate to your backend directory and start
pm2 start npm --name "audora-backend" -- start

# Navigate to your frontend directory and start
pm2 start npm --name "audora-frontend" -- start
```

PowerShell (equivalent):

```powershell
# Navigate to your backend directory and start
pm2 start npm --name "audora-backend" -- start

# Navigate to your frontend directory and start
pm2 start npm --name "audora-frontend" -- start
```

**Ensuring Persistence:** To make sure all apps restart when the server boots up, run these two commands once:

Bash

```bash
# Generate the startup script
pm2 startup

# Save the current list of running processes
pm2 save
```

**Monitoring Processes:**

Bash

```bash
# List all running applications managed by PM2
pm2 list
```



# Audora

Audora is an audio-first social platform: short audio posts, follows, likes, comments and in-app notifications.

This repository contains two main apps:

- `client/` — Next.js (App Router) frontend (React + TypeScript, Tailwind).
- `server/` — Express + Bun server with Prisma ORM and Cloudinary for media storage.

This README covers local setup, running the apps in development, database migrations, and troubleshooting notes specific to this repository.

## Table of contents

- Project overview
- Architecture and key folders
- Requirements
- Environment variables
- Local development
  - Start server
  - Start client
- Database (Prisma)
- Running migrations
- Production notes
- Troubleshooting
- Contributing


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
This project is configured with a robust DevOps toolchain to automate deployment and ensure operational stability.

### 1. Infrastructure as Code (Terraform) 🏗️
The project's cloud infrastructure is managed declaratively using Terraform.

Configuration: All Terraform files are located in the `infra/` directory.

Resources: Manages the creation and configuration of AWS EC2 instances, security groups, and other necessary cloud resources.

Usage (bash):

```bash
cd infra
terraform init
terraform plan
terraform apply
```

PowerShell (Windows):

```powershell
Set-Location infra
terraform init
terraform plan
terraform apply
```

### 2. Continuous Inspection (SonarQube) 🕵️
Code quality and security are automatically inspected using SonarQube.

Setup: SonarQube runs as a Docker container on a dedicated EC2 instance.

Analysis: The SonarScanner CLI is used to analyze the codebase for bugs, vulnerabilities, and code smells.

To run a scan (bash):

```bash
# From the root of the project
sonar-scanner \
  -Dsonar.projectKey=audora \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://<your-sonarqube-ip>:9000 \
  -Dsonar.token=<your-sonarqube-token>
```

PowerShell (Windows):

```powershell
# From the root of the project
sonar-scanner `
  -Dsonar.projectKey=audora `
  -Dsonar.sources=. `
  -Dsonar.host.url=http://<your-sonarqube-ip>:9000 `
  -Dsonar.token=<your-sonarqube-token>
```

### 3. Monitoring & Observability (Grafana + Prometheus) 📊
The production server's health and performance are monitored in real-time.

Architecture:

Prometheus is installed on the application server, scraping metrics from Node Exporter.

Grafana runs on a separate instance, using Prometheus as a data source to build and display dashboards.

Dashboards:

- Prometheus UI: http://<your-app-server-ip>:9090
- Grafana Dashboard: http://<your-grafana-server-ip>:3000

### 4. Process Management (PM2)
The backend and frontend Node.js processes are managed by PM2 to ensure they run continuously and restart automatically on failure or server reboot.

Usage (bash / PowerShell):

```bash
# Start the backend
pm2 start npm --name "audora-backend" -- start

# Save the process list to automatically restart on reboot
pm2 save
```

PowerShell (equivalent):

```powershell
# Start the backend
pm2 start npm --name "audora-backend" -- start

# Save the process list to automatically restart on reboot
pm2 save
```


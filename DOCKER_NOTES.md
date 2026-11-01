# Docker Notes for AgroConnect

## Overview

Docker Compose runs AgroConnect as three services:

| Service | Purpose | Host access |
| --- | --- | --- |
| `frontend` | Builds the React/Vite app and serves it with Nginx | `http://localhost:8080` |
| `backend` | Runs the Express API | `http://localhost:5050` |
| `mongo` | Stores application data in MongoDB | Internal to the Compose network |

Compose gives the services a shared network. The backend reaches MongoDB at
`mongo:27017`, using the service name as the hostname. Nginx forwards frontend
requests under `/api/` to `backend:5050`, so the browser does not need to
connect to the backend container directly.

## Files and responsibilities

- `docker-compose.yml` defines the services, their build contexts, ports,
  environment variables, health checks, startup order, and database volume.
- `backend/Dockerfile` builds the Node.js API image. It installs production
  dependencies with `npm ci --omit=dev` and runs the app as the non-root `node`
  user.
- `frontend/Dockerfile` uses a multi-stage build: Node.js compiles the Vite
  frontend, then Nginx serves the generated static files.
- `frontend/nginx.conf` serves the single-page app and proxies `/api/` requests
  to the backend.
- `backend/.dockerignore` and `frontend/.dockerignore` keep local dependencies,
  build outputs, and other unnecessary files out of their respective build
  contexts.
- `.env.example` lists the root environment variables needed by Compose. It is
  a template, not a file to use unchanged in production.

## First-time setup

From the project root, copy `.env.example` to `.env`. For example, in
PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set your own strong values:

```dotenv
JWT_SECRET=use-a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-password
```

Keep `.env` private and do not commit it. Compose requires these values to be
set before it starts the backend.

## Common commands

Run the app and build images when needed:

```bash
docker compose up --build
```

Run it in the background:

```bash
docker compose up --build -d
```

View service status and logs:

```bash
docker compose ps
docker compose logs -f
docker compose logs -f backend
```

Stop and remove the containers and network:

```bash
docker compose down
```

Stop the app and also permanently remove the MongoDB data volume:

```bash
docker compose down --volumes
```

Use the last command only when you intend to delete the database data.

## Persistence and health checks

MongoDB stores its data in the named `mongo_data` volume mounted at
`/data/db`. The volume remains after `docker compose down` and is reused when
the app starts again. Removing containers does not normally delete this data.

Compose checks MongoDB with `mongosh` and waits for it to be healthy before
starting the backend. It then waits for the backend health check before
starting the frontend. The backend health check requests its root endpoint.

## Configuration details

- Frontend: host port `8080` maps to Nginx port `80`.
- Backend: host port `5050` maps to API port `5050`.
- MongoDB: port `27017` is available to other Compose services but is not
  published on the host by this Compose configuration.
- The frontend is built with `VITE_API_URL=/api`; Nginx proxies that path to
  the backend.
- Compose sets the backend MongoDB URL to
  `mongodb://mongo:27017/agroconnect`, so the Docker setup uses its MongoDB
  service rather than a local or hosted database.

## Troubleshooting

- **Missing environment variable:** Check that `.env` exists in the project
  root and contains non-empty `JWT_SECRET`, `ADMIN_EMAIL`, and
  `ADMIN_PASSWORD` values.
- **Changes are not visible:** Rebuild the relevant image with
  `docker compose up --build`.
- **Service startup or database issue:** Inspect `docker compose ps` and
  `docker compose logs -f mongo backend frontend`.
- **Port already in use:** Stop the other process using host port `8080` or
  `5050`, or change the host side of the corresponding port mapping in
  `docker-compose.yml`.
- **Reset local database:** Run `docker compose down --volumes` and then start
  again. This permanently deletes the MongoDB volume contents.

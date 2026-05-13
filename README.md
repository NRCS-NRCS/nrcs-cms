# NRCS CMS — Content Management System

A React application for managing content on the [Nepal Red Cross Society](https://nrcs.org) website.

---

## Development

### Prerequisites

Before you start, create a `.env.local` file:

```bash
touch .env.local
```

Set the following environment variables:

```env
PORT=3056
APP_GRAPHQL_ENDPOINT=<api-endpoint>
APP_GRAPHQL_CODEGEN_ENDPOINT=<graphql-api-endpoint>
APP_TITLE=<app-title>
APP_ENVIRONMENT="app-env"
```

---

## Local Development (Using Docker, with Backend)

We use a `docker-compose.yml` file located at `./backend/docker-compose.yml`.

To run it, add the following to your `.env.local`:

```env
# Include the backend services
COMPOSE_FILE=./backend/docker-compose.yaml:docker-compose.yml
# Use the same .env file for both backend and web-app
BACKEND_ENV_FILE=../.env
```

Then start the full stack:

```bash
docker compose up
```

> **Note:** `../` refers to the CMS app folder, relative to `./backend/docker-compose.yml`
> (the main Docker Compose file).

---
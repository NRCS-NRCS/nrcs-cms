FROM node:22-bookworm AS dev

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
    git bash g++ make \
    && rm -rf /var/lib/apt/lists/*

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN --mount=type=bind,source=package.json,target=package.json \
    corepack install && corepack enable

WORKDIR /code
RUN git config --global --add safe.directory /code


# -------------------------- Builder --------------------------------

FROM dev AS builder

COPY package.json pnpm-lock.yaml /code/

RUN corepack prepare --activate

RUN pnpm install --frozen-lockfile

COPY . /code/

FROM builder AS web-app-build


# # Build variables (Requires backend pulled)
ENV APP_TITLE=APP_TITLE_PLACEHOLDER
ENV APP_GRAPHQL_ENDPOINT=http://localhost:8000
ENV APP_GRAPHQL_CODEGEN_ENDPOINT=./backend/schema.graphql

RUN pnpm generate:type && WEB_APP_SERVE_ENABLED=true pnpm build

# ---------------------------------------------------------------------------
FROM ghcr.io/toggle-corp/web-app-serve:v0.1.2 AS web-app-serve

LABEL maintainer="Togglecorp Dev"
LABEL org.opencontainers.image.source="https://github.com/ToogleCorp/nrcs-cms"

# NOTE: Used by apply-config.sh
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=web-app-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"

RUN echo '{ "files": { "maxSize": 2097152 }, "formatter": { "enabled": true, "formatWithErrors": true, "includes": ["**/*.js", "**/*.html"] } }' > biome.json
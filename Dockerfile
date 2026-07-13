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


# Build variables (Requires backend pulled).
# NOTE: With WEB_APP_SERVE_ENABLED=true these values are NOT baked into the
# bundle — overrideDefineForWebAppServe replaces each with a
# `WEB_APP_SERVE_PLACEHOLDER__<KEY>` token that is substituted at container
# start from the runtime APP_* env vars (see web-app-serve/.env). They only need
# to be present and valid so build-time env validation (env.ts) passes; the URL
# must therefore stay a valid URL.
ENV APP_TITLE=APP_TITLE_PLACEHOLDER
ENV APP_ENVIRONMENT=APP_ENVIRONMENT_PLACEHOLDER
ENV APP_GRAPHQL_ENDPOINT=http://localhost:8000
ENV APP_GRAPHQL_CODEGEN_ENDPOINT=./backend/schema.graphql

RUN pnpm generate:type && WEB_APP_SERVE_ENABLED=true pnpm build

# ---------------------------------------------------------------------------
FROM ghcr.io/toggle-corp/web-app-serve:v0.1.2 AS web-app-serve

LABEL maintainer="Togglecorp Dev"
LABEL org.opencontainers.image.source="https://github.com/NRCS-NRCS/nrcs-cms"

# NOTE: Used by apply-config.sh
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=web-app-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"

# When APPLY_CONFIG__ENABLE_DEBUG=true, apply-config.sh pre-formats the build
# output with `biome format`. Biome's parser can't parse some minified vendor
# chunks (e.g. the MarkdownEditor chunk) and, because apply-config.sh runs under
# `set -e`, that non-zero exit aborts container start. This nested config
# (root:false, since biome treats the entrypoint cwd `/` as the implicit root)
# skips the unparseable chunk so the debug step succeeds. Lives at /code (above
# build/) so it is not served publicly.
COPY web-app-serve/biome.debug.json /code/biome.json
# Agent Guide: Dev Server Workflow

This project runs the Astro dev server inside Docker. Use the container as the source of truth for install, run, and logs.

## 1) Core Setup

- Compose service: `astro`
- Container name: `zorakle-wp-update-astro-1`
- App path in container: `/app/site`
- Dev URL: `http://localhost:4321/wordpress-rebuild/`

## 2) Start and Stop

From repository root:

```bash
docker compose up -d
docker compose down
```

## 3) Check Status and Logs

```bash
docker ps | grep zorakle-wp-update-astro-1
docker logs -f zorakle-wp-update-astro-1
```

If you only need recent logs:

```bash
docker logs zorakle-wp-update-astro-1 | tail -50
```

## 4) Run Commands Inside the Container

This project is **npm-based** (do not use yarn or introduce a `yarn.lock`). Use `docker exec` for all app-level commands.

```bash
docker exec -it -w /app/site zorakle-wp-update-astro-1 sh
```

Examples without opening a shell:

```bash
docker exec -w /app/site zorakle-wp-update-astro-1 npm run dev
docker exec -w /app/site zorakle-wp-update-astro-1 npm run build
docker exec -w /app/site zorakle-wp-update-astro-1 npx astro check
```

## 5) Dependency Management (Lockfile Model)

There are exactly **two lockfiles** — never more:

- **Root `package-lock.json`** — the single lockfile for the Astro site. The repo root is an npm workspace (`workspaces: ["site"]`); `site/` must **not** have its own `package-lock.json`. CI runs `npm ci` from the root, and the Dockerfile installs from this lockfile too.
- **`studio-zorakle-blog/package-lock.json`** — the standalone Sanity Studio deployable (not part of the workspace).

Notes:
- `vite` is pinned as a direct devDependency in `site/package.json` (Astro requires vite 7; npm ignores root `overrides` for workspace children, so don't use `overrides`).

### Adding or updating site dependencies

1. Edit `site/package.json` (add/remove/bump the dependency).
2. Regenerate the root lockfile **using the same npm as the Docker image** (npm 11+ on the host omits other platforms' native binaries, which breaks `npm ci` in CI/Docker — npm 10 in `node:22` records all platforms):

```bash
docker run --rm \
  -v "$PWD/package.json:/w/package.json" \
  -v "$PWD/site/package.json:/w/site/package.json" \
  -v "$PWD:/out" -w /w node:22 \
  sh -c "npm install --package-lock-only --legacy-peer-deps && cp package-lock.json /out/"
```

3. Sanity-check on the host: `npm ci --dry-run` from the repo root must pass.
4. Do the full rebuild in section 7.
5. Commit `package.json`, `site/package.json`, and the root `package-lock.json` together.

### Studio dependencies

The studio folder is bind-mounted, so install inside the container and its lockfile syncs back automatically:

```bash
docker exec -w /app/studio-zorakle-blog zorakle-wp-update-astro-1 npm install --legacy-peer-deps <package>
```

## 6) File Editing Workflow

- Edit source locally in `site/`.
- Bind mount syncs files into container.
- Astro dev server auto-reloads on changes.
- Validate runtime changes from container logs.

## 7) Rebuild When Dependencies or Dockerfile Change

Required after any change to `package.json`, `package-lock.json`, or the `Dockerfile`:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 8) Troubleshooting

### Missing native module errors (rollup / rolldown / lightningcss / sharp)

Symptoms include messages like:

- `Cannot find module @rollup/rollup-linux-arm64-gnu`
- `Cannot find module @rolldown/binding-linux-arm64-gnu`
- `Cannot find module '../lightningcss.linux-arm64.node'`
- `MissingSharp: Could not find Sharp`

Cause: the root `package-lock.json` was regenerated with an npm version that only records the current platform's native binaries (e.g. npm 11 on macOS). Regenerate it with `node:22` as described in section 5, then use the full rebuild flow:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
docker logs -f zorakle-wp-update-astro-1
```

### Container exits immediately

- Check logs first.
- Verify `Dockerfile` and `docker-compose.yml` were not changed incorrectly.
- Confirm the `volumes` mapping keeps container `node_modules` intact.

## 9) Current Compose Notes

The working compose volume pattern is:

```yaml
volumes:
  - ./site:/app/site
  - /app/site/node_modules
```

This prevents host bind mounts from clobbering container-installed dependencies.

## 10) Quick Daily Commands

```bash
# Start dev server
docker compose up -d

# Watch logs
docker logs -f zorakle-wp-update-astro-1

# Stop
docker compose down
```
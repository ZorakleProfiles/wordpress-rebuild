# Agent Guide: Dev Server Workflow

This project uses Bun and runs the Astro development server in Docker. Use the
container as the source of truth for installs, runtime commands, and logs.

## 1) Core Setup

- Compose service: `astro`
- Container name: `zorakle-wp-update-astro-1`
- App path in container: `/app/site`
- Dev URL: `http://localhost:4321/wordpress-rebuild/`

## 2) Start and Stop

From the repository root:

```bash
docker compose up -d
docker compose down
```

## 3) Check Status and Logs

```bash
docker ps | grep zorakle-wp-update-astro-1
docker logs -f zorakle-wp-update-astro-1
```

For recent logs only:

```bash
docker logs zorakle-wp-update-astro-1 | tail -50
```

## 4) Run Commands Inside the Container

This project is Bun-based. Do not introduce npm, pnpm, or Yarn lockfiles.

```bash
docker exec -it -w /app/site zorakle-wp-update-astro-1 sh
```

Examples without opening a shell:

```bash
docker exec -w /app/site zorakle-wp-update-astro-1 bun run dev
docker exec -w /app/site zorakle-wp-update-astro-1 bun run build
docker exec -w /app/site zorakle-wp-update-astro-1 bunx astro check
```

## 5) Dependency Management

The root `bun.lock` is the single lockfile for the Astro site. The repository
root is a Bun workspace (`workspaces: ["site"]`), so `site/` must not have its
own lockfile.

To add or update a site dependency:

1. Run `bun add <package>` from `site/`, or edit `site/package.json`.
2. Run `bun install` from the repository root to update `bun.lock`.
3. Verify the locked install with `bun install --frozen-lockfile`.
4. Rebuild the container as described below.
5. Commit `package.json`, `site/package.json`, and `bun.lock` together when changed.

## 6) File Editing Workflow

- Edit source locally in `site/`.
- The bind mount syncs files into the container.
- Astro reloads automatically.
- Validate runtime changes in the container logs.

## 7) Rebuild After Dependency Changes

After changing `package.json`, `site/package.json`, `bun.lock`, or the Dockerfile:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 8) Troubleshooting

If a native module is missing, regenerate the lockfile with the pinned Bun
version and perform the full rebuild above. If the container exits immediately,
check its logs first and confirm the `site/` bind mount is intact.

## 9) Quick Daily Commands

```bash
# Start dev server
docker compose up -d

# Watch logs
docker logs -f zorakle-wp-update-astro-1

# Stop
docker compose down
```

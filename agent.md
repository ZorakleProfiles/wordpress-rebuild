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

Use `docker exec` for all app-level commands.

```bash
docker exec -it -w /app/site zorakle-wp-update-astro-1 sh
```

Examples without opening a shell:

```bash
docker exec -w /app/site zorakle-wp-update-astro-1 yarn dev
docker exec -w /app/site zorakle-wp-update-astro-1 yarn build
docker exec -w /app/site zorakle-wp-update-astro-1 yarn astro check
```

## 5) File Editing Workflow

- Edit source locally in `site/`.
- Bind mount syncs files into container.
- Astro dev server auto-reloads on changes.
- Validate runtime changes from container logs.

## 6) Rebuild When Dependencies or Dockerfile Change

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 7) Troubleshooting

### Missing rollup/rolldown native module errors

Symptoms include messages like:

- `Cannot find module @rollup/rollup-linux-arm64-gnu`
- `Cannot find module @rolldown/binding-linux-arm64-gnu`

Use the full rebuild flow:

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

## 8) Current Compose Notes

The working compose volume pattern is:

```yaml
volumes:
  - ./site:/app/site
  - /app/site/node_modules
```

This prevents host bind mounts from clobbering container-installed dependencies.

## 9) Quick Daily Commands

```bash
# Start dev server
docker compose up -d

# Watch logs
docker logs -f zorakle-wp-update-astro-1

# Stop
docker compose down
```
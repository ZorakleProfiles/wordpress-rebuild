FROM oven/bun:1.2.22-alpine

WORKDIR /app

# Install the Astro site through the root Bun workspace.
COPY package.json bun.lock ./
COPY site/package.json ./site/
RUN bun install --frozen-lockfile

WORKDIR /app/site

EXPOSE 4321

CMD ["bun", "run", "dev"]

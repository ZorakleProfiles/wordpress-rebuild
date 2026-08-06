FROM node:22

WORKDIR /app

# ── Astro site ────────────────────────────────────────────────────────────────
COPY site/package*.json ./site/
WORKDIR /app/site
RUN npm install --legacy-peer-deps && \
    npm install --save-dev @rollup/rollup-linux-arm64-gnu @rolldown/binding-linux-arm64-gnu 2>/dev/null || true

# ── Sanity Studio ─────────────────────────────────────────────────────────────
COPY studio-zorakle-blog/package*.json /app/studio-zorakle-blog/
WORKDIR /app/studio-zorakle-blog
RUN npm install --legacy-peer-deps

# ── Back to site for CMD ──────────────────────────────────────────────────────
WORKDIR /app/site

EXPOSE 4321

CMD ["npm", "run", "dev"]

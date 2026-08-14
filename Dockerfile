FROM node:22

WORKDIR /app

# ── Astro site (installed via root npm workspace) ───────────────────────────
COPY package.json package-lock.json ./
COPY site/package.json ./site/
RUN npm ci --legacy-peer-deps

# ── Back to site for CMD ──────────────────────────────────────────────────────
WORKDIR /app/site

EXPOSE 4321

CMD ["npm", "run", "dev"]

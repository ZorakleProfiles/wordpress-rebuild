FROM node:22

WORKDIR /app/site

# Install dependencies using Yarn, then explicitly install missing optional bindings
COPY site/package*.json ./
RUN rm -rf node_modules package-lock.json && yarn install && \
    yarn add --dev @rollup/rollup-linux-arm64-gnu @rolldown/binding-linux-arm64-gnu 2>/dev/null || true

# Copy the rest of the site
COPY site .

EXPOSE 4321

CMD ["yarn", "dev"]

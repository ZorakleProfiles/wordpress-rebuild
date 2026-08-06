FROM node:22

WORKDIR /app/site

# Copy only package files first
COPY site/package*.json ./

# Copy the rest of the site (source code)
COPY site .

# Install dependencies using npm install
# Do this LAST so node_modules is in the final image layer
RUN npm install --legacy-peer-deps && \
    npm install --save-dev @rollup/rollup-linux-arm64-gnu @rolldown/binding-linux-arm64-gnu 2>/dev/null || true

EXPOSE 4321

CMD ["npm", "run", "dev"]
CMD ["npm", "run", "dev"]

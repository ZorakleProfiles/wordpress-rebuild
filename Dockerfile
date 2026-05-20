FROM node:22-alpine

WORKDIR /app

# Install dependencies first (cached)
COPY site/package*.json ./
RUN npm install

# Copy the rest of the site
COPY site .

EXPOSE 4321

CMD ["npm", "run", "dev", "--", "--host"]

# Discrete portfolio container
FROM node:22-alpine

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci --quiet --no-progress --prefer-offline

# Copy source
COPY . .

# Health check (silent)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Run dev server
CMD ["npm", "run", "dev"]

# Development Dockerfile for brianhsu-portfolio
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose dev server port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

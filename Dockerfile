# Stage 1: Build the React Application
FROM node:18-slim AS build
WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build the static assets (creates dist folder)
RUN npm run build

# Stage 2: Setup the Production Environment
FROM node:18-slim
WORKDIR /app

# Install build tools needed for SQLite native bindings
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies with production flag
# This ensures SQLite binary matches container architecture
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ .

# Copy built React frontend from Stage 1
COPY --from=build /app/dist ./public

# Create directory for SQLite database
RUN mkdir -p /app/data

# Set environment variable for database location
ENV DATABASE_PATH=/app/data/codacol.sqlite

# Expose only the backend port (serves both API and frontend)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
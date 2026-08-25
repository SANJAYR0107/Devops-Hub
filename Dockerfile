# DevOpsHub Dockerfile
FROM node:20

WORKDIR /app

# Install Docker CLI so the backend can run docker commands
RUN apt-get update && apt-get install -y docker.io

# Setup backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production
COPY backend/ ./backend/

# Setup frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Expose backend port
EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "src/server.js"]

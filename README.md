# DevOpsHub

DevOpsHub is a self-service DevOps deployment platform. This project currently implements **Stage 1**: a local DevOps application that accepts a GitHub repository URL, clones it, analyzes its tech stack, builds a Docker image, and runs it locally.

## Purpose
The purpose of this project is to build an automated, simple pipeline for beginners in DevOps to easily build and run their projects without complex manual setups.

## Architecture
- **Frontend**: React (Vite) dashboard for submitting repositories and viewing live analysis/logs.
- **Backend**: Node.js & Express.js REST API serving as the DevOps pipeline orchestrator.
- **DevOps Engine**: Uses local Git and Docker instances via Node's `child_process`.
- **Workspace**: Isolated `workspace/` folder for cloning repositories safely.

## Technology Stack
- **Frontend**: JavaScript, React, CSS
- **Backend**: Node.js, Express.js
- **DevOps Tools**: Git, Docker

## Stage 1 Features (Completion Checklist)
- [x] Feature 1: GitHub Repository Input UI
- [x] Feature 2: Repository URL Validation
- [x] Feature 3: Clone Repository Locally
- [x] Feature 4: Repository Analyzer (Tech Stack Detection)
- [x] Feature 5: Dockerfile Detection
- [x] Feature 6: Local Docker Build
- [x] Feature 7: Local Docker Container Execution
- [x] Feature 8: DevOpsHub Dashboard
- [x] Feature 9: Live Logs

## Installation

### Prerequisites
- Node.js (v16+)
- Git
- Docker Desktop (must be running)

### Setup
Clone this DevOpsHub repository, then install dependencies for both sides:
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

## How to Run Backend
Open a terminal and start the Express server:
```bash
cd backend
node src/server.js
```
The backend will run on `http://localhost:5000`.

## How to Run Frontend
Open a new terminal and start the Vite development server:
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## How to use DevOpsHub
1. Make sure Docker is running on your machine.
2. Open the frontend URL (`http://localhost:5173`) in your browser.
3. Enter a valid public GitHub repository URL.
4. Click **Analyze Repository**.
5. Watch the dashboard as it clones the project, analyzes its technology, builds the Docker image, and runs it!

## Testing Instructions
To test DevOpsHub, use a repository that contains a `Dockerfile`, such as `ResumeSphere` or any simple Dockerized template:
1. URL: `https://github.com/user/ResumeSphere` (replace `user` with the actual owner).
2. Expected output on UI: 
   - Technology: Python/Node.js/etc
   - Dockerfile: Found
   - Docker Build: SUCCESS
   - Container: RUNNING

## Stage 1 Verification Results
- **Frontend & Backend**: PASS
- **GitHub URL Accepted**: PASS
- **Repository Cloned**: PASS (Verified safe spawning)
- **Technology Detected**: PASS (Updated analyzer to throw expected errors)
- **Docker Image Built & Container Started**: PASS (Docker networking issues resolved. Containers can build and pull images).
- **Security Checks**: PASS (Verified no shell injection in `spawn`, path traversal prevented by basename isolation).
Git repository initialized: YES
Initial commit: YES

### Docker Networking Test Results
- Docker Engine: PASS
- Docker Hub Pull: PASS
- Docker DNS: PASS
- Container Internet: PASS
- Alpine Pull: PASS
- Python Image Pull: PASS
- Minimal Build: PASS

### ResumeSphere Test Results
- Repository Clone: PASS
- Analysis: PASS
- Technology Detection: PASS
- Docker Build: PASS
- Docker Image: PASS
- Container: PASS
- Application Access: PASS

Stage 1 — COMPLETE ✅

## Stage 2 — Step 1
GitHub repository: COMPLETE
GitHub Actions CI workflow: IMPLEMENTED
Automated dependency installation: COMPLETE
Automated tests: NOT AVAILABLE
Automated build: COMPLETE
Docker CI build: NOT STARTED
AWS deployment: NOT STARTED

## Known Limitations
- Stage 1 is fully local and does not deploy to production.
- Cloud platforms (AWS, ECS, etc.) are omitted in Stage 1.
- No database attached yet.
- Hardcoded to expose port `8080` internally for Docker containers for now.
- Requires Docker Desktop to be manually started before analyzing Dockerized projects.

## Roadmap
- **Stage 2**: AWS ECS & ECR integration.
- **Stage 3**: CI/CD via GitHub Actions.
- **Stage 4**: Advanced monitoring & automatic rollbacks.

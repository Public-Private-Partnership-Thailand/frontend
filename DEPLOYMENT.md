# Deployment Guide

## Overview
This PPP project is now configured as a **dynamic Next.js application** that connects to a backend API. It requires a Node.js server to run.

## Architecture
- **Frontend**: Next.js application with dynamic routing
- **Backend API**: FastAPI server (see `backend/` directory)
- **Database**: PostgreSQL (configured via `DATABASE_URL`)
- **Data Source**: Backend API at `http://localhost:8000/api/datasets` (configurable via `NEXT_PUBLIC_API_URL`)

## Prerequisites
1. Node.js 18+ installed
2. Python 3.12+ installed (for backend)
3. PostgreSQL database (for backend)
4. Backend API running (see `backend/README.md`)

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)
1. **Connect your repository** to Vercel
2. **Set environment variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://api.example.com`)
3. **Deploy automatically** - Vercel will detect Next.js and build it
4. **Custom domain** (optional)

### Option 2: Railway / Render (Full Stack)
1. **Deploy Backend**:
   - Connect backend directory
   - Set `DATABASE_URL` environment variable
   - Deploy Python application

2. **Deploy Frontend**:
   - Connect frontend directory
   - Set `NEXT_PUBLIC_API_URL` to backend URL
   - Deploy Node.js application

### Option 3: Docker Compose (Self-hosted)
1. **Build and run**:
   ```bash
   docker-compose up -d
   ```

2. **Access**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

## Build Process

### Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL="postgresql://user:password@localhost/database"

# Run development server
fastapi dev oc4ids_datastore_api/main.py
```

## Development

### Start Frontend (Development)
```bash
npm run dev
# Frontend will run on http://localhost:3000
```

### Start Backend (Development)
```bash
cd backend
export DATABASE_URL="postgresql://user:password@localhost/database"
fastapi dev oc4ids_datastore_api/main.py
# Backend will run on http://localhost:8000
```

## Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000`)

### Backend
- `DATABASE_URL`: PostgreSQL connection string

## Key Features
- **Dynamic Routing**: Supports real-time project creation and editing
- **Backend API**: Full CRUD operations via REST API
- **Database Integration**: PostgreSQL with JSONB fields
- **Client-side Routing**: Uses Next.js router
- **Responsive Design**: Works on all devices
- **Thai Language Support**: Full Thai language interface

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check that all dependencies are installed
2. **API Connection Errors**: Verify backend is running and `NEXT_PUBLIC_API_URL` is correct
3. **Database Connection**: Verify `DATABASE_URL` is set correctly
4. **CORS Errors**: Ensure backend CORS middleware is configured correctly

### API Endpoints:
- `GET /api/datasets`: Get all projects
- `GET /api/datasets/{id}`: Get single project
- `POST /api/datasets`: Create new project
- `PUT /api/datasets/{id}`: Update project
- `DELETE /api/datasets/{id}`: Delete project

# Codacol Notes

Codacol Notes is a full-stack note-taking application. It allows users to manage personal and shared notes, organize them by types and tags, and generate structured notes from text using Google Gemini AI. The app is containerized with Docker for easy setup and secure handling of API keys.

## Tech Stack

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **Database:** SQLite  
- **AI Integration:** Google Gemini API  
- **Containerization:** Docker + Docker Compose  

## Features

- User authentication (signup/login)  
- Create, edit, delete, and view personal or shared notes  
- Organize notes by types, tags, and colors  
- Generate structured notes from natural language input using AI  
- Secure API key usage on the backend  
- Single-port setup, serving both frontend and backend  

## Setup

1. Clone the repository:

```bash
git clone <repo-url>
cd <project-folder>
```

    Create a .env file in the backend folder with:

GEMINI_API_KEY=your_gemini_api_key
DATABASE_PATH=/app/data/codacol.sqlite
WEB_APP_URL=http://localhost:5000

    Build and run the Docker containers:

docker compose up --build

    Access the app:

    Frontend & Backend API: http://localhost:5000

    Health check: http://localhost:5000/health
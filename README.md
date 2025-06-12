## Video Demo

[![NCBI PROJECT DEMO](https://img.youtube.com/vi/ZvgM-cp3wpU/0.jpg)](https://www.youtube.com/watch?v=ZvgM-cp3wpU)

---

## 🐳 Docker Setup

### 🔧 Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### 📦 Folder Structure

```bash
ncbi_project/
├── ncbi_backend/ # Django backend
│ ├── manage.py
│ ├── requirements.txt
│ └── ...
├── ncbi_frontend/ncbi_frontend # React + Vite
│ ├── Dockerfile
│ └── ...
└── docker-compose.yml
```

### ▶️ Run the App

```bash
# start both frontend and backend
docker-compose up --build
```

Visit:

- Frontend: [http://localhost:5173](http://localhost:5173)

- Backend API: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/efetch/?ids=34512345)

## 🧼 Shut it down

```bash
docker-compose down
```

## Manual Setup

## 🛠️ Backend (`ncbi_backend`) — Django

```markdown
# NCBI Search Viewer Backend

This is the backend for the NCBI Search Viewer, built with [Django](https://www.djangoproject.com/).

## Features

- REST API endpoints for searching and fetching PubMed articles
- Handles NCBI API requests and response caching
- Designed to work seamlessly with the React frontend
```

## Getting Started

### Prerequisites

- [Python v3.11.9](https://www.python.org/)
- [pip v24.0](https://pip.pypa.io/en/stable/)
- (Recommended) [virtualenv](https://virtualenv.pypa.io/)

### Installation

```bash
cd ncbi_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### ▶️ Run the Server

```bash
python manage.py migrate
python manage.py runserver
# Leave the terminal open. Move on to the frontend portion.
```

The API will be available at [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/efetch/?ids=34512345).

### Project Structure

- `manage.py` — Django management script
- `ncbi_backend/` — Django project settings and URLs
- `ncbi_api/` — Main Django app for NCBI endpoints

### Environment Variables

- Configure settings like allowed hosts, database, and API keys in `ncbi_backend/settings.py`.

### API Endpoints

- `/api/esearch-summary-history/` — Search PubMed articles
- `/api/efetch/` — Fetch article details

---

# NCBI Search Viewer Frontend

This is the frontend for the NCBI Search Viewer, built with [React](https://react.dev/) and [Vite](https://vitejs.dev/).

## Features

- Search PubMed articles via the NCBI API
- Paginated results with persistent state
- Article details modal with external PubMed links
- Responsive, modern UI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (>= v20.17.0 (recommended))
- [npm](https://www.npmjs.com/) (>= v10.8.3 (recommended))

### Installation

```bash
# Open new terminal
cd ncbi_frontend/ncbi_frontend # ⚠️ Just a heads-up — the correct folder is two directories down.
npm install
```

### Running the App

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Environment Variables

If you need to change the backend API URL, edit the relevant value in your API service file.

### Project Structure

- `src/components/` — Reusable UI components
- `src/services/` — API service functions
- `src/App.jsx` — Main application logic

---

Credit: Auto-generated using AI (cursor/chatgpt 4.1)

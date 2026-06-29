# Axis Homeschool & Enrichment Academy

Full-stack web application built with React + Node.js + PostgreSQL.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup
```bash
# Create database
createdb axis_academy

# Or use Docker:
docker-compose up -d postgres
```

### 2. Backend
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run seed    # Seed initial data
npm run dev     # Start server on port 5000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev     # Start dev server on port 5173
```

### 4. Open Browser
Navigate to `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/services | All services |
| GET | /api/services/:id | Single service |
| POST | /api/services | Create service |
| PUT | /api/services/:id | Update service |
| DELETE | /api/services/:id | Delete service |
| GET | /api/testimonials | All testimonials |
| POST | /api/testimonials | Create testimonial |
| GET | /api/contact | All contacts (admin) |
| POST | /api/contact | Submit contact form |

## Project Structure

```
axis-academy/
├── client/          # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # Reusable UI
│   │   ├── sections/     # Page sections
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API calls
│   │   └── hooks/        # Custom hooks
│   └── package.json
├── server/          # Node.js + Express + Sequelize
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── controllers/   # Business logic
│   ├── config/        # DB config
│   └── seeders/       # Initial data
└── docker-compose.yml
```

## Deployment

```bash
# Build for production
cd client && npm run build

# Deploy with Docker
docker-compose up --build
```

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router
- **Backend:** Node.js, Express, Sequelize ORM
- **Database:** PostgreSQL
- **DevOps:** Docker, Docker Compose

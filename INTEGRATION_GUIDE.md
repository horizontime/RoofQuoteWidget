# Frontend-Backend Integration Guide

## Overview
The frontend React application is now fully connected to the FastAPI backend with SQLite database. The following pages have been integrated:
- **Pricing Setup**: Edit and save tiered pricing for shingles
- **Branding**: Upload logo and customize brand colors
- **Templates**: Configure PDF proposal templates

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- Python 3.8+ installed
- pip package manager

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Using the startup script

**Windows:**
```bash
./run_servers.bat
```

**Mac/Linux:**
```bash
chmod +x run_servers.sh
./run_servers.sh
```

### Option 2: Manual startup

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Features Implemented

### Pricing Page (`/pricing`)
- View current pricing for three tiers (Good/Better/Best)
- Edit individual tier pricing, names, and warranties
- Edit additional costs (tear-off, permits)
- Changes are saved to SQLite database

### Branding Page (`/branding`)
- Upload company logo (drag & drop or file select)
- Customize primary, secondary, and accent colors
- Select font family
- Live color preview
- Changes are saved to SQLite database

### Templates Page (`/templates`)
- Configure PDF header and footer text
- Toggle sections (warranty, financing, testimonials)
- Add custom messages
- Set terms and conditions
- Live preview of template changes
- Changes are saved to SQLite database

## Database
- SQLite database: `backend/roof_quote_pro.db`
- Automatically created on first run
- Seeded with default contractor (ID: 1)

## API Endpoints Used

### Pricing
- `GET /api/pricing/contractor/{contractor_id}` - Get pricing data
- `PUT /api/pricing/contractor/{contractor_id}` - Update pricing

### Branding
- `GET /api/branding/contractor/{contractor_id}` - Get branding data
- `PUT /api/branding/contractor/{contractor_id}` - Update branding
- `POST /api/branding/contractor/{contractor_id}/logo` - Upload logo

### Templates
- `GET /api/templates/contractor/{contractor_id}` - Get template data
- `PUT /api/templates/contractor/{contractor_id}` - Update template
- `GET /api/templates/contractor/{contractor_id}/preview` - Get HTML preview

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend is running on port 8000 and frontend on port 5173.

### Database Issues
Delete `backend/roof_quote_pro.db` to reset the database. It will be recreated on next startup.

### Port Already in Use
If ports are already in use, you can change them:
- Backend: Edit the port in the uvicorn command
- Frontend: Vite will automatically use the next available port

## Next Steps
- Implement remaining pages (Dashboard, Widget, Leads)
- Add authentication system
- Implement actual PDF generation
- Add Google Maps integration for address lookup
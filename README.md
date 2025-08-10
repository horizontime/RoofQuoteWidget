# Roof Quote Pro

An instant roof quote widget system that enables roofing contractors to provide immediate, accurate quotes to homeowners through an embeddable widget.

## Overview

Roof Quote Pro allows contractors to:
- Configure pricing tiers for different shingle types
- Customize branding with logo and colors
- Design PDF proposal templates
- Embed a quote widget on their website
- Capture and manage leads
- Generate instant quotes with aerial roof measurements

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: FastAPI (Python 3.8+)
- **Database**: SQLite3
- **APIs**: Google Maps API (for address lookup and aerial imagery)
- **PDF Generation**: jsPDF

## Project Structure

```
roof-quote-pro/
│
├── backend/                    # FastAPI backend
│   ├── routers/               # API route handlers
│   │   ├── analytics.py      # Analytics endpoints
│   │   ├── branding.py       # Branding configuration
│   │   ├── contractor.py     # Contractor management
│   │   ├── email.py          # Email service endpoints
│   │   ├── integration.py    # Third-party integrations
│   │   ├── leads.py          # Lead management
│   │   ├── pricing.py        # Pricing configuration
│   │   ├── quote.py          # Quote generation
│   │   ├── template.py       # Template management
│   │   └── widget.py         # Widget configuration
│   ├── services/              # Business logic services
│   │   └── email_service.py  # Email handling
│   ├── uploads/               # Uploaded files (logos, etc.)
│   ├── pdfs/                  # Generated PDF proposals
│   ├── main.py               # FastAPI app entry point
│   ├── models.py             # Database models
│   ├── database.py           # Database configuration
│   ├── config.py             # App configuration
│   ├── seed_data.py          # Database seeding script
│   └── requirements.txt      # Python dependencies
│
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Card.tsx      # Card component
│   │   │   ├── Layout.tsx    # App layout wrapper
│   │   │   ├── Modal.tsx     # Modal component
│   │   │   └── EmailQuoteModal.tsx  # Email quote modal
│   │   ├── pages/            # Route pages
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   ├── PricingSetup.tsx # Pricing configuration
│   │   │   ├── Branding.tsx     # Branding settings
│   │   │   ├── Templates.tsx    # PDF template editor
│   │   │   ├── Widget.tsx       # Widget embed generator
│   │   │   ├── Leads.tsx        # Lead management
│   │   │   └── WidgetFlow.tsx   # Embedded widget flow
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useGoogleMaps.ts # Google Maps integration
│   │   │   └── usePolygonEditor.ts # Roof area editing
│   │   ├── services/         # API services
│   │   │   ├── api.ts        # API client
│   │   │   ├── mapService.ts # Map functionality
│   │   │   └── overpassService.ts # OSM data service
│   │   ├── utils/            # Utility functions
│   │   │   ├── pdfGenerator.ts  # PDF generation
│   │   │   └── leadQuotePdf.ts  # Lead quote PDF
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   ├── tsconfig.json         # TypeScript config
│   └── vite.config.ts        # Vite configuration
│
├── docs/                      # Documentation
│   ├── PRD.md               # Product requirements
│   ├── PRD-rephrased.md     # Simplified PRD
│   └── git-commit-standards.md # Git conventions
│
├── CLAUDE.md                 # Claude AI instructions
├── INTEGRATION_GUIDE.md      # Integration documentation
└── README.md                 # This file
```

## Features

### Admin Console
- **Dashboard**: Overview of leads, revenue, and quick setup guide
- **Pricing Setup**: Configure 3-tier shingle pricing (Good/Better/Best)
- **Branding**: Upload logo and set brand colors
- **Templates**: Design PDF proposal templates with live preview
- **Widget**: Generate embed code for website integration
- **Leads**: Manage captured leads with filtering and export

### Homeowner Widget
- Address input with Google Maps autocomplete
- Interactive roof area selection on aerial imagery
- Instant quote calculation with three pricing tiers
- PDF proposal generation and email delivery
- Lead capture to CRM integration

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Google Maps API key (for production)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python seed_data.py
```

5. Configure environment variables (optional):
```bash
# Create a .env file in the backend directory
GOOGLE_MAPS_API_KEY=your_api_key_here
SENDGRID_API_KEY=your_sendgrid_key_here
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend Server

From the `backend` directory:

```bash
# Development mode with auto-reload
uvicorn main:app --reload --port 8000

# Or using Python
python -m uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000
API documentation: http://localhost:8000/docs

### Start the Frontend Development Server

From the `frontend` directory:

```bash
# Development mode
npm run dev
```

The application will be available at: http://localhost:5173

## Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend
```bash
uvicorn main:app --reload     # Run with auto-reload
python seed_data.py           # Seed database with sample data
python reset_database.py      # Reset database
```

## API Endpoints

The backend provides RESTful API endpoints:

- `/api/contractor` - Contractor settings management
- `/api/pricing` - Pricing tier configuration
- `/api/branding` - Branding assets and colors
- `/api/templates` - PDF template management
- `/api/widget` - Widget configuration
- `/api/leads` - Lead capture and management
- `/api/quote` - Quote generation
- `/api/analytics` - Dashboard analytics

Full API documentation is available at http://localhost:8000/docs when the backend is running.

## Deployment

### Production Build

Frontend:
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```

Backend:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Contributing

Please follow the commit standards outlined in `docs/git-commit-standards.md`.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
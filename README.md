# Roof Quote Pro

An instant roof quote widget system that enables roofing contractors to provide immediate, accurate quotes to homeowners through an embeddable widget.

## Demo Screenshots

[Dashboard](/demo-pics/page1-dashboard.PNG)  
[Pricing](/demo-pics/page2-pricing.PNG)  
[Branding](/demo-pics/page3-branding.PNG)  
[Templates](/demo-pics/page4-templates.PNG)  
[Widget](/demo-pics/page5-widget.PNG)  
[Leads](/demo-pics/page6-leads.PNG)  
[Leads Email Quote](/demo-pics/page6-leads-emailquote.PNG)  
[Lead Details](/demo-pics/page6-leads-leaddetails.PNG)  
[Widget Flow 1](/demo-pics/widgetflow-1.PNG)  
[Widget Flow 2](/demo-pics/widgetflow-2.PNG)  
[Widget Flow 3](/demo-pics/widgetflow-3.PNG)  
[Widget Flow 4](/demo-pics/widgetflow-4.PNG)  
[Widget Flow 5](/demo-pics/widgetflow-5.PNG)

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

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```


3. Configure environment variables (backend):
```bash
# Create a .env file in the backend directory
DATABASE_URL=sqlite:///./roof_quote_pro.db
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SECRET_KEY=your-secret-key
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=5242880
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
3. Configure environment variables (frontend):
```bash
# Create a .env file in the front directory
# Places API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
# Backend API URL
VITE_API_URL=http://localhost:8000
```
## Running the Application

### Start the Backend Server

From the `backend` directory:

```bash

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


## Contributing

Please follow the commit standards outlined in `docs/git-commit-standards.md`.


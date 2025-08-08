# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Roof Quote Pro - An instant roof quote widget system with contractor-defined pricing. Contractors can configure pricing, branding, and templates through an admin console, then embed a widget on their website for homeowners to get instant quotes.

## Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (Vite)
npm run build        # Build for production (TypeScript + Vite)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
# Backend not yet implemented - will use FastAPI
# Future commands:
# pip install -r requirements.txt
# uvicorn main:app --reload
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: FastAPI (Python) - not yet implemented
- **Database**: SQLite3 (planned)
- **APIs**: Google Maps API for address/aerial imagery (planned)
- **PDF**: jsPDF for proposal generation

### Project Structure
```
/frontend
  /src
    /components - Reusable UI components (Layout, Card)
    /pages      - Route pages (Dashboard, PricingSetup, Branding, Templates, Widget, Leads)
    App.tsx     - Main router setup
    main.tsx    - Entry point
/backend        - Empty, FastAPI implementation pending
/docs           - PRD and specifications
```

### Key Frontend Routes
- `/` - Dashboard with stats and quick setup
- `/pricing` - Configure 3-tier shingle pricing (Good/Better/Best)
- `/branding` - Upload logo and set brand colors
- `/templates` - Configure PDF proposal template with live preview
- `/widget` - Generate embed code for contractor websites
- `/leads` - Manage captured leads with filtering and export

### Pricing Tiers (Mock Data)
- **Good**: 3-Tab Shingles @ $6.50/sqft (25-year warranty)
- **Better**: Architectural Shingles @ $8.75/sqft (30-year warranty)
- **Best**: Designer Shingles @ $12.00/sqft (Lifetime warranty)

## Current Implementation Status

### Completed
- Frontend UI structure with all 6 pages
- React Router navigation
- Responsive design with green theme
- Form layouts (not functional)
- Mock data displays

### Not Implemented
- Backend API (FastAPI)
- Database layer
- API integration (frontend-backend communication)
- Google Maps integration for address lookup
- Actual PDF generation functionality
- Lead capture to CRM endpoint
- Widget embed functionality
- Form validation and submission
- Authentication system

## Development Guidelines

### Git Commit Standards
Use Conventional Commits format:
```
<type>[optional scope]: <description>
```
Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore

reference document: 'docs\git-commit-standards.md'

### Frontend Development
- Components use functional React with TypeScript
- Styling via Tailwind CSS classes
- Icons from lucide-react library
- Forms will use react-hook-form + zod validation
- API calls via axios

### Backend Requirements (To Be Implemented)
- FastAPI with Python 3.8+
- Endpoints for:
  - Contractor settings CRUD
  - Lead capture and management  
  - PDF generation
  - Widget configuration
- Mock CRM endpoint for lead storage

## MVP Requirements

### Admin Console Must Have
- Shingle SKU selection (3 tiers)
- Per-sqft pricing configuration
- Logo/color branding upload
- PDF template configuration with live preview
- Website embed code generation

### Homeowner Widget Must Have
- Address input
- Map location confirmation
- Good/Better/Best estimate display
- Email proposal PDF option
- Lead capture to mock CRM

### Technical Requirements
- Responsive design
- Automatic or configurable style matching
- Mock roof measurement logic
- Aerial map display with house indication
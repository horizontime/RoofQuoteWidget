# Roof Quote Pro - Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 3. View API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Structure

### Phases Implemented (1-8)

#### Phase 1: Core Setup ✅
- FastAPI project structure
- SQLite database with SQLAlchemy models
- CORS configuration
- Error handling middleware
- Database seeding with mock data

#### Phase 2: Contractor Settings ✅
- `/api/contractors` - Contractor profile management
- `/api/pricing` - Pricing tier configuration
- `/api/branding` - Logo and color scheme management
- `/api/templates` - PDF template configuration

#### Phase 3: Widget Configuration ✅
- `/api/widget` - Widget settings and embed code generation
- Widget data retrieval endpoint for embedded widgets

#### Phase 4: Lead Management ✅
- `/api/leads` - Lead CRUD operations
- Lead filtering, search, and CSV export
- Lead status tracking

#### Phase 5: Quote Generation ✅
- `/api/quotes` - Quote creation and calculation
- Address validation (mocked)
- Roof measurement calculation (mocked)
- Multi-tier pricing calculations

#### Phase 6: Email Integration ✅
- `/api/send-quote-email` - Send quotes via SendGrid with PDF attachments
- Email configuration status endpoint
- Test email functionality

#### Phase 7: External Integrations ✅
- `/api/integrations` - Mocked external services:
  - Google Maps geocoding and aerial imagery (placeholder)
  - Mock CRM lead forwarding
  - Webhook configuration
  - EagleView measurement simulation

#### Phase 8: Analytics & Reporting ✅
- `/api/analytics` - Event tracking and metrics
- Dashboard statistics
- Conversion funnel metrics
- Lead source analysis

## Database

The SQLite database (`roof_quote_pro.db`) is automatically created and seeded with sample data on first run.

### Sample Data Includes:
- Premier Roofing Solutions (sample contractor)
- GAF shingle products (Good/Better/Best tiers)
- Sample pricing configurations
- Sample leads and quotes

## Environment Variables

Configuration in `.env` file:
- `DATABASE_URL` - SQLite database path
- `CORS_ORIGINS` - Allowed frontend origins
- `GOOGLE_MAPS_API_KEY` - Placeholder for Google Maps API
- `UPLOAD_DIR` - Directory for file uploads

## Testing the API

### Quick Test Endpoints:
```bash
# Check health
curl http://localhost:8000/health

# Get contractor list
curl http://localhost:8000/api/contractors/

# Get widget data
curl http://localhost:8000/api/widget/data/{widget_id}
```

## Notes

- All Google Maps API calls return mock/placeholder data
- CRM integration endpoints are mocked for development
- PDF generation handled by frontend using jsPDF
- Email service uses SendGrid for sending quotes with PDF attachments
- No authentication required (as per requirements)
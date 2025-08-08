from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os
from config import settings
from database import engine, Base
from seed_data import seed_database
from routers import (
    contractor,
    pricing,
    branding,
    template,
    widget,
    leads,
    quote,
    pdf,
    analytics,
    integration
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    logger.info("Shutting down application")

app = FastAPI(
    title="Roof Quote Pro API",
    version="1.0.0",
    description="Backend API for instant roof quote widget system",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.get("/")
async def root():
    return {"message": "Roof Quote Pro API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(contractor.router, prefix="/api/contractors", tags=["contractors"])
app.include_router(pricing.router, prefix="/api/pricing", tags=["pricing"])
app.include_router(branding.router, prefix="/api/branding", tags=["branding"])
app.include_router(template.router, prefix="/api/templates", tags=["templates"])
app.include_router(widget.router, prefix="/api/widget", tags=["widget"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])
app.include_router(quote.router, prefix="/api/quotes", tags=["quotes"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(integration.router, prefix="/api/integrations", tags=["integrations"])
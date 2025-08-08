from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Branding, Contractor
from pydantic import BaseModel
from datetime import datetime
import os
import uuid
from config import settings

router = APIRouter()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

class BrandingBase(BaseModel):
    primary_color: str = "#22c55e"
    secondary_color: str = "#16a34a"
    accent_color: str = "#15803d"
    font_family: str = "Inter"

class BrandingCreate(BrandingBase):
    contractor_id: int
    logo_url: str = None

class BrandingUpdate(BaseModel):
    primary_color: str = None
    secondary_color: str = None
    accent_color: str = None
    font_family: str = None
    logo_url: str = None

class BrandingResponse(BrandingBase):
    id: int
    contractor_id: int
    logo_url: str = None
    created_at: datetime
    updated_at: datetime = None
    
    class Config:
        from_attributes = True

@router.get("/contractor/{contractor_id}", response_model=BrandingResponse)
async def get_contractor_branding(contractor_id: int, db: Session = Depends(get_db)):
    branding = db.query(Branding).filter(Branding.contractor_id == contractor_id).first()
    if not branding:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        
        branding = Branding(contractor_id=contractor_id)
        db.add(branding)
        db.commit()
        db.refresh(branding)
    
    return branding

@router.post("/", response_model=BrandingResponse)
async def create_branding(branding: BrandingCreate, db: Session = Depends(get_db)):
    existing = db.query(Branding).filter(Branding.contractor_id == branding.contractor_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Branding already exists for this contractor")
    
    contractor = db.query(Contractor).filter(Contractor.id == branding.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    db_branding = Branding(**branding.dict())
    db.add(db_branding)
    db.commit()
    db.refresh(db_branding)
    return db_branding

@router.put("/contractor/{contractor_id}", response_model=BrandingResponse)
async def update_branding(
    contractor_id: int,
    branding: BrandingUpdate,
    db: Session = Depends(get_db)
):
    db_branding = db.query(Branding).filter(Branding.contractor_id == contractor_id).first()
    if not db_branding:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        db_branding = Branding(contractor_id=contractor_id)
        db.add(db_branding)
    
    update_data = branding.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_branding, field, value)
    
    db.commit()
    db.refresh(db_branding)
    return db_branding

@router.post("/contractor/{contractor_id}/logo")
async def upload_logo(
    contractor_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    branding = db.query(Branding).filter(Branding.contractor_id == contractor_id).first()
    if not branding:
        branding = Branding(contractor_id=contractor_id)
        db.add(branding)
    
    branding.logo_url = f"/{settings.UPLOAD_DIR}/{file_name}"
    db.commit()
    db.refresh(branding)
    
    return {"logo_url": branding.logo_url, "message": "Logo uploaded successfully"}
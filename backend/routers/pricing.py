from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Pricing, Contractor
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class PricingBase(BaseModel):
    good_tier_price: float = 6.50
    good_tier_name: str = "3-Tab Shingles"
    good_tier_warranty: str = "25-year"
    better_tier_price: float = 8.75
    better_tier_name: str = "Architectural Shingles"
    better_tier_warranty: str = "30-year"
    best_tier_price: float = 12.00
    best_tier_name: str = "Designer Shingles"
    best_tier_warranty: str = "Lifetime"
    removal_price: float = 1.50
    permit_price: float = 350.00

class PricingCreate(PricingBase):
    contractor_id: int

class PricingUpdate(BaseModel):
    good_tier_price: float = None
    good_tier_name: str = None
    good_tier_warranty: str = None
    better_tier_price: float = None
    better_tier_name: str = None
    better_tier_warranty: str = None
    best_tier_price: float = None
    best_tier_name: str = None
    best_tier_warranty: str = None
    removal_price: float = None
    permit_price: float = None

class PricingResponse(PricingBase):
    id: int
    contractor_id: int
    created_at: datetime
    updated_at: datetime = None
    
    class Config:
        from_attributes = True

@router.get("/contractor/{contractor_id}", response_model=PricingResponse)
async def get_contractor_pricing(contractor_id: int, db: Session = Depends(get_db)):
    pricing = db.query(Pricing).filter(Pricing.contractor_id == contractor_id).first()
    if not pricing:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        
        pricing = Pricing(contractor_id=contractor_id)
        db.add(pricing)
        db.commit()
        db.refresh(pricing)
    
    return pricing

@router.post("/", response_model=PricingResponse)
async def create_pricing(pricing: PricingCreate, db: Session = Depends(get_db)):
    existing = db.query(Pricing).filter(Pricing.contractor_id == pricing.contractor_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Pricing already exists for this contractor")
    
    contractor = db.query(Contractor).filter(Contractor.id == pricing.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    db_pricing = Pricing(**pricing.dict())
    db.add(db_pricing)
    db.commit()
    db.refresh(db_pricing)
    return db_pricing

@router.put("/contractor/{contractor_id}", response_model=PricingResponse)
async def update_pricing(
    contractor_id: int,
    pricing: PricingUpdate,
    db: Session = Depends(get_db)
):
    db_pricing = db.query(Pricing).filter(Pricing.contractor_id == contractor_id).first()
    if not db_pricing:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        db_pricing = Pricing(contractor_id=contractor_id)
        db.add(db_pricing)
    
    update_data = pricing.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pricing, field, value)
    
    db.commit()
    db.refresh(db_pricing)
    return db_pricing
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Quote, Lead, Pricing, Contractor
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random

router = APIRouter()

class QuoteCreate(BaseModel):
    lead_id: int
    address: str
    selected_tier: str
    include_removal: bool = True
    include_permit: bool = True

class QuoteResponse(BaseModel):
    id: int
    lead_id: int
    address: str
    roof_size_sqft: float
    selected_tier: str
    base_price: float
    removal_cost: float
    permit_cost: float
    total_price: float
    quote_data: dict
    pdf_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AddressValidation(BaseModel):
    address: str
    contractor_id: int

class RoofMeasurement(BaseModel):
    address: str
    sqft: float
    squares: float
    complexity: str
    pitch: str

def calculate_roof_size(address: str) -> dict:
    base_sqft = random.randint(1500, 3500)
    complexity_factor = random.choice([1.0, 1.15, 1.25])
    
    roof_sqft = base_sqft * complexity_factor
    squares = roof_sqft / 100
    
    complexity = "simple" if complexity_factor == 1.0 else "moderate" if complexity_factor == 1.15 else "complex"
    pitch = random.choice(["4/12", "6/12", "8/12", "10/12"])
    
    return {
        "roof_size_sqft": round(roof_sqft, 2),
        "squares": round(squares, 2),
        "complexity": complexity,
        "pitch": pitch,
        "home_sqft": base_sqft
    }

@router.post("/validate-address")
async def validate_address(validation: AddressValidation, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == validation.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    is_valid = len(validation.address) > 10 and any(char.isdigit() for char in validation.address)
    
    return {
        "valid": is_valid,
        "formatted_address": validation.address.title() if is_valid else None,
        "coordinates": {
            "lat": 32.7767 + random.uniform(-0.1, 0.1),
            "lng": -96.7970 + random.uniform(-0.1, 0.1)
        } if is_valid else None,
        "message": "Address validated successfully" if is_valid else "Invalid address format"
    }

@router.post("/measure-roof")
async def measure_roof(address: str):
    measurement = calculate_roof_size(address)
    
    return RoofMeasurement(
        address=address,
        sqft=measurement["roof_size_sqft"],
        squares=measurement["squares"],
        complexity=measurement["complexity"],
        pitch=measurement["pitch"]
    )

@router.post("/", response_model=QuoteResponse)
async def create_quote(quote: QuoteCreate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == quote.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    pricing = db.query(Pricing).filter(Pricing.contractor_id == lead.contractor_id).first()
    if not pricing:
        pricing = Pricing(contractor_id=lead.contractor_id)
        db.add(pricing)
        db.commit()
        db.refresh(pricing)
    
    roof_data = calculate_roof_size(quote.address)
    
    tier_prices = {
        "good": pricing.good_tier_price,
        "better": pricing.better_tier_price,
        "best": pricing.best_tier_price
    }
    
    if quote.selected_tier not in tier_prices:
        raise HTTPException(status_code=400, detail="Invalid tier selected")
    
    base_price = roof_data["roof_size_sqft"] * tier_prices[quote.selected_tier]
    removal_cost = roof_data["roof_size_sqft"] * pricing.removal_price if quote.include_removal else 0
    permit_cost = pricing.permit_price if quote.include_permit else 0
    total_price = base_price + removal_cost + permit_cost
    
    db_quote = Quote(
        lead_id=quote.lead_id,
        address=quote.address,
        roof_size_sqft=roof_data["roof_size_sqft"],
        selected_tier=quote.selected_tier,
        base_price=round(base_price, 2),
        removal_cost=round(removal_cost, 2),
        permit_cost=round(permit_cost, 2),
        total_price=round(total_price, 2),
        quote_data={
            "roof_squares": roof_data["squares"],
            "complexity": roof_data["complexity"],
            "pitch": roof_data["pitch"],
            "home_sqft": roof_data["home_sqft"],
            "include_removal": quote.include_removal,
            "include_permit": quote.include_permit
        }
    )
    
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    
    return db_quote

@router.get("/lead/{lead_id}", response_model=List[QuoteResponse])
async def get_lead_quotes(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    quotes = db.query(Quote).filter(Quote.lead_id == lead_id).order_by(Quote.created_at.desc()).all()
    return quotes

@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(quote_id: int, db: Session = Depends(get_db)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    return quote

@router.post("/calculate")
async def calculate_quote(
    contractor_id: int,
    address: str,
    selected_tier: str,
    include_removal: bool = True,
    include_permit: bool = True,
    db: Session = Depends(get_db)
):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    pricing = db.query(Pricing).filter(Pricing.contractor_id == contractor_id).first()
    if not pricing:
        pricing = Pricing(contractor_id=contractor_id)
    
    roof_data = calculate_roof_size(address)
    
    tier_info = {
        "good": {
            "name": pricing.good_tier_name,
            "price": pricing.good_tier_price,
            "warranty": pricing.good_tier_warranty
        },
        "better": {
            "name": pricing.better_tier_name,
            "price": pricing.better_tier_price,
            "warranty": pricing.better_tier_warranty
        },
        "best": {
            "name": pricing.best_tier_name,
            "price": pricing.best_tier_price,
            "warranty": pricing.best_tier_warranty
        }
    }
    
    calculations = {}
    for tier, info in tier_info.items():
        base = roof_data["roof_size_sqft"] * info["price"]
        removal = roof_data["roof_size_sqft"] * pricing.removal_price if include_removal else 0
        permit = pricing.permit_price if include_permit else 0
        
        calculations[tier] = {
            "name": info["name"],
            "warranty": info["warranty"],
            "base_price": round(base, 2),
            "removal_cost": round(removal, 2),
            "permit_cost": round(permit, 2),
            "total_price": round(base + removal + permit, 2)
        }
    
    return {
        "address": address,
        "roof_details": roof_data,
        "pricing_tiers": calculations,
        "selected_tier": calculations.get(selected_tier)
    }
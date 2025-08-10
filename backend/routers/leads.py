from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import Lead, Contractor, Quote
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import csv
import io

router = APIRouter()

class LeadBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: str
    best_time_to_call: Optional[str] = None
    additional_notes: Optional[str] = None
    status: str = "new"
    source: str = "widget"
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    contractor_id: int

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    best_time_to_call: Optional[str] = None
    additional_notes: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class LeadResponse(LeadBase):
    id: int
    contractor_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class LeadWithQuote(LeadResponse):
    latest_quote: Optional[dict] = None

@router.get("/contractor/{contractor_id}", response_model=List[LeadWithQuote])
async def get_contractor_leads(
    contractor_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    query = db.query(Lead).filter(Lead.contractor_id == contractor_id)
    
    if status:
        query = query.filter(Lead.status == status)
    
    if search:
        query = query.filter(
            or_(
                Lead.name.contains(search),
                Lead.email.contains(search),
                Lead.phone.contains(search),
                Lead.address.contains(search)
            )
        )
    
    leads = query.offset(skip).limit(limit).all()
    
    result = []
    for lead in leads:
        lead_dict = lead.__dict__.copy()
        latest_quote = db.query(Quote).filter(Quote.lead_id == lead.id).order_by(Quote.created_at.desc()).first()
        if latest_quote:
            lead_dict['latest_quote'] = {
                'id': latest_quote.id,
                'total_price': latest_quote.total_price,
                'selected_tier': latest_quote.selected_tier,
                'created_at': latest_quote.created_at
            }
        else:
            lead_dict['latest_quote'] = None
        result.append(lead_dict)
    
    return result

@router.get("/{lead_id}", response_model=LeadWithQuote)
async def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead_dict = lead.__dict__.copy()
    latest_quote = db.query(Quote).filter(Quote.lead_id == lead.id).order_by(Quote.created_at.desc()).first()
    if latest_quote:
        lead_dict['latest_quote'] = {
            'id': latest_quote.id,
            'total_price': latest_quote.total_price,
            'selected_tier': latest_quote.selected_tier,
            'created_at': latest_quote.created_at
        }
    else:
        lead_dict['latest_quote'] = None
    
    return lead_dict

@router.post("/", response_model=LeadResponse)
async def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == lead.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    db_lead = Lead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    lead: LeadUpdate,
    db: Session = Depends(get_db)
):
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lead, field, value)
    
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.delete("/{lead_id}")
async def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}

@router.get("/contractor/{contractor_id}/export")
async def export_leads(
    contractor_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    query = db.query(Lead).filter(Lead.contractor_id == contractor_id)
    if status:
        query = query.filter(Lead.status == status)
    
    leads = query.all()
    
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=['id', 'name', 'email', 'phone', 'address', 'status', 'source', 'notes', 'created_at']
    )
    writer.writeheader()
    
    for lead in leads:
        writer.writerow({
            'id': lead.id,
            'name': lead.name,
            'email': lead.email,
            'phone': lead.phone,
            'address': lead.address,
            'status': lead.status,
            'source': lead.source,
            'notes': lead.notes,
            'created_at': lead.created_at.isoformat() if lead.created_at else ''
        })
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type='text/csv',
        headers={
            "Content-Disposition": f"attachment; filename=leads_{contractor.company_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )

class WidgetLeadCreate(BaseModel):
    contractor_id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    address: str
    best_time_to_call: Optional[str] = None
    additional_notes: Optional[str] = None
    roof_size_sqft: float
    roof_pitch: Optional[str] = None
    selected_tier: str
    good_tier_price: float
    better_tier_price: float
    best_tier_price: float
    total_price: float

@router.post("/widget-capture", response_model=LeadResponse)
async def create_widget_lead(lead_data: WidgetLeadCreate, db: Session = Depends(get_db)):
    """
    Create a new lead from the widget with quote information
    """
    contractor = db.query(Contractor).filter(Contractor.id == lead_data.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    # Create the lead
    db_lead = Lead(
        contractor_id=lead_data.contractor_id,
        name=f"{lead_data.first_name} {lead_data.last_name}",
        email=lead_data.email,
        phone=lead_data.phone,
        address=lead_data.address,
        best_time_to_call=lead_data.best_time_to_call,
        additional_notes=lead_data.additional_notes,
        status="new",
        source="widget"
    )
    db.add(db_lead)
    db.flush()  # Flush to get the lead ID without committing
    
    # Create the quote
    db_quote = Quote(
        lead_id=db_lead.id,
        address=lead_data.address,
        roof_size_sqft=lead_data.roof_size_sqft,
        roof_pitch=lead_data.roof_pitch,
        selected_tier=lead_data.selected_tier,
        good_tier_price=lead_data.good_tier_price,
        better_tier_price=lead_data.better_tier_price,
        best_tier_price=lead_data.best_tier_price,
        base_price=lead_data.total_price,
        total_price=lead_data.total_price,
        quote_data={
            "roof_pitch": lead_data.roof_pitch,
            "selected_tier": lead_data.selected_tier,
            "timestamp": datetime.now().isoformat()
        }
    )
    db.add(db_quote)
    
    db.commit()
    db.refresh(db_lead)
    
    return db_lead
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
    phone: str = None
    address: str
    status: str = "new"
    source: str = "widget"
    notes: str = None

class LeadCreate(LeadBase):
    contractor_id: int

class LeadUpdate(BaseModel):
    name: str = None
    email: str = None
    phone: str = None
    address: str = None
    status: str = None
    notes: str = None

class LeadResponse(LeadBase):
    id: int
    contractor_id: int
    created_at: datetime
    updated_at: datetime = None
    
    class Config:
        from_attributes = True

class LeadWithQuote(LeadResponse):
    latest_quote: dict = None

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
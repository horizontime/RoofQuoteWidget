from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Template, Contractor
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter()

class TemplateBase(BaseModel):
    header_text: str = "Professional Roof Quote"
    footer_text: str = "Thank you for choosing us!"
    show_warranty: bool = True
    show_financing: bool = True
    show_testimonials: bool = True
    custom_message: Optional[str] = None
    terms_conditions: Optional[str] = None

class TemplateCreate(TemplateBase):
    contractor_id: int

class TemplateUpdate(BaseModel):
    header_text: Optional[str] = None
    footer_text: Optional[str] = None
    show_warranty: Optional[bool] = None
    show_financing: Optional[bool] = None
    show_testimonials: Optional[bool] = None
    custom_message: Optional[str] = None
    terms_conditions: Optional[str] = None

class TemplateResponse(TemplateBase):
    id: int
    contractor_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

@router.get("/contractor/{contractor_id}", response_model=TemplateResponse)
async def get_contractor_template(contractor_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.contractor_id == contractor_id).first()
    if not template:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        
        template = Template(contractor_id=contractor_id)
        db.add(template)
        db.commit()
        db.refresh(template)
    
    return template

@router.post("/", response_model=TemplateResponse)
async def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    existing = db.query(Template).filter(Template.contractor_id == template.contractor_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Template already exists for this contractor")
    
    contractor = db.query(Contractor).filter(Contractor.id == template.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    db_template = Template(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.put("/contractor/{contractor_id}", response_model=TemplateResponse)
async def update_template(
    contractor_id: int,
    template: TemplateUpdate,
    db: Session = Depends(get_db)
):
    db_template = db.query(Template).filter(Template.contractor_id == contractor_id).first()
    if not db_template:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        db_template = Template(contractor_id=contractor_id)
        db.add(db_template)
    
    update_data = template.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/contractor/{contractor_id}/preview")
async def preview_template(contractor_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.contractor_id == contractor_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    
    preview_html = f"""
    <html>
    <head><style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ text-align: center; color: #22c55e; }}
        .section {{ margin: 20px 0; }}
    </style></head>
    <body>
        <h1 class="header">{template.header_text}</h1>
        <div class="section">
            <h2>{contractor.company_name}</h2>
            <p>{contractor.address}</p>
            <p>{contractor.phone} | {contractor.email}</p>
        </div>
        {'<div class="section"><h3>Warranty Information</h3><p>Full warranty details included</p></div>' if template.show_warranty else ''}
        {'<div class="section"><h3>Financing Options</h3><p>Flexible payment plans available</p></div>' if template.show_financing else ''}
        {'<div class="section"><h3>Customer Testimonials</h3><p>5-star reviews from satisfied customers</p></div>' if template.show_testimonials else ''}
        {f'<div class="section"><p>{template.custom_message}</p></div>' if template.custom_message else ''}
        {f'<div class="section"><small>{template.terms_conditions}</small></div>' if template.terms_conditions else ''}
        <div class="section" style="text-align: center;">
            <p>{template.footer_text}</p>
        </div>
    </body>
    </html>
    """
    
    return {"preview_html": preview_html}
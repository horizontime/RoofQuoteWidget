from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Contractor, WidgetSettings, Branding, Pricing
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter()

class WidgetSettingsBase(BaseModel):
    position: str = "bottom-right"
    button_text: str = "Get Instant Quote"
    auto_open: bool = False
    delay_seconds: int = 0
    show_on_mobile: bool = True
    custom_css: Optional[str] = None

class WidgetSettingsCreate(WidgetSettingsBase):
    contractor_id: int

class WidgetSettingsUpdate(BaseModel):
    position: Optional[str] = None
    button_text: Optional[str] = None
    auto_open: Optional[bool] = None
    delay_seconds: Optional[int] = None
    show_on_mobile: Optional[bool] = None
    custom_css: Optional[str] = None

class WidgetSettingsResponse(WidgetSettingsBase):
    id: int
    contractor_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

@router.get("/contractor/{contractor_id}/settings", response_model=WidgetSettingsResponse)
async def get_widget_settings(contractor_id: int, db: Session = Depends(get_db)):
    settings = db.query(WidgetSettings).filter(WidgetSettings.contractor_id == contractor_id).first()
    if not settings:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        
        settings = WidgetSettings(contractor_id=contractor_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/contractor/{contractor_id}/settings", response_model=WidgetSettingsResponse)
async def update_widget_settings(
    contractor_id: int,
    settings: WidgetSettingsUpdate,
    db: Session = Depends(get_db)
):
    db_settings = db.query(WidgetSettings).filter(WidgetSettings.contractor_id == contractor_id).first()
    if not db_settings:
        contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=404, detail="Contractor not found")
        db_settings = WidgetSettings(contractor_id=contractor_id)
        db.add(db_settings)
    
    update_data = settings.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

@router.get("/contractor/{contractor_id}/embed-code")
async def get_embed_code(contractor_id: int, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    settings = db.query(WidgetSettings).filter(WidgetSettings.contractor_id == contractor_id).first()
    if not settings:
        settings = WidgetSettings(contractor_id=contractor_id)
    
    iframe_code = f"""
<!-- Roof Quote Pro Widget -->
<iframe 
    src="http://localhost:5173/widget-embed?id={contractor.widget_id}"
    style="position: fixed; {settings.position.replace('-', ': 20px; ')}: 20px; width: 400px; height: 600px; border: none; z-index: 9999;"
    allow="geolocation">
</iframe>
"""
    
    script_code = f"""
<!-- Roof Quote Pro Widget Script -->
<script>
(function() {{
    var widget = document.createElement('div');
    widget.id = 'roof-quote-widget';
    widget.setAttribute('data-widget-id', '{contractor.widget_id}');
    widget.setAttribute('data-position', '{settings.position}');
    widget.setAttribute('data-button-text', '{settings.button_text}');
    widget.setAttribute('data-auto-open', '{str(settings.auto_open).lower()}');
    widget.setAttribute('data-delay', '{settings.delay_seconds}');
    document.body.appendChild(widget);
    
    var script = document.createElement('script');
    script.src = 'http://localhost:5173/widget.js';
    script.async = true;
    document.head.appendChild(script);
}})();
</script>
"""
    
    return {
        "widget_id": contractor.widget_id,
        "iframe_code": iframe_code,
        "script_code": script_code
    }

@router.get("/data/{widget_id}")
async def get_widget_data(widget_id: str, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.widget_id == widget_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    pricing = db.query(Pricing).filter(Pricing.contractor_id == contractor.id).first()
    branding = db.query(Branding).filter(Branding.contractor_id == contractor.id).first()
    settings = db.query(WidgetSettings).filter(WidgetSettings.contractor_id == contractor.id).first()
    
    if not pricing:
        pricing = Pricing(contractor_id=contractor.id)
    if not branding:
        branding = Branding(contractor_id=contractor.id)
    if not settings:
        settings = WidgetSettings(contractor_id=contractor.id)
    
    return {
        "contractor": {
            "company_name": contractor.company_name,
            "email": contractor.email,
            "phone": contractor.phone,
            "website": contractor.website
        },
        "pricing": {
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
            },
            "removal_price": pricing.removal_price,
            "permit_price": pricing.permit_price
        },
        "branding": {
            "logo_url": branding.logo_url,
            "primary_color": branding.primary_color,
            "secondary_color": branding.secondary_color,
            "accent_color": branding.accent_color,
            "font_family": branding.font_family
        },
        "settings": {
            "position": settings.position,
            "button_text": settings.button_text,
            "auto_open": settings.auto_open,
            "delay_seconds": settings.delay_seconds,
            "show_on_mobile": settings.show_on_mobile,
            "custom_css": settings.custom_css
        }
    }
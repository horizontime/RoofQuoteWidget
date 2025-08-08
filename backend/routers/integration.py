from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Lead, Quote, Contractor
from pydantic import BaseModel
from typing import Optional, List
import random
import httpx
from datetime import datetime

router = APIRouter()

class AddressLookup(BaseModel):
    address: str

class AerialImageryRequest(BaseModel):
    address: str
    lat: float
    lng: float

class CRMLeadData(BaseModel):
    contractor_id: int
    lead_id: int
    name: str
    email: str
    phone: str = None
    address: str
    quote_amount: float = None
    source: str = "widget"

class WebhookConfig(BaseModel):
    contractor_id: int
    event_type: str
    webhook_url: str
    active: bool = True

webhooks = {}

@router.post("/google-maps/geocode")
async def geocode_address(lookup: AddressLookup):
    mock_locations = {
        "dallas": {"lat": 32.7767, "lng": -96.7970},
        "plano": {"lat": 33.0198, "lng": -96.6989},
        "fort worth": {"lat": 32.7555, "lng": -97.3308},
        "arlington": {"lat": 32.7357, "lng": -97.1081}
    }
    
    city = "dallas"
    for key in mock_locations:
        if key in lookup.address.lower():
            city = key
            break
    
    base_coords = mock_locations[city]
    
    return {
        "status": "OK",
        "results": [{
            "formatted_address": f"{lookup.address}, TX, USA",
            "geometry": {
                "location": {
                    "lat": base_coords["lat"] + random.uniform(-0.05, 0.05),
                    "lng": base_coords["lng"] + random.uniform(-0.05, 0.05)
                },
                "viewport": {
                    "northeast": {
                        "lat": base_coords["lat"] + 0.01,
                        "lng": base_coords["lng"] + 0.01
                    },
                    "southwest": {
                        "lat": base_coords["lat"] - 0.01,
                        "lng": base_coords["lng"] - 0.01
                    }
                }
            },
            "place_id": f"mock_place_{random.randint(1000, 9999)}",
            "types": ["street_address"]
        }]
    }

@router.post("/google-maps/aerial")
async def get_aerial_imagery(request: AerialImageryRequest):
    zoom_level = 20
    image_size = "640x640"
    
    mock_image_url = f"https://maps.googleapis.com/maps/api/staticmap?center={request.lat},{request.lng}&zoom={zoom_level}&size={image_size}&maptype=satellite&key=PLACEHOLDER_API_KEY"
    
    return {
        "success": True,
        "image_url": mock_image_url,
        "metadata": {
            "address": request.address,
            "coordinates": {"lat": request.lat, "lng": request.lng},
            "zoom_level": zoom_level,
            "image_size": image_size,
            "captured_at": datetime.now().isoformat()
        },
        "message": "Mock aerial imagery URL generated (actual API key required for real images)"
    }

@router.post("/crm/lead")
async def send_lead_to_crm(lead_data: CRMLeadData, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == lead_data.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    mock_crm_response = {
        "success": True,
        "crm_lead_id": f"CRM_{random.randint(100000, 999999)}",
        "status": "created",
        "message": "Lead successfully sent to CRM",
        "data": {
            "name": lead_data.name,
            "email": lead_data.email,
            "phone": lead_data.phone,
            "address": lead_data.address,
            "quote_amount": lead_data.quote_amount,
            "contractor": contractor.company_name,
            "created_at": datetime.now().isoformat()
        }
    }
    
    return mock_crm_response

@router.post("/crm/batch-leads")
async def send_batch_leads_to_crm(leads: List[CRMLeadData], db: Session = Depends(get_db)):
    results = []
    
    for lead_data in leads:
        contractor = db.query(Contractor).filter(Contractor.id == lead_data.contractor_id).first()
        if contractor:
            results.append({
                "lead_id": lead_data.lead_id,
                "crm_lead_id": f"CRM_{random.randint(100000, 999999)}",
                "status": "created",
                "contractor": contractor.company_name
            })
    
    return {
        "success": True,
        "total_processed": len(results),
        "results": results,
        "message": f"Successfully processed {len(results)} leads"
    }

@router.post("/webhooks/configure")
async def configure_webhook(config: WebhookConfig, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == config.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    webhook_key = f"{config.contractor_id}_{config.event_type}"
    webhooks[webhook_key] = {
        "url": config.webhook_url,
        "active": config.active,
        "created_at": datetime.now().isoformat()
    }
    
    return {
        "success": True,
        "webhook_id": webhook_key,
        "message": f"Webhook configured for {config.event_type} events"
    }

@router.get("/webhooks/contractor/{contractor_id}")
async def get_contractor_webhooks(contractor_id: int):
    contractor_webhooks = []
    
    for key, value in webhooks.items():
        if key.startswith(f"{contractor_id}_"):
            event_type = key.split("_", 1)[1]
            contractor_webhooks.append({
                "event_type": event_type,
                "url": value["url"],
                "active": value["active"],
                "created_at": value["created_at"]
            })
    
    return {
        "contractor_id": contractor_id,
        "webhooks": contractor_webhooks
    }

async def trigger_webhook(contractor_id: int, event_type: str, data: dict):
    webhook_key = f"{contractor_id}_{event_type}"
    
    if webhook_key in webhooks and webhooks[webhook_key]["active"]:
        webhook_url = webhooks[webhook_key]["url"]
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook_url,
                    json={
                        "event": event_type,
                        "timestamp": datetime.now().isoformat(),
                        "data": data
                    },
                    timeout=10.0
                )
                return {"success": True, "status_code": response.status_code}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    return {"success": False, "error": "Webhook not configured or inactive"}

@router.post("/webhooks/test/{contractor_id}")
async def test_webhook(
    contractor_id: int,
    event_type: str,
    background_tasks: BackgroundTasks
):
    test_data = {
        "test": True,
        "contractor_id": contractor_id,
        "event_type": event_type,
        "message": "This is a test webhook event"
    }
    
    background_tasks.add_task(trigger_webhook, contractor_id, event_type, test_data)
    
    return {
        "success": True,
        "message": f"Test webhook for {event_type} queued for delivery"
    }

@router.post("/measurement/eagleview")
async def mock_eagleview_measurement(address: str):
    base_sqft = random.randint(1800, 3200)
    pitch = random.choice(["4:12", "6:12", "8:12", "10:12"])
    
    return {
        "success": True,
        "provider": "EagleView (Mock)",
        "report_id": f"EV_{random.randint(100000, 999999)}",
        "address": address,
        "measurements": {
            "total_roof_area": base_sqft,
            "main_roof_area": int(base_sqft * 0.75),
            "garage_roof_area": int(base_sqft * 0.25),
            "pitch": pitch,
            "number_of_facets": random.randint(4, 12),
            "edge_length": random.randint(180, 320),
            "ridge_length": random.randint(40, 80),
            "valley_length": random.randint(20, 60),
            "hip_length": random.randint(30, 70)
        },
        "imagery": {
            "top_down_url": f"https://mock-eagleview.com/images/{random.randint(1000, 9999)}/top.jpg",
            "north_url": f"https://mock-eagleview.com/images/{random.randint(1000, 9999)}/north.jpg",
            "south_url": f"https://mock-eagleview.com/images/{random.randint(1000, 9999)}/south.jpg",
            "east_url": f"https://mock-eagleview.com/images/{random.randint(1000, 9999)}/east.jpg",
            "west_url": f"https://mock-eagleview.com/images/{random.randint(1000, 9999)}/west.jpg"
        },
        "confidence_score": random.uniform(0.85, 0.99),
        "report_date": datetime.now().isoformat()
    }
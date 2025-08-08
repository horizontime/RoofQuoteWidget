from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from database import get_db
from models import Lead, Quote, WidgetAnalytics, Contractor
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List

router = APIRouter()

class AnalyticsEvent(BaseModel):
    contractor_id: int
    event_type: str
    event_data: dict = {}
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime

@router.post("/track")
async def track_event(event: AnalyticsEvent, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter(Contractor.id == event.contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    analytics = WidgetAnalytics(
        contractor_id=event.contractor_id,
        event_type=event.event_type,
        event_data=event.event_data,
        session_id=event.session_id,
        ip_address=event.ip_address,
        user_agent=event.user_agent
    )
    
    db.add(analytics)
    db.commit()
    
    return {"success": True, "message": "Event tracked"}

@router.get("/contractor/{contractor_id}/dashboard")
async def get_dashboard_stats(
    contractor_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    total_leads = db.query(func.count(Lead.id)).filter(
        and_(Lead.contractor_id == contractor_id, Lead.created_at >= cutoff_date)
    ).scalar()
    
    new_leads = db.query(func.count(Lead.id)).filter(
        and_(
            Lead.contractor_id == contractor_id,
            Lead.status == "new",
            Lead.created_at >= cutoff_date
        )
    ).scalar()
    
    total_quotes = db.query(func.count(Quote.id)).join(Lead).filter(
        and_(Lead.contractor_id == contractor_id, Quote.created_at >= cutoff_date)
    ).scalar()
    
    total_value = db.query(func.sum(Quote.total_price)).join(Lead).filter(
        and_(Lead.contractor_id == contractor_id, Quote.created_at >= cutoff_date)
    ).scalar() or 0
    
    avg_quote_value = total_value / total_quotes if total_quotes > 0 else 0
    
    lead_status_breakdown = db.query(
        Lead.status,
        func.count(Lead.id)
    ).filter(
        and_(Lead.contractor_id == contractor_id, Lead.created_at >= cutoff_date)
    ).group_by(Lead.status).all()
    
    tier_breakdown = db.query(
        Quote.selected_tier,
        func.count(Quote.id)
    ).join(Lead).filter(
        and_(Lead.contractor_id == contractor_id, Quote.created_at >= cutoff_date)
    ).group_by(Quote.selected_tier).all()
    
    widget_events = db.query(
        WidgetAnalytics.event_type,
        func.count(WidgetAnalytics.id)
    ).filter(
        and_(
            WidgetAnalytics.contractor_id == contractor_id,
            WidgetAnalytics.created_at >= cutoff_date
        )
    ).group_by(WidgetAnalytics.event_type).all()
    
    return {
        "period": f"Last {days} days",
        "summary": {
            "total_leads": total_leads,
            "new_leads": new_leads,
            "total_quotes": total_quotes,
            "total_value": round(total_value, 2),
            "average_quote_value": round(avg_quote_value, 2)
        },
        "lead_status": {status: count for status, count in lead_status_breakdown},
        "quote_tiers": {tier: count for tier, count in tier_breakdown},
        "widget_events": {event: count for event, count in widget_events}
    }

@router.get("/contractor/{contractor_id}/conversion")
async def get_conversion_metrics(
    contractor_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    widget_views = db.query(func.count(WidgetAnalytics.id)).filter(
        and_(
            WidgetAnalytics.contractor_id == contractor_id,
            WidgetAnalytics.event_type == "widget_view",
            WidgetAnalytics.created_at >= cutoff_date
        )
    ).scalar() or 0
    
    widget_opens = db.query(func.count(WidgetAnalytics.id)).filter(
        and_(
            WidgetAnalytics.contractor_id == contractor_id,
            WidgetAnalytics.event_type == "widget_open",
            WidgetAnalytics.created_at >= cutoff_date
        )
    ).scalar() or 0
    
    quote_requests = db.query(func.count(WidgetAnalytics.id)).filter(
        and_(
            WidgetAnalytics.contractor_id == contractor_id,
            WidgetAnalytics.event_type == "quote_request",
            WidgetAnalytics.created_at >= cutoff_date
        )
    ).scalar() or 0
    
    leads_created = db.query(func.count(Lead.id)).filter(
        and_(
            Lead.contractor_id == contractor_id,
            Lead.source == "widget",
            Lead.created_at >= cutoff_date
        )
    ).scalar() or 0
    
    quotes_generated = db.query(func.count(Quote.id)).join(Lead).filter(
        and_(
            Lead.contractor_id == contractor_id,
            Lead.source == "widget",
            Quote.created_at >= cutoff_date
        )
    ).scalar() or 0
    
    view_to_open_rate = (widget_opens / widget_views * 100) if widget_views > 0 else 0
    open_to_quote_rate = (quote_requests / widget_opens * 100) if widget_opens > 0 else 0
    quote_to_lead_rate = (leads_created / quote_requests * 100) if quote_requests > 0 else 0
    
    return {
        "period": f"Last {days} days",
        "funnel": {
            "widget_views": widget_views,
            "widget_opens": widget_opens,
            "quote_requests": quote_requests,
            "leads_created": leads_created,
            "quotes_generated": quotes_generated
        },
        "conversion_rates": {
            "view_to_open": round(view_to_open_rate, 2),
            "open_to_quote": round(open_to_quote_rate, 2),
            "quote_to_lead": round(quote_to_lead_rate, 2)
        }
    }

@router.get("/contractor/{contractor_id}/quotes/summary")
async def get_quote_summary(
    contractor_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    daily_quotes = db.query(
        func.date(Quote.created_at).label('date'),
        func.count(Quote.id).label('count'),
        func.sum(Quote.total_price).label('total_value')
    ).join(Lead).filter(
        and_(
            Lead.contractor_id == contractor_id,
            Quote.created_at >= cutoff_date
        )
    ).group_by(func.date(Quote.created_at)).all()
    
    tier_summary = db.query(
        Quote.selected_tier,
        func.count(Quote.id).label('count'),
        func.avg(Quote.total_price).label('avg_price'),
        func.sum(Quote.total_price).label('total_value')
    ).join(Lead).filter(
        and_(
            Lead.contractor_id == contractor_id,
            Quote.created_at >= cutoff_date
        )
    ).group_by(Quote.selected_tier).all()
    
    size_ranges = [
        (0, 1500, "Small (< 1500 sqft)"),
        (1500, 2500, "Medium (1500-2500 sqft)"),
        (2500, 3500, "Large (2500-3500 sqft)"),
        (3500, 999999, "Extra Large (> 3500 sqft)")
    ]
    
    size_distribution = []
    for min_size, max_size, label in size_ranges:
        count = db.query(func.count(Quote.id)).join(Lead).filter(
            and_(
                Lead.contractor_id == contractor_id,
                Quote.created_at >= cutoff_date,
                Quote.roof_size_sqft >= min_size,
                Quote.roof_size_sqft < max_size
            )
        ).scalar()
        size_distribution.append({"range": label, "count": count})
    
    return {
        "period": f"Last {days} days",
        "daily_activity": [
            {
                "date": str(date),
                "quotes": count,
                "total_value": round(float(total_value or 0), 2)
            }
            for date, count, total_value in daily_quotes
        ],
        "tier_performance": [
            {
                "tier": tier,
                "count": count,
                "average_price": round(float(avg_price or 0), 2),
                "total_value": round(float(total_value or 0), 2)
            }
            for tier, count, avg_price, total_value in tier_summary
        ],
        "size_distribution": size_distribution
    }

@router.get("/contractor/{contractor_id}/leads/sources")
async def get_lead_sources(
    contractor_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    contractor = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    source_breakdown = db.query(
        Lead.source,
        func.count(Lead.id).label('count'),
        func.count(func.distinct(func.date(Lead.created_at))).label('active_days')
    ).filter(
        and_(
            Lead.contractor_id == contractor_id,
            Lead.created_at >= cutoff_date
        )
    ).group_by(Lead.source).all()
    
    source_value = db.query(
        Lead.source,
        func.sum(Quote.total_price).label('total_value'),
        func.avg(Quote.total_price).label('avg_value')
    ).join(Quote).filter(
        and_(
            Lead.contractor_id == contractor_id,
            Lead.created_at >= cutoff_date
        )
    ).group_by(Lead.source).all()
    
    source_metrics = {}
    for source, count, active_days in source_breakdown:
        source_metrics[source] = {
            "lead_count": count,
            "active_days": active_days,
            "avg_leads_per_day": round(count / active_days, 2) if active_days > 0 else 0
        }
    
    for source, total_value, avg_value in source_value:
        if source in source_metrics:
            source_metrics[source]["total_value"] = round(float(total_value or 0), 2)
            source_metrics[source]["avg_quote_value"] = round(float(avg_value or 0), 2)
    
    return {
        "period": f"Last {days} days",
        "sources": source_metrics
    }
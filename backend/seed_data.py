from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Contractor, Pricing, Branding, Template, Shingle, WidgetSettings, Lead, Quote
import uuid
import logging

logger = logging.getLogger(__name__)

def seed_database():
    db = SessionLocal()
    try:
        if db.query(Contractor).first():
            logger.info("Database already seeded, skipping...")
            return
        
        logger.info("Seeding database with mock data...")
        
        contractor = Contractor(
            company_name="Premier Roofing Solutions",
            email="info@premierroofing.com",
            phone="555-0100",
            address="123 Main St, Dallas, TX 75201",
            website="https://premierroofing.com",
            widget_id=str(uuid.uuid4())
        )
        db.add(contractor)
        db.flush()
        
        pricing = Pricing(
            contractor_id=contractor.id,
            good_tier_price=6.50,
            good_tier_name="GAF Timberline NS",
            good_tier_warranty="25-year",
            good_tier_features=["Traditional 3-tab design", "Basic wind resistance", "Standard algae protection", "25-year manufacturer warranty"],
            better_tier_price=8.75,
            better_tier_name="GAF Timberline HDZ",
            better_tier_warranty="30-year",
            better_tier_features=["Dimensional appearance", "Enhanced wind resistance (110 mph)", "Advanced algae protection", "30-year manufacturer warranty", "Better curb appeal"],
            best_tier_price=12.00,
            best_tier_name="GAF Timberline UHDZ",
            best_tier_warranty="Lifetime",
            best_tier_features=["Premium designer appearance", "Maximum wind resistance (130+ mph)", "Superior algae protection", "Lifetime manufacturer warranty", "Best curb appeal", "Enhanced energy efficiency"],
            removal_price=1.50,
            permit_price=350.00
        )
        db.add(pricing)
        
        branding = Branding(
            contractor_id=contractor.id,
            logo_url="/uploads/logo-placeholder.png",
            primary_color="#22c55e",
            secondary_color="#16a34a",
            accent_color="#15803d",
            font_family="Inter"
        )
        db.add(branding)
        
        template = Template(
            contractor_id=contractor.id,
            header_text="Professional Roof Replacement Quote",
            footer_text="Thank you for choosing Premier Roofing Solutions!",
            show_warranty=True,
            show_financing=True,
            show_testimonials=True,
            custom_message="We're committed to providing the highest quality roofing services with exceptional customer care.",
            terms_conditions="Valid for 30 days. Price subject to final inspection."
        )
        db.add(template)
        
        widget_settings = WidgetSettings(
            contractor_id=contractor.id,
            position="bottom-right",
            button_text="Get Your Free Quote",
            auto_open=False,
            delay_seconds=5,
            show_on_mobile=True
        )
        db.add(widget_settings)
        
        shingles_data = [
            {
                "brand": "GAF",
                "model": "Timberline NS",
                "tier": "good",
                "warranty_years": 25,
                "color_options": ["Charcoal", "Weathered Wood", "Shakewood", "Slate"],
                "features": ["Algae resistance", "High wind rating", "UL Class A fire rating"]
            },
            {
                "brand": "GAF",
                "model": "Timberline HDZ",
                "tier": "better",
                "warranty_years": 30,
                "color_options": ["Charcoal", "Weathered Wood", "Hickory", "Pewter Gray", "Barkwood"],
                "features": ["LayerLock Technology", "StainGuard Plus", "WindProven Limited Wind Warranty"]
            },
            {
                "brand": "GAF",
                "model": "Timberline UHDZ",
                "tier": "best",
                "warranty_years": 50,
                "color_options": ["Charcoal", "Weathered Wood", "Barkwood", "Slate", "Hickory"],
                "features": ["Ultra-dimensional appearance", "Dual Shadow Line", "Premium algae protection", "Lifetime warranty"]
            }
        ]
        
        for shingle_data in shingles_data:
            shingle = Shingle(**shingle_data)
            db.add(shingle)
        
        sample_leads = [
            {
                "contractor_id": contractor.id,
                "name": "John Smith",
                "email": "john.smith@email.com",
                "phone": "555-0101",
                "address": "456 Oak St, Dallas, TX 75202",
                "status": "new",
                "source": "widget",
                "notes": "Interested in premium shingles"
            },
            {
                "contractor_id": contractor.id,
                "name": "Sarah Johnson",
                "email": "sarah.j@email.com",
                "phone": "555-0102",
                "address": "789 Pine Ave, Dallas, TX 75203",
                "status": "contacted",
                "source": "widget",
                "notes": "Requested quote for architectural shingles"
            },
            {
                "contractor_id": contractor.id,
                "name": "Mike Wilson",
                "email": "mike.w@email.com",
                "phone": "555-0103",
                "address": "321 Elm Dr, Dallas, TX 75204",
                "status": "quoted",
                "source": "widget",
                "notes": "Comparing multiple contractors"
            }
        ]
        
        for lead_data in sample_leads:
            lead = Lead(**lead_data)
            db.add(lead)
            db.flush()
            
            quote = Quote(
                lead_id=lead.id,
                address=lead.address,
                roof_size_sqft=2500,
                selected_tier="better",
                base_price=21875.00,
                removal_cost=3750.00,
                permit_cost=350.00,
                total_price=25975.00,
                quote_data={
                    "roof_squares": 25,
                    "complexity": "moderate",
                    "pitch": "6/12",
                    "layers": 1
                }
            )
            db.add(quote)
        
        db.commit()
        logger.info("Database seeded successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    from database import Base
    Base.metadata.create_all(bind=engine)
    seed_database()
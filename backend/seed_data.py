from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Contractor, Pricing, Branding, Template, Shingle, WidgetSettings, Lead, Quote
import uuid
import logging
import random
from datetime import datetime, timedelta
from faker import Faker

logger = logging.getLogger(__name__)
fake = Faker()

def seed_database(force=False):
    db = SessionLocal()
    try:
        if not force and db.query(Contractor).first():
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
        
        # Create 75 leads with different timestamps and values
        now = datetime.utcnow()
        statuses = ["new", "contacted", "quoted", "converted", "lost"]
        tiers = ["good", "better", "best"]
        sources = ["widget", "website", "referral", "google_ads"]
        
        sample_notes = [
            "Interested in premium shingles",
            "Requested quote for architectural shingles",
            "Comparing multiple contractors",
            "Signed contract for full roof replacement",
            "Requested GAF Timberline HDZ quote",
            "Emergency repair needed",
            "Looking for eco-friendly options",
            "Wants financing information",
            "Storm damage repair needed",
            "Insurance claim assistance required",
            "Multiple property owner",
            "Commercial property quote",
            "Historic home restoration",
            "Solar panel compatible roofing",
            "Budget-conscious customer"
        ]
        
        for i in range(75):
            # Generate realistic time distributions
            if i < 5:  # Last 24 hours
                created_at = now - timedelta(hours=random.randint(1, 24))
            elif i < 15:  # Last week
                created_at = now - timedelta(days=random.randint(1, 7))
            elif i < 35:  # Last month
                created_at = now - timedelta(days=random.randint(7, 30))
            else:  # Older leads
                created_at = now - timedelta(days=random.randint(30, 90))
            
            # Generate varied roof sizes (1000-5000 sqft)
            roof_size = random.randint(1000, 5000)
            roof_squares = roof_size / 100
            
            # Select tier with weighted distribution
            tier_weights = {"good": 0.4, "better": 0.45, "best": 0.15}
            selected_tier = random.choices(
                list(tier_weights.keys()),
                weights=list(tier_weights.values())
            )[0]
            
            # Calculate prices based on tier
            if selected_tier == "good":
                price_per_sqft = 6.50
            elif selected_tier == "better":
                price_per_sqft = 8.75
            else:  # best
                price_per_sqft = 12.00
            
            base_price = roof_size * price_per_sqft
            removal_cost = roof_size * 1.50
            permit_cost = 350.00
            total_price = base_price + removal_cost + permit_cost
            
            # Generate lead data
            lead_data = {
                "contractor_id": contractor.id,
                "name": fake.name(),
                "email": fake.email(),
                "phone": fake.phone_number()[:12],  # Limit phone length
                "address": f"{fake.street_address()}, Dallas, TX {random.randint(75201, 75299)}",
                "status": random.choice(statuses),
                "source": random.choice(sources),
                "additional_notes": random.choice(sample_notes),
                "created_at": created_at
            }
            
            lead = Lead(**lead_data)
            db.add(lead)
            db.flush()
            
            # Create corresponding quote with varied values
            quote = Quote(
                lead_id=lead.id,
                address=lead.address,
                roof_size_sqft=roof_size,
                selected_tier=selected_tier,
                base_price=round(base_price, 2),
                removal_cost=round(removal_cost, 2),
                permit_cost=permit_cost,
                total_price=round(total_price, 2),
                created_at=created_at,
                quote_data={
                    "roof_squares": roof_squares,
                    "complexity": random.choice(["simple", "moderate", "complex"]),
                    "pitch": random.choice(["4/12", "5/12", "6/12", "7/12", "8/12"]),
                    "layers": random.randint(1, 3)
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

def clear_and_reseed():
    """Clear all data and reseed the database"""
    db = SessionLocal()
    try:
        logger.info("Clearing existing data...")
        # Delete in correct order to respect foreign key constraints
        db.query(Quote).delete()
        db.query(Lead).delete()
        db.query(WidgetSettings).delete()
        db.query(Template).delete()
        db.query(Branding).delete()
        db.query(Pricing).delete()
        db.query(Shingle).delete()
        db.query(Contractor).delete()
        db.commit()
        logger.info("All data cleared successfully!")
    except Exception as e:
        logger.error(f"Error clearing database: {e}")
        db.rollback()
    finally:
        db.close()
    
    # Now reseed with force=True
    seed_database(force=True)

if __name__ == "__main__":
    from database import Base
    Base.metadata.create_all(bind=engine)
    clear_and_reseed()
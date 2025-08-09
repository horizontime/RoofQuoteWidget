from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Contractor(Base):
    __tablename__ = "contractors"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(String(500))
    website = Column(String(255))
    widget_id = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    pricing = relationship("Pricing", back_populates="contractor", uselist=False, cascade="all, delete-orphan")
    branding = relationship("Branding", back_populates="contractor", uselist=False, cascade="all, delete-orphan")
    template = relationship("Template", back_populates="contractor", uselist=False, cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="contractor", cascade="all, delete-orphan")
    widget_settings = relationship("WidgetSettings", back_populates="contractor", uselist=False, cascade="all, delete-orphan")

class Pricing(Base):
    __tablename__ = "pricing"
    
    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), unique=True)
    good_tier_price = Column(Float, default=6.50)
    good_tier_name = Column(String(100), default="3-Tab Shingles")
    good_tier_warranty = Column(String(50), default="25-year")
    good_tier_features = Column(JSON, default=["Traditional 3-tab design", "Basic wind resistance", "Standard algae protection", "25-year manufacturer warranty"])
    better_tier_price = Column(Float, default=8.75)
    better_tier_name = Column(String(100), default="Architectural Shingles")
    better_tier_warranty = Column(String(50), default="30-year")
    better_tier_features = Column(JSON, default=["Dimensional appearance", "Enhanced wind resistance (110 mph)", "Advanced algae protection", "30-year manufacturer warranty", "Better curb appeal"])
    best_tier_price = Column(Float, default=12.00)
    best_tier_name = Column(String(100), default="Designer Shingles")
    best_tier_warranty = Column(String(50), default="Lifetime")
    best_tier_features = Column(JSON, default=["Premium designer appearance", "Maximum wind resistance (130+ mph)", "Superior algae protection", "Lifetime manufacturer warranty", "Best curb appeal", "Enhanced energy efficiency"])
    removal_price = Column(Float, default=1.50)
    permit_price = Column(Float, default=350.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    contractor = relationship("Contractor", back_populates="pricing")

class Branding(Base):
    __tablename__ = "branding"
    
    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), unique=True)
    logo_url = Column(String(500))
    primary_color = Column(String(7), default="#22c55e")
    secondary_color = Column(String(7), default="#16a34a")
    accent_color = Column(String(7), default="#15803d")
    font_family = Column(String(100), default="Inter")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    contractor = relationship("Contractor", back_populates="branding")

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), unique=True)
    header_text = Column(Text, default="Professional Roof Quote")
    footer_text = Column(Text, default="Thank you for choosing us!")
    show_warranty = Column(Boolean, default=True)
    show_financing = Column(Boolean, default=True)
    show_testimonials = Column(Boolean, default=True)
    custom_message = Column(Text)
    terms_conditions = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    contractor = relationship("Contractor", back_populates="template")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    address = Column(String(500), nullable=False)
    status = Column(String(50), default="new")
    source = Column(String(50), default="widget")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    contractor = relationship("Contractor", back_populates="leads")
    quotes = relationship("Quote", back_populates="lead", cascade="all, delete-orphan")

class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    address = Column(String(500), nullable=False)
    roof_size_sqft = Column(Float, nullable=False)
    selected_tier = Column(String(50))
    base_price = Column(Float, nullable=False)
    removal_cost = Column(Float, default=0)
    permit_cost = Column(Float, default=0)
    total_price = Column(Float, nullable=False)
    quote_data = Column(JSON)
    pdf_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    lead = relationship("Lead", back_populates="quotes")

class Shingle(Base):
    __tablename__ = "shingles"
    
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    tier = Column(String(50), nullable=False)
    warranty_years = Column(Integer)
    color_options = Column(JSON)
    features = Column(JSON)
    image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WidgetSettings(Base):
    __tablename__ = "widget_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), unique=True)
    position = Column(String(50), default="bottom-right")
    button_text = Column(String(100), default="Get Instant Quote")
    auto_open = Column(Boolean, default=False)
    delay_seconds = Column(Integer, default=0)
    show_on_mobile = Column(Boolean, default=True)
    custom_css = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    contractor = relationship("Contractor", back_populates="widget_settings")

class WidgetAnalytics(Base):
    __tablename__ = "widget_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"))
    event_type = Column(String(50), nullable=False)
    event_data = Column(JSON)
    session_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
#!/usr/bin/env python3
"""Script to recreate database with updated schema"""

from sqlalchemy import create_engine, text
from database import Base, engine
from models import *
import os

try:
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("Dropped all existing tables")
    
    # Create all tables with new schema
    Base.metadata.create_all(bind=engine)
    print("Created all tables with new schema")
    
    # Run seed data script
    import seed_data
    print("Database recreated and seeded successfully!")
    
except Exception as e:
    print(f"Error recreating database: {e}")
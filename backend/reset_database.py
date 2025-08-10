import os
import sys
from sqlalchemy import create_engine
from database import Base, engine
from seed_data import seed_database

def reset_database():
    """Drop all tables and recreate them with new schema"""
    try:
        # Drop all tables
        print("Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)
        print("Tables dropped successfully")
        
        # Create all tables with new schema
        print("Creating tables with new schema...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully")
        
        # Seed the database
        print("Seeding database with test data...")
        seed_database()
        print("Database reset and seeded successfully!")
        
    except Exception as e:
        print(f"Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()
#!/usr/bin/env python
"""Test script to verify backend setup"""

import sys

def check_module(module_name):
    try:
        __import__(module_name)
        print(f"[OK] {module_name} installed")
        return True
    except ImportError:
        print(f"[MISSING] {module_name} NOT installed")
        return False

print("Checking required Python packages...\n")

required_modules = [
    "fastapi",
    "uvicorn",
    "sqlalchemy",
    "pydantic",
    "pydantic_settings",
    "aiofiles",
    "httpx",
    "jose",
    "passlib",
    "dotenv"
]

all_installed = True
for module in required_modules:
    if not check_module(module):
        all_installed = False

print("\n" + "="*50)

if all_installed:
    print("[SUCCESS] All required packages are installed!")
    print("\nTrying to import backend modules...")
    try:
        import config
        print("[OK] config module loaded")
        import database
        print("[OK] database module loaded")
        import models
        print("[OK] models module loaded")
        import seed_data
        print("[OK] seed_data module loaded")
        
        print("\n[SUCCESS] Backend is ready to run!")
        print("\nTo start the server, run:")
        print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"\n[ERROR] Error importing backend modules: {e}")
else:
    print("[ERROR] Some packages are missing!")
    print("\nPlease install requirements first:")
    print("  pip install -r requirements.txt")

print("\n" + "="*50)
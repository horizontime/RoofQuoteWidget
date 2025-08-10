#!/usr/bin/env python3
"""Test script for widget lead capture"""

import requests
import json
import sys

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Test data for lead capture
lead_data = {
    "contractor_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "address": "123 Main Street, Houston, TX 77001",
    "best_time_to_call": "afternoon",
    "additional_notes": "Looking to replace old shingles before winter",
    "roof_size_sqft": 1800,
    "roof_pitch": "6/12",
    "selected_tier": "better",
    "good_tier_price": 6.50,
    "better_tier_price": 8.75,
    "best_tier_price": 12.00,
    "total_price": 15750
}

# Send POST request to widget-capture endpoint
try:
    response = requests.post(
        "http://localhost:8000/api/leads/widget-capture",
        json=lead_data
    )
    
    if response.status_code == 200:
        print("✅ Lead captured successfully!")
        print("Response:", json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Error: {response.status_code}")
        print("Response:", response.text)
        
except Exception as e:
    print(f"❌ Connection error: {e}")

# Verify lead was saved by fetching all leads
try:
    response = requests.get("http://localhost:8000/api/leads/contractor/1")
    if response.status_code == 200:
        leads = response.json()
        print(f"\n📊 Total leads in database: {len(leads)}")
        
        # Find our newly created lead
        for lead in leads:
            if lead['email'] == 'john.doe@example.com':
                print("\n✅ Found our test lead in database:")
                print(f"  Name: {lead['name']}")
                print(f"  Email: {lead['email']}")
                print(f"  Phone: {lead.get('phone', 'N/A')}")
                print(f"  Best time to call: {lead.get('best_time_to_call', 'N/A')}")
                print(f"  Additional notes: {lead.get('additional_notes', 'N/A')}")
                if lead.get('latest_quote'):
                    print(f"  Quote total: ${lead['latest_quote']['total_price']}")
                    print(f"  Selected tier: {lead['latest_quote']['selected_tier']}")
                break
except Exception as e:
    print(f"❌ Error fetching leads: {e}")
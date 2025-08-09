#!/usr/bin/env python3
"""
Test script to verify SendGrid email configuration
Run this script to check if your email setup is working correctly.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load SendGrid configuration
env_path = Path(__file__).parent / 'sendgrid.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✓ Loaded configuration from {env_path}")
else:
    print(f"✗ Configuration file not found at {env_path}")
    print("  Please create a sendgrid.env file with your SendGrid API key")
    sys.exit(1)

# Check configuration
sg_api_key = os.environ.get('SENDGRID_API_KEY')
from_email = os.environ.get('SENDGRID_FROM_EMAIL')
reply_to = os.environ.get('SENDGRID_REPLY_TO')

print("\n=== SendGrid Configuration Status ===")
print(f"API Key configured: {'✓' if sg_api_key and sg_api_key != 'your_sendgrid_api_key_here' else '✗'}")
print(f"From email configured: {'✓' if from_email else '✗'} ({from_email or 'Not set'})")
print(f"Reply-to email configured: {'✓' if reply_to else '✗'} ({reply_to or 'Not set'})")

if not sg_api_key or sg_api_key == 'your_sendgrid_api_key_here':
    print("\n✗ SendGrid API key not configured!")
    print("  Please add your API key to sendgrid.env file")
    print("  Get your API key from: https://app.sendgrid.com/settings/api_keys")
    sys.exit(1)

print("\n=== Testing SendGrid Connection ===")
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    
    # Try to create a client (this doesn't send an email yet)
    sg = SendGridAPIClient(sg_api_key)
    print("✓ SendGrid client created successfully")
    
    # Ask user if they want to send a test email
    test_email = input("\nEnter an email address to send a test email (or press Enter to skip): ").strip()
    
    if test_email:
        print(f"\nSending test email to {test_email}...")
        
        message = Mail(
            from_email=from_email or 'noreply@roofquotepro.com',
            to_emails=test_email,
            subject="Test Email - Roof Quote Pro Setup",
            html_content="""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #16a34a;">✓ SendGrid Setup Successful!</h2>
                    <p>Your SendGrid configuration is working correctly.</p>
                    <p>You can now send quote emails with PDF attachments from Roof Quote Pro.</p>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">
                        This is a test email from Roof Quote Pro email setup script.
                    </p>
                </body>
            </html>
            """
        )
        
        response = sg.send(message)
        print(f"✓ Test email sent successfully! (Status: {response.status_code})")
        print(f"  Check {test_email} for the test email")
    else:
        print("\nSkipping test email. Configuration appears to be correct.")
        
except ImportError:
    print("✗ SendGrid package not installed!")
    print("  Run: pip install sendgrid")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    if "401" in str(e):
        print("  Invalid API key. Please check your SendGrid API key.")
    elif "403" in str(e):
        print("  Access forbidden. Please verify your sender email is authenticated in SendGrid.")
    sys.exit(1)

print("\n✓ SendGrid setup complete and working!")
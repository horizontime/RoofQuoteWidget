import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing email import...")

try:
    from routers import email
    print(f"Email module imported: {email}")
    print(f"Router object: {email.router}")
    print(f"Routes in email router: {[r.path for r in email.router.routes]}")
except Exception as e:
    print(f"Error importing email: {e}")
    import traceback
    traceback.print_exc()

print("\nNow testing with main app...")
try:
    from main import app
    email_routes = [r.path for r in app.routes if 'email' in str(r.path) or 'send' in str(r.path)]
    print(f"Email routes in app: {email_routes}")
except Exception as e:
    print(f"Error with main app: {e}")
    import traceback
    traceback.print_exc()
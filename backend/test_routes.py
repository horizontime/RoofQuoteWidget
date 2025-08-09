from main import app

print("All routes in the application:")
for route in app.routes:
    if hasattr(route, 'path'):
        print(f"  {route.path}")
        if 'email' in route.path or 'send' in route.path:
            print(f"    -> Methods: {route.methods if hasattr(route, 'methods') else 'N/A'}")
            print(f"    -> Name: {route.name if hasattr(route, 'name') else 'N/A'}")
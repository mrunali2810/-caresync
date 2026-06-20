import os
import sys
from dotenv import load_dotenv

# Add the current folder to sys.path so config can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load configurations
load_dotenv()

def verify_connection():
    print(">>> Initializing Supabase Connection Verification...")
    try:
        from config import supabase
        print("[OK] Config loaded and Supabase client initialized successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase client: {e}")
        return False

    # 1. Test connection and verify public.users table
    try:
        print(">>> Testing connection to 'users' table...")
        res = supabase.table("users").select("id, name, email").execute()
        print(f"[OK] Successfully connected to 'users' table. Count: {len(res.data)}")
        if res.data:
            print("  Seeded users found:")
            for u in res.data:
                print(f"  - {u.get('name')} ({u.get('email')})")
        else:
            print("  [WARN] WARNING: No users found in public.users. Make sure to run schema.sql first.")
    except Exception as e:
        print(f"[ERROR] Failed to query 'users' table: {e}")
        print("  Tip: Make sure you ran schema.sql inside your Supabase project's SQL editor.")
        return False

    # 2. Verify appointments table
    try:
        print(">>> Testing connection to 'appointments' table...")
        res = supabase.table("appointments").select("id", count="exact").execute()
        total_count = res.count if res.count is not None else len(res.data)
        print(f"[OK] Successfully connected to 'appointments' table. Total Bookings: {total_count}")
    except Exception as e:
        print(f"[ERROR] Failed to query 'appointments' table: {e}")
        print("  Tip: Make sure you ran schema.sql inside your Supabase project's SQL editor.")
        return False

    print("\nDATABASE INTEGRATION VERIFIED SUCCESSFULLY!")
    return True

if __name__ == "__main__":
    success = verify_connection()
    sys.exit(0 if success else 1)

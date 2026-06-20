import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

class Config:
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "super-secret-hospital-jwt-key")
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.")

# Initialize Supabase Client
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

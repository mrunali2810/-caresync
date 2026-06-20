import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-dev-key")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL not found")
    if not SUPABASE_KEY:
        raise ValueError("SUPABASE_KEY not found")

supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
import os
from dotenv import load_dotenv

load_dotenv()

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Supabase Settings
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if GEMINI_API_KEY:
    os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
if GROQ_API_KEY:
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY

CROP_CATEGORIES = {
    "CULINARY_BULK": [
        "ginger", "adrak", "garlic", "lahsun", "chilli", "mirchi",
        "coriander", "dhaniya", "mint", "pudina", "lemon", "nimbu"
    ],
    "INDUSTRIAL_PROCESSING": [
        "tomato", "tamatar", "potato", "aloo", "onion", "pyaz",
        "sugarcane", "ganna"
    ],
    "STORABLE_GRAINS": [
        "wheat", "gehu", "rice", "chawal", "turmeric", "haldi",
        "soybean", "mustard", "sarson", "gram", "chana"
    ]
}

def get_crop_salvage_type(crop_name: str) -> str:
    normalized = crop_name.lower().strip()
    for crop in CROP_CATEGORIES["CULINARY_BULK"]:
        if crop in normalized:
            return "CULINARY_BULK"
    for crop in CROP_CATEGORIES["STORABLE_GRAINS"]:
        if crop in normalized:
            return "STORABLE_GRAINS"
    return "INDUSTRIAL_PROCESSING"
from serpapi import GoogleSearch
from api.config import SERPAPI_API_KEY, get_crop_salvage_type

def search_maps(query: str, limit: int = 4) -> list[dict]:
    """Queries SerpApi Google Maps and extracts structured business results."""
    params = {
        "engine": "google_maps",
        "q": query,
        "api_key": SERPAPI_API_KEY,
        "gl": "in",
        "hl": "en"
    }
    search = GoogleSearch(params)
    data = search.get_dict()
    
    places = []
    # Parse local results returned by Google Maps engine
    for item in data.get("local_results", [])[:limit]:
        places.append({
            "title": item.get("title", "Unknown Entity"),
            "address": item.get("address", "Address unavailable"),
            "phone": item.get("phone", "Contact on site"),
            "rating": item.get("rating", "N/A"),
            "reviews": item.get("reviews", 0),
            "type": item.get("type", "Agricultural Buyer")
        })
    return places

def find_nearby_mandis(district: str) -> list[dict]:
    """Finds top APMC wholesale markets in or surrounding the district."""
    query = f"APMC market mandi near {district}"
    return search_maps(query, limit=3)

def find_distress_salvage_buyers(crop: str, district: str) -> list[dict]:
    """
    Dynamically routes salvage queries based on crop classification:
    - Culinary Bulk (ginger, chilli): Dhabas, banquet caterers, high-capacity hotels
    - Industrial Processing (tomato, potato): Puree units, dehydration factories, cold storage
    - Storable Grains (wheat, turmeric): Agro godowns, grain warehouses, mills
    """
    crop_type = get_crop_salvage_type(crop)
    
    if crop_type == "CULINARY_BULK":
        query = f"hotels OR restaurants OR bulk caterers in {district}"
        tag = "Commercial Kitchen / Hotel"
    elif crop_type == "STORABLE_GRAINS":
        query = f"grain warehouse OR agro cold storage near {district}"
        tag = "Warehouse / Cold Storage"
    else:  # INDUSTRIAL_PROCESSING
        query = f"{crop} processing plant OR food factory OR cold storage near {district}"
        tag = "Industrial Processor / Cold Storage"

    results = search_maps(query, limit=4)
    for entry in results:
        entry["buyer_category"] = tag
        
    return results
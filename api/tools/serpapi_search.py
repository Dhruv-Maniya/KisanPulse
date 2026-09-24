from serpapi import GoogleSearch
from api.config import SERPAPI_API_KEY

def get_serpapi_search(query: str, engine: str = "google", **extra_params) -> dict:
    """Helper to query SerpApi."""
    params = {
        "engine": engine,
        "q": query,
        "api_key": SERPAPI_API_KEY,
        "gl": "in",  # Geolocation: India
        "hl": "en",
        **extra_params
    }
    search = GoogleSearch(params)
    return search.get_dict()

def fetch_mandi_prices(crop: str, district: str) -> list[dict]:
    """Fetches latest APMC mandi rates for a crop in and around a district."""
    query = f"{crop} APMC mandi modal price today {district} per quintal"
    data = get_serpapi_search(query)
    
    results = []
    for item in data.get("organic_results", [])[:4]:
        results.append({
            "title": item.get("title", ""),
            "snippet": item.get("snippet", ""),
            "link": item.get("link", "")
        })
    return results

def fetch_diesel_price(district: str) -> str:
    """Fetches the current retail diesel price per litre in the target district."""
    query = f"diesel price today in {district}"
    data = get_serpapi_search(query)
    
    if "answer_box" in data:
        box = data["answer_box"]
        return box.get("result") or box.get("snippet") or str(box)
    
    organic = data.get("organic_results", [])
    if organic:
        return organic[0].get("snippet", "Approx. ₹92/litre")
    return "₹92.50 per litre (Regional Average)"

def verify_buyer_claim(crop: str, claimed_market: str) -> list[dict]:
    """Uses Google News to verify claims about market crashes or strikes."""
    query = f"{claimed_market} mandi {crop} price arrival crash"
    data = get_serpapi_search(query, engine="google_news")
    
    news_items = []
    for news in data.get("news_results", [])[:3]:
        news_items.append({
            "title": news.get("title", ""),
            "source": news.get("source", {}).get("name", "Local News"),
            "date": news.get("date", ""),
            "snippet": news.get("snippet", news.get("title", ""))
        })
    return news_items
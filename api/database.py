from supabase import create_client, Client
from api.config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[Supabase Warning] Failed to initialize client: {e}")

def get_or_create_farmer(phone: str, district: str = "", language: str = "hi") -> dict:
    """Retrieves or registers a farmer profile."""
    if not supabase:
        return {"phone": phone, "district": district, "preferred_language": language}

    try:
        res = supabase.table("farmers").select("*").eq("phone", phone).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        
        insert_res = supabase.table("farmers").insert({
            "phone": phone,
            "district": district,
            "preferred_language": language
        }).execute()
        return insert_res.data[0] if insert_res.data else {}
    except Exception as e:
        print(f"[Supabase Error] get_or_create_farmer: {e}")
        return {}

def save_analysis_record(farmer_phone: str, pipeline_result: dict) -> str | None:
    """Stores True-Net calculations, bluff verifications, and distress records."""
    if not supabase:
        return None

    try:
        # Determine best mandi
        comparisons = pipeline_result.get("arbitrage_comparison", [])
        best_mandi = max(comparisons, key=lambda x: x.get("net_take_home", 0)) if comparisons else {}

        # 1. Save Arbitrage Record
        arb_data = {
            "farmer_phone": farmer_phone or "guest",
            "crop": pipeline_result.get("crop", ""),
            "district": pipeline_result.get("district", ""),
            "quantity_quintals": pipeline_result.get("quantity_qtl", 0.0),
            "diesel_rate": pipeline_result.get("diesel_rate", 0.0),
            "best_mandi": best_mandi.get("name", "N/A"),
            "net_take_home": best_mandi.get("net_take_home", 0.0),
            "arbitrage_comparison": comparisons,
            "arbitrage_verdict": pipeline_result.get("arbitrage_verdict", "")
        }
        res_arb = supabase.table("arbitrage_records").insert(arb_data).execute()
        record_id = res_arb.data[0]["id"] if res_arb.data else None

        # 2. Save Bluff Report if applicable
        bluff = pipeline_result.get("bluff_analysis")
        if bluff and record_id:
            supabase.table("bluff_reports").insert({
                "arbitrage_id": record_id,
                "farmer_phone": farmer_phone or "guest",
                "crop": pipeline_result.get("crop", ""),
                "trader_claim": bluff.get("claim", ""),
                "buyer_quote_per_kg": bluff.get("buyer_offered_kg", 0.0),
                "bluff_score": bluff.get("bluff_score", "LOW"),
                "margin_gap_pct": bluff.get("margin_gap_pct", 0.0),
                "counter_script": bluff.get("counter_script", "")
            }).execute()

        # 3. Save Distress Offtake if active
        if pipeline_result.get("is_distress_active") and pipeline_result.get("distress_contacts"):
            supabase.table("distress_records").insert({
                "crop": pipeline_result.get("crop", ""),
                "district": pipeline_result.get("district", ""),
                "salvage_contacts": pipeline_result.get("distress_contacts", [])
            }).execute()

        return record_id
    except Exception as e:
        print(f"[Supabase Error] save_analysis_record: {e}")
        return None

def get_farmer_history(phone: str, limit: int = 5) -> list[dict]:
    """Fetches recent market inquiries run by this farmer."""
    if not supabase:
        return []
    try:
        res = supabase.table("arbitrage_records") \
            .select("*") \
            .eq("farmer_phone", phone) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase Error] get_farmer_history: {e}")
        return []
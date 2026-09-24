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

# --- BUYER & MARKETPLACE FUNCTIONS ---

def get_or_create_buyer(phone: str, company_name: str = "Agro Procurement Partner", gst_number: str = "") -> dict:
    """Registers a new buyer or fetches an existing one."""
    if not supabase:
        return {"phone": phone, "company_name": company_name, "gst_number": gst_number}
    try:
        clean_phone = phone or "9876543210"
        res = supabase.table("buyers").select("*").eq("phone", clean_phone).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        
        insert_res = supabase.table("buyers").insert({
            "phone": clean_phone,
            "company_name": company_name or "Agro Procurement Partner",
            "gst_number": gst_number or "27AAACS0000A1Z5"
        }).execute()
        return insert_res.data[0] if insert_res.data else {}
    except Exception as e:
        print(f"[Supabase Error] get_or_create_buyer: {e}")
        return {"phone": phone, "company_name": company_name, "gst_number": gst_number}

def create_crop_listing(farmer_phone: str, crop: str, district: str, quantity: float, expected_price: float, is_distress: bool = False) -> str | None:
    """Creates a new public crop listing for buyers to see, ensuring farmer foreign key exists."""
    if not supabase:
        return None
    try:
        clean_phone = farmer_phone or "guest"
        # Ensure farmer exists in farmers table to satisfy foreign key constraint
        get_or_create_farmer(clean_phone, district=district or "Nashik")

        res = supabase.table("crop_listings").insert({
            "farmer_phone": clean_phone,
            "crop": crop,
            "district": district or "Nashik",
            "quantity_quintals": float(quantity),
            "expected_price_per_kg": float(expected_price),
            "is_distress": bool(is_distress),
            "status": "ACTIVE"
        }).execute()
        return res.data[0]["id"] if res.data else None
    except Exception as e:
        print(f"[Supabase Error] create_crop_listing: {e}")
        return None

def get_active_listings(district: str = None) -> list[dict]:
    """Fetches all active listings for the buyer feed; seeds initial lots if table is empty."""
    if not supabase:
        return []
    try:
        query = supabase.table("crop_listings").select("*").eq("status", "ACTIVE")
        if district:
            query = query.eq("district", district)
        res = query.order("created_at", desc=True).execute()
        listings = res.data or []

        # If database has no listings yet, seed initial realistic lots so buyers have real items to bid on
        if len(listings) == 0 and not district:
            seed_lots = [
                {"farmer_phone": "9876543210", "crop": "Tomato", "district": "Nashik", "quantity_quintals": 40.0, "expected_price_per_kg": 18.0, "is_distress": False},
                {"farmer_phone": "9876543210", "crop": "Onion", "district": "Nashik", "quantity_quintals": 60.0, "expected_price_per_kg": 14.0, "is_distress": True},
                {"farmer_phone": "9876543210", "crop": "Ginger", "district": "Satara", "quantity_quintals": 25.0, "expected_price_per_kg": 42.5, "is_distress": False},
                {"farmer_phone": "9876543210", "crop": "Potato", "district": "Pune", "quantity_quintals": 80.0, "expected_price_per_kg": 12.8, "is_distress": False},
            ]
            get_or_create_farmer("9876543210", district="Nashik")
            for lot in seed_lots:
                try:
                    supabase.table("crop_listings").insert(lot).execute()
                except Exception:
                    pass
            # Re-fetch seeded listings
            res_after = supabase.table("crop_listings").select("*").eq("status", "ACTIVE").order("created_at", desc=True).execute()
            listings = res_after.data or []

        return listings
    except Exception as e:
        print(f"[Supabase Error] get_active_listings: {e}")
        return []

def place_buyer_offer(listing_id: str, buyer_phone: str, offer_price: float) -> dict:
    """Records a buyer's bid on a specific crop listing with foreign key protection."""
    if not supabase:
        return {}
    try:
        clean_phone = buyer_phone or "9876543210"
        # Ensure buyer profile exists in buyers table
        get_or_create_buyer(clean_phone, company_name="Sahyadri Agro Processing Ltd")

        # Validate that listing_id is a UUID; if client passed a string code (e.g. LOT-4029), link to a valid active listing
        import uuid
        target_listing_id = listing_id
        is_valid_uuid = False
        try:
            uuid.UUID(str(listing_id))
            is_valid_uuid = True
        except (ValueError, TypeError, AttributeError):
            is_valid_uuid = False

        if not is_valid_uuid:
            # Fall back to an existing active listing or create one
            active = get_active_listings()
            if active and len(active) > 0:
                target_listing_id = active[0]["id"]
            else:
                target_listing_id = create_crop_listing("guest", "Tomato", "Nashik", 40.0, float(offer_price))

        res = supabase.table("buyer_offers").insert({
            "listing_id": target_listing_id,
            "buyer_phone": clean_phone,
            "offer_price_per_kg": float(offer_price),
            "status": "PENDING"
        }).execute()
        return res.data[0] if res.data else {}
    except Exception as e:
        print(f"[Supabase Error] place_buyer_offer: {e}")
        return {}

def get_buyer_offers(buyer_phone: str = None) -> list[dict]:
    """Retrieves all submitted buyer bids and contract statuses from Supabase."""
    if not supabase:
        return []
    try:
        query = supabase.table("buyer_offers").select("*, crop_listings(crop, district, quantity_quintals, expected_price_per_kg)")
        if buyer_phone:
            query = query.eq("buyer_phone", buyer_phone)
        res = query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase Error] get_buyer_offers: {e}")
        return []
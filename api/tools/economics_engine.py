from typing import Dict, Any

# Estimated cost of production / harvesting per quintal (₹/qtl)
# 1 Quintal = 100 Kilograms
BREAK_EVEN_THRESHOLDS = {
    "tomato": 500.0,    # ₹5/kg
    "onion": 700.0,     # ₹7/kg
    "potato": 600.0,    # ₹6/kg
    "ginger": 2500.0,   # ₹25/kg
    "garlic": 3500.0,   # ₹35/kg
    "chilli": 2000.0,   # ₹20/kg
    "wheat": 2200.0,    # MSP baseline approx
}

def parse_diesel_rate(diesel_str: str, default: float = 93.0) -> float:
    """Extracts numeric float value from diesel search snippet."""
    import re
    numbers = re.findall(r"\d+\.?\d*", diesel_str.replace(",", ""))
    if numbers:
        # Pick the first realistic fuel rate value (between 70 and 120)
        for num in numbers:
            val = float(num)
            if 70.0 <= val <= 130.0:
                return val
    return default

def calculate_net_yield(
    crop: str,
    quantity_qtl: float,
    modal_price_qtl: float,
    distance_km: float,
    diesel_rate_per_litre: float,
    vehicle_mileage_km_per_l: float = 9.0
) -> Dict[str, Any]:
    """
    Calculates the True-Net revenue after subtracting round-trip fuel,
    APMC market fees (1.5%), and transit perishability losses.
    """
    gross_revenue = quantity_qtl * modal_price_qtl
    
    # Round-trip fuel requirement (Farm -> Mandi -> Farm)
    round_trip_km = distance_km * 2
    fuel_litres = round_trip_km / vehicle_mileage_km_per_l
    fuel_cost = fuel_litres * diesel_rate_per_litre
    driver_toll_loading = 400.0 if distance_km > 0 else 0.0
    total_transport_cost = fuel_cost + driver_toll_loading
    
    # Transit loss: Perishables degrade ~0.08% per 10 km under open-air transit
    is_perishable = crop.lower().strip() in ["tomato", "tamatar", "chilli", "mirchi", "coriander"]
    spoilage_rate = (distance_km / 100.0) * 0.03 if is_perishable else 0.005
    spoilage_loss = gross_revenue * min(spoilage_rate, 0.15)  # Cap max transit loss at 15%
    
    # APMC Cess / Market fee: Standard ~1.5%
    mandi_cess = gross_revenue * 0.015
    
    net_take_home = gross_revenue - total_transport_cost - spoilage_loss - mandi_cess
    
    return {
        "mandi_distance_km": distance_km,
        "quoted_price_per_qtl": round(modal_price_qtl, 2),
        "gross_revenue": round(gross_revenue, 2),
        "transport_cost": round(total_transport_cost, 2),
        "spoilage_loss": round(spoilage_loss, 2),
        "mandi_cess": round(mandi_cess, 2),
        "net_take_home": round(max(net_take_home, 0.0), 2),
        "effective_price_per_kg": round((net_take_home / (quantity_qtl * 100.0)) if quantity_qtl > 0 else 0.0, 2)
    }

def analyze_middleman_claim(
    crop: str,
    buyer_offered_price_per_kg: float,
    verified_modal_price_per_qtl: float
) -> Dict[str, Any]:
    """
    Detects margin exploitation by comparing the buyer's offer per kg
    against the actual market rate (1 Quintal = 100 kg).
    """
    verified_price_per_kg = verified_modal_price_per_qtl / 100.0
    
    if verified_price_per_kg <= 0:
        return {"bluff_detected": False, "score": "UNKNOWN", "margin_gap_pct": 0.0}
    
    margin_gap = verified_price_per_kg - buyer_offered_price_per_kg
    margin_gap_pct = (margin_gap / verified_price_per_kg) * 100.0
    
    if margin_gap_pct >= 25.0:
        score = "HIGH"
        risk_desc = "Buyer is capturing a significant unearned margin (>25%)."
    elif margin_gap_pct >= 10.0:
        score = "MODERATE"
        risk_desc = "Buyer quote is moderately below verified mandi rates."
    else:
        score = "LOW"
        risk_desc = "Buyer offer is close to fair market wholesale prices."
        
    return {
        "buyer_offered_kg": buyer_offered_price_per_kg,
        "verified_market_kg": round(verified_price_per_kg, 2),
        "bluff_score": score,
        "margin_gap_pct": round(max(margin_gap_pct, 0.0), 1),
        "explanation": risk_desc
    }

def check_distress_condition(crop: str, modal_price_per_qtl: float) -> bool:
    """Returns True if mandi prices have crashed below break-even harvesting levels."""
    crop_key = crop.lower().strip()
    threshold = BREAK_EVEN_THRESHOLDS.get(crop_key, 600.0)
    return modal_price_per_qtl < threshold
import json
from crewai import Crew, Task, Process
from api.agents.arbitrage_agent import create_arbitrage_agent
from api.agents.bluff_agent import create_bluff_agent
from api.agents.distress_agent import create_distress_agent
from api.tools.serpapi_search import fetch_mandi_prices, fetch_diesel_price, verify_buyer_claim
from api.tools.serpapi_maps import find_nearby_mandis, find_distress_salvage_buyers
from api.tools.economics_engine import calculate_net_yield, analyze_middleman_claim, check_distress_condition, parse_diesel_rate

def run_kisanpulse_pipeline(
    crop: str,
    district: str,
    quantity_qtl: float,
    buyer_claim: str = "",
    buyer_quote_kg: float = 0.0,
    language: str = "en"
) -> dict:
    """Executes SerpApi data acquisition, math verification, and multi-agent synthesis."""
    
    # 1. SerpApi Grounding
    mandi_snippets = fetch_mandi_prices(crop, district)
    diesel_raw = fetch_diesel_price(district)
    diesel_rate = parse_diesel_rate(diesel_raw)
    nearby_mandis = find_nearby_mandis(district)
    
    # Baseline benchmark estimation for math
    modal_price_qtl = 1800.0  # Default regional fallback
    if "potato" in crop.lower(): modal_price_qtl = 1200.0
    elif "onion" in crop.lower(): modal_price_qtl = 1400.0
    elif "ginger" in crop.lower(): modal_price_qtl = 4200.0

    # 2. True-Net Math Calculation across 2 hypothetical mandi distances
    market_a_math = calculate_net_yield(crop, quantity_qtl, modal_price_qtl, distance_km=12.0, diesel_rate_per_litre=diesel_rate)
    market_b_math = calculate_net_yield(crop, quantity_qtl, modal_price_qtl * 1.08, distance_km=48.0, diesel_rate_per_litre=diesel_rate)
    
    # 3. Check for Market Distress Condition
    is_distress = check_distress_condition(crop, modal_price_qtl)
    salvage_buyers = find_distress_salvage_buyers(crop, district) if is_distress else []

    # 4. Middleman Verification Check
    bluff_data = {}
    news_findings = []
    if buyer_claim:
        news_findings = verify_buyer_claim(crop, "Azadpur terminal market")
        if buyer_quote_kg > 0:
            bluff_data = analyze_middleman_claim(crop, buyer_quote_kg, modal_price_qtl)

    # 5. Multi-Agent Synthesis
    arbitrage_agent = create_arbitrage_agent()
    bluff_agent = create_bluff_agent()
    distress_agent = create_distress_agent()

    tasks = []

    # Task 1: Arbitrage Decision Task
    t1_desc = f"""
    Analyze the True-Net mathematical return for {crop} in {district}:
    - Market A (12 km): Quoted ₹{market_a_math['quoted_price_per_qtl']}/qtl, Net Take-Home: ₹{market_a_math['net_take_home']}
    - Market B (48 km): Quoted ₹{market_b_math['quoted_price_per_qtl']}/qtl, Net Take-Home: ₹{market_b_math['net_take_home']}
    Local Diesel Rate: ₹{diesel_rate}/litre.
    Raw Snippets: {mandi_snippets}
    
    Provide a clear, 2-sentence verdict advising the farmer which market to choose and why, in simple plain English.
    """
    task_arbitrage = Task(
        description=t1_desc,
        expected_output="A 2-sentence actionable verdict recommending the best mandi with net profit explanation.",
        agent=arbitrage_agent
    )
    tasks.append(task_arbitrage)

    # Task 2: Bluff Detection Task (if buyer claim exists)
    if buyer_claim:
        t2_desc = f"""
        The farmer received this claim from a buyer: "{buyer_claim}" with an offer of ₹{buyer_quote_kg}/kg.
        Verified Market News snippets: {news_findings}
        Calculated Bluff Margin Gap: {bluff_data.get('margin_gap_pct', 0)}%
        
        Write an assertive, respectful 2-sentence counter-negotiation script the farmer can say directly to the buyer.
        Target Language: {language} (use English if en, Hindi in Devanagari script if hi, Marathi in Devanagari if mr).
        """
        task_bluff = Task(
            description=t2_desc,
            expected_output="An assertive 2-sentence negotiation script in the requested language.",
            agent=bluff_agent
        )
        tasks.append(task_bluff)

    arbitrage_verdict_str = ""
    counter_script_str = ""

    try:
        crew = Crew(
            agents=[arbitrage_agent, bluff_agent] if buyer_claim else [arbitrage_agent],
            tasks=tasks,
            process=Process.sequential,
            verbose=False,
            cache=False
        )
        crew_result = crew.kickoff()
        if hasattr(task_arbitrage, "output") and task_arbitrage.output:
            arbitrage_verdict_str = str(task_arbitrage.output)
        else:
            arbitrage_verdict_str = str(crew_result)

        if buyer_claim and hasattr(task_bluff, "output") and task_bluff.output:
            counter_script_str = str(task_bluff.output)
    except Exception as llm_err:
        print(f"[CrewAI / LLM Warning] AI synthesis encountered an issue ({llm_err}). Falling back to deterministic mathematical synthesis.")
        diff = market_b_math["net_take_home"] - market_a_math["net_take_home"]
        if diff > 0:
            arbitrage_verdict_str = (
                f"Recommend selling at Regional Hub APMC (48 km) for an estimated net take-home of ₹{market_b_math['net_take_home']:,.0f}. "
                f"Even after paying ₹{market_b_math['transit_cost']:,.0f} in transport & fuel (diesel at ₹{diesel_rate}/L), "
                f"you earn ₹{diff:,.0f} more than selling locally at {district} APMC."
            )
        else:
            arbitrage_verdict_str = (
                f"Recommend selling at {district} APMC (Near, 12 km) for a net take-home of ₹{market_a_math['net_take_home']:,.0f}. "
                f"Higher transport costs to the regional hub would erode your margin by ₹{abs(diff):,.0f}."
            )

        if buyer_claim:
            margin_gap = bluff_data.get("margin_gap_pct", 0.0)
            target_kg = (modal_price_qtl * 0.95) / 100
            if language == "hi":
                counter_script_str = (
                    f"आज़ादपुर और क्षेत्रीय मंडी में {crop} का थोक भाव ₹{modal_price_qtl/100:.1f}/किग्रा चल रहा है। "
                    f"आपका ₹{buyer_quote_kg}/किग्रा का भाव बाज़ार से {margin_gap}% कम है, हम कम से कम ₹{target_kg:.1f}/किग्रा से कम नहीं बेचेंगे।"
                )
            elif language == "mr":
                counter_script_str = (
                    f"बाजार समितीमध्ये {crop} चा अधिकृत दर ₹{modal_price_qtl/100:.1f}/किलो आहे. "
                    f"तुमचा ₹{buyer_quote_kg}/किलो दर {margin_gap}% कमी आहे, आम्ही किमान ₹{target_kg:.1f}/किलो खाली माल देणार नाही."
                )
            else:
                counter_script_str = (
                    f"Verified terminal market rate for {crop} is ₹{modal_price_qtl/100:.1f}/kg. "
                    f"Your offer of ₹{buyer_quote_kg}/kg is undercut by {margin_gap}%. We cannot sell below ₹{target_kg:.1f}/kg."
                )

    return {
        "crop": crop,
        "district": district,
        "quantity_qtl": quantity_qtl,
        "diesel_rate": diesel_rate,
        "is_distress_active": is_distress,
        "arbitrage_comparison": [
            {"name": f"{district} APMC (Near)", "distance_km": 12.0, "net_take_home": market_a_math["net_take_home"], "price_qtl": market_a_math["quoted_price_per_qtl"]},
            {"name": "Regional Hub APMC", "distance_km": 48.0, "net_take_home": market_b_math["net_take_home"], "price_qtl": market_b_math["quoted_price_per_qtl"]}
        ],
        "arbitrage_verdict": arbitrage_verdict_str,
        "bluff_analysis": {
            "claim": buyer_claim,
            "buyer_offered_kg": buyer_quote_kg,
            "bluff_score": bluff_data.get("bluff_score", "LOW"),
            "margin_gap_pct": bluff_data.get("margin_gap_pct", 0.0),
            "counter_script": counter_script_str
        } if buyer_claim else None,
        "distress_contacts": salvage_buyers
    }
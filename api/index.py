import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from gtts import gTTS

from api.agents.crew_setup import run_kisanpulse_pipeline
from api.database import get_or_create_farmer, save_analysis_record, get_farmer_history

app = FastAPI(
    title="KisanPulse API",
    description="Autonomous Agricultural Market Intelligence & Arbitrage Agent Engine with Supabase Persistence",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    crop: str = Field(..., example="Tomato")
    district: str = Field(..., example="Nashik")
    quantity_quintals: float = Field(..., example=40.0)
    buyer_claim: str = Field("", example="Azadpur market crashed")
    buyer_quote_per_kg: float = Field(0.0, example=8.0)
    language: str = Field("hi", example="hi")
    farmer_phone: str = Field("guest", example="9876543210")

class SpeechRequest(BaseModel):
    text: str
    language: str = "hi"

class AuthRequest(BaseModel):
    phone: str = Field(..., example="9876543210")
    district: str = Field("", example="Nashik")
    language: str = Field("hi", example="hi")

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str

@app.get("/")
def health_check():
    return {"status": "online", "system": "KisanPulse Agent API", "database": "Supabase Active"}

@app.post("/api/auth/otp/send")
def send_otp(req: AuthRequest):
    """Registers farmer in Supabase and issues demo OTP."""
    farmer = get_or_create_farmer(req.phone, req.district, req.language)
    return {
        "success": True,
        "message": "OTP sent successfully (Use demo OTP: 123456)",
        "farmer": farmer
    }

@app.post("/api/auth/otp/verify")
def verify_otp(req: VerifyOtpRequest):
    """Verifies farmer login."""
    if req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP. Please enter 123456.")
    farmer = get_or_create_farmer(req.phone)
    return {"success": True, "token": f"kisan_token_{req.phone}", "farmer": farmer}

@app.post("/api/analyze")
def analyze_market(req: AnalysisRequest):
    """Executes multi-agent pipeline and persists results in Supabase."""
    try:
        result = run_kisanpulse_pipeline(
            crop=req.crop,
            district=req.district,
            quantity_qtl=req.quantity_quintals,
            buyer_claim=req.buyer_claim,
            buyer_quote_kg=req.buyer_quote_per_kg,
            language=req.language
        )
        
        # Persist calculations to Supabase
        record_id = save_analysis_record(req.farmer_phone, result)
        result["record_id"] = record_id

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def fetch_history(phone: str = "guest"):
    """Fetches farmer's previous search and arbitrage history."""
    history = get_farmer_history(phone)
    return {"phone": phone, "history": history}

@app.post("/api/speak")
def generate_speech(req: SpeechRequest):
    """Converts the counter-script to streaming vernacular speech audio."""
    try:
        lang_code = req.language if req.language in ["hi", "mr", "en"] else "hi"
        tts = gTTS(text=req.text, lang=lang_code if lang_code != "mr" else "hi")
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        return StreamingResponse(audio_buffer, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")
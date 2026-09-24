import os
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from gtts import gTTS

from api.agents.crew_setup import run_kisanpulse_pipeline

app = FastAPI(
    title="KisanPulse API",
    description="Autonomous Agricultural Market Intelligence & Arbitrage Agent Engine",
    version="1.0.0"
)

# Enable CORS for frontend development
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
    language: str = Field("hi", example="hi")  # 'hi', 'mr', 'en'

class SpeechRequest(BaseModel):
    text: str
    language: str = "hi"

@app.get("/")
def health_check():
    return {"status": "online", "system": "KisanPulse Agent API"}

@app.post("/api/analyze")
def analyze_market(req: AnalysisRequest):
    """Triggers SerpApi acquisition, economics math, and multi-agent synthesis."""
    try:
        result = run_kisanpulse_pipeline(
            crop=req.crop,
            district=req.district,
            quantity_qtl=req.quantity_quintals,
            buyer_claim=req.buyer_claim,
            buyer_quote_kg=req.buyer_quote_per_kg,
            language=req.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speak")
def generate_speech(req: SpeechRequest):
    """Converts the counter-script to streaming vernacular speech audio."""
    try:
        lang_code = req.language if req.language in ["hi", "mr", "en"] else "hi"
        # Marathi fallback handling if voice not natively supported by gTTS
        tts = gTTS(text=req.text, lang=lang_code if lang_code != "mr" else "hi")
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        return StreamingResponse(audio_buffer, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")
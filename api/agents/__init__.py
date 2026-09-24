import os
from api.config import GEMINI_API_KEY, GROQ_API_KEY

os.environ.setdefault("GEMINI_API_KEY", GEMINI_API_KEY)
os.environ.setdefault("GROQ_API_KEY", GROQ_API_KEY)


def get_llm_for_provider(provider: str | None = None):
    """Create a CrewAI LLM using the configured provider and a valid model name."""
    from crewai import LLM

    provider_name = (provider or ("groq" if GROQ_API_KEY else "gemini")).lower()

    if provider_name == "groq":
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is missing. Add it to your .env file or environment.")
        return LLM(
            model="groq/llama-3.3-70b-versatile",
            api_key=GROQ_API_KEY,
            temperature=0.2,
        )

    if provider_name == "gemini":
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing. Add it to your .env file or environment.")
        return LLM(
            model="gemini/gemini-3.6-flash",
            api_key=GEMINI_API_KEY,
            temperature=0.2,
        )

    raise ValueError(f"Unsupported LLM provider: {provider_name}")


def get_groq_llm():
    """Backward-compatible helper that picks a working provider-backed LLM."""
    if GROQ_API_KEY:
        return get_llm_for_provider("groq")
    if GEMINI_API_KEY:
        return get_llm_for_provider("gemini")
    raise ValueError("No API key found for Groq or Gemini. Set GROQ_API_KEY or GEMINI_API_KEY.")

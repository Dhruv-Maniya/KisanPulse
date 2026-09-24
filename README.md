# 🌾 KisanPulse — Autonomous AI Market Intelligence & Direct Agribusiness Marketplace

> **Empowering Indian farmers with real-time APMC mandi arbitrage, middleman bluff detection, emergency distress salvage, and a direct-to-buyer marketplace powered by autonomous multi-agent intelligence.**

---

## 📌 Executive Summary

Smallholder farmers in India lose up to **30–45% of potential farmgate income** due to asymmetrical market information, predatory middleman claims (e.g., *"terminal markets crashed today"*), and hidden transport economics (diesel costs and transit spoilage). 

**KisanPulse** is an autonomous multi-agent economic intelligence system and marketplace designed for Bharat. By synthesizing live search ground truth (**SerpApi Google Search & Maps**), mathematical economics, and generative multi-agent workflows (**CrewAI + Gemini 2.0 Flash**), KisanPulse delivers:
1. **True-Net Arbitrage:** Calculates net take-home pay after round-trip diesel expenses and transit decay across competing mandis.
2. **Middleman Bluff Detector:** Audits buyer claims against live terminal market news, detects unearned margin gaps, and generates assertive negotiation counter-scripts in vernacular Devanagari script (Hindi/Marathi) with spoken audio.
3. **Emergency Distress Pivot:** Automatically detects sub-break-even market collapses and identifies direct commercial off-take buyers.
4. **Agribusiness Buyer Marketplace:** A dedicated portal for commercial bulk buyers (processors, hotels) to view active farmer crop listings and place direct, transparent bids.

---

## ⚡ Core Features

### 1. 🧮 True-Net Arbitrage Engine
A quoted mandi rate is meaningless without factoring in transit friction. The AI extracts live district diesel rates and models transit perishability loss to compare local APMCs vs. regional mega-hubs, outputting an actionable economic recommendation.

### 2. 🛡️ Middleman Bluff Detector & Vernacular Wingman
Verifies trader claims against indexed agricultural news. Flags high-risk exploitation when buyer quotes drop >20% below verified modal benchmarks. Generates respectful, assertive counter-scripts in **Hindi (Devanagari)** and **Marathi**, complete with built-in text-to-speech audio playback.

### 3. 🚨 Market Distress Salvage Off-Take
Activates when APMC modal rates collapse below baseline harvesting break-even points (e.g., < ₹4.0/kg for tomatoes). Uses SerpApi Google Maps to locate non-APMC bulk commercial buyers (ketchup plants, cold storages, hotel kitchens) with tap-to-call actions.

### 4. 🛒 Direct Buyer Marketplace (Bidding Engine)
Farmers can list their crops directly on the platform. Bulk buyers and processors log into a dedicated dashboard to view the live procurement feed, filter by distress sales, and place direct price-per-kg bids, cutting out predatory middlemen entirely.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, v0 |
| **Backend API** | FastAPI (Python 3.12), Uvicorn, Pydantic |
| **Multi-Agent AI** | CrewAI, Google GenAI SDK (`gemini-2.0-flash`) |
| **Ground Truth Data**| SerpApi (Google Search, Maps, and News) |
| **Speech Engine** | gTTS (Google Text-to-Speech) streaming audio endpoint |
| **Database** | Supabase (PostgreSQL with Row Level Security) |

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v18.18.0 or higher
* **Python**: v3.11 or v3.12
* **Git**

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# SerpApi Key (for live mandi prices, diesel rates, and maps)
SERPAPI_API_KEY="your_serpapi_key"

# Primary LLM Provider
GEMINI_API_KEY="your_gemini_api_key"

# Supabase Persistence
SUPABASE_URL="[https://your-project-id.supabase.co](https://your-project-id.supabase.co)"
SUPABASE_KEY="your_supabase_anon_public_key"
# Changelog

All notable changes to the **KisanPulse** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.2.0] - 2026-09-25: Multi-Role Marketplace, Buyer Portal Supabase Persistence & Resilient AI Engine

### Added
- **Agribusiness & Buyer Portal (`/trader`):**
  - Created a dedicated market buyer dashboard styled to match the emerald and amber theme of the farmer portal.
  - Implemented procurement KPI overview cards (Active Harvests, Live District Mandis, Average APMC Modal Price, Distress Salvage Lots).
  - Built an interactive **Fair Price Radar** comparing farmer ask prices against regional APMC benchmarks.
  - Added an interactive **Direct Purchase Offer** modal with real-time discount warning badges (LOW/MODERATE/HIGH RISK) and automated counter-offer validation.
- **Trader & Buyer Supabase Persistence Integration:**
  - Fully connected the Trader Portal to Supabase via `POST /api/marketplace/offer`, `POST /api/marketplace/list`, `GET /api/marketplace/feed`, and `GET /api/marketplace/offers`.
  - Added interactive **"+ Post Requirement"** modal in the top navigation bar allowing buyers to submit custom procurement requirements (Crop, District, Quantity in Quintals, Target Budget ₹/kg, Distress flag) directly to the `crop_listings` table.
  - Connected the **Direct Purchase Offer** modal to save bids directly into `buyer_offers` in Supabase with real-time offer ID confirmation banners.
  - Added live contract synchronization on the **"My Contracts"** tab, fetching and displaying real bids and listing details directly from Supabase.
  - Added **"Supabase Live"** indicator badge in the navbar confirming real-time database connectivity.
  - Implemented `createCropListingApi` and `fetchBuyerOffersApi` helper methods in `src/lib/api.ts`.
- **Database Layer Foreign-Key & UUID Protections (`api/database.py`):**
  - Added automatic farmer creation (`get_or_create_farmer`) in `create_crop_listing` to prevent PostgreSQL foreign key constraint violation `23503`.
  - Added automatic buyer profile registration (`get_or_create_buyer`) in `place_buyer_offer` to prevent buyer phone foreign key errors.
  - Added UUID type validation and resolution for client-side lot codes to eliminate PostgreSQL syntax error `22P02: invalid input syntax for type uuid`.
  - Added automatic database seeding for `crop_listings` when empty, providing 4 realistic harvest lots (Tomato, Onion, Ginger, Potato) with real UUIDs for direct bidding.
  - Added `GET /api/marketplace/offers` endpoint in `api/index.py` for fetching all buyer offers with relational crop listing details.
- **Role-Based Routing & Authentication Flow:**
  - Unified onboarding experience routing root traffic `/` directly to `/login`.
  - Added role selection options: Farmer OTP login, Market Buyer credential login, and one-click guest explore modes for both roles.
  - Added persistent phone number tracking via `localStorage` (`kisan_phone` and `kisan_role`) to link inquiries to verified user records.
- **Client-Side Live Economics Engine (`src/lib/economics.ts`):**
  - Built an instant, reactive math calculator that updates Step 2 (True-Net Arbitrage) and Step 3 (Negotiation Wingman) dynamically whenever crop, district, quantity, or buyer quote inputs change.
  - Implemented vernacular counter-script generation locally in Hindi, Marathi, and English as an instant zero-latency preview before AI synthesis.
- **Fail-Safe Supabase Auto-Persistence for Farmer Analysis:**
  - Added guaranteed write-through persistence in `/api/analyze` ensuring every market inquiry is stored in `arbitrage_records` and `bluff_reports`, even if external LLM providers experience throttling or network latency.

### Changed
- **LLM Provider Migration to `gemini-3.5-flash-lite`:**
  - Replaced deprecated/quota-exhausted models with Google Gemini `gemini-3.5-flash-lite` in CrewAI, restoring continuous multi-agent execution with high daily limits.
- **Refactored Database Operations (`api/database.py`):**
  - Updated table insertion routines to support `CASCADE` constraints and safe foreign-key linkages across all tables (`farmers`, `arbitrage_records`, `bluff_reports`, `buyers`, `crop_listings`, `buyer_offers`).

### Fixed
- **Trader Dashboard Data Not Saving to Supabase (Root Cause Fix):**
  - Fixed `handleOfferSubmit` which previously only appended to a local React array; now transmits bids to `POST /api/marketplace/offer` and commits to `buyer_offers`.
  - Resolved `invalid input syntax for type uuid` error when bidding on lots with client string IDs by resolving to valid Supabase listing UUIDs.
  - Resolved `foreign key constraint "crop_listings_farmer_phone_fkey"` by ensuring the farmer profile exists in `farmers` before creating a listing.
- **Supabase Data Persistence Failure on Analysis (Root Cause Fix):**
  - Resolved the 500 error on `POST /api/analyze` where API quota exhaustion previously aborted execution before `save_analysis_record` could execute.
  - Added a resilient `try...except` wrapper around `crew.kickoff()` with a deterministic mathematical fallback that produces real take-home calculations and ensures database persistence is never bypassed.
- **Windows Console Charset Encoding Crash (`charmap` codec):**
  - Fixed Unicode crash (`'charmap' codec can't encode character '\U0001f680'`) by dynamically reconfiguring `sys.stdout` and `sys.stderr` to UTF-8 with replacement error handling in `api/index.py` and `api/agents/__init__.py`.
- **Missing Trader Quote Value in Database:**
  - Fixed field omission in `api/agents/crew_setup.py` by mapping `buyer_offered_kg: buyer_quote_kg` into `bluff_analysis`, ensuring `bluff_reports.buyer_quote_per_kg` accurately stores the numeric offer instead of defaulting to `0.0`.
- **TypeScript Compilation & Alignment Bugs:**
  - Fixed MouseEvent type mismatch in `src/app/login/page.tsx`.
  - Fixed UI layout container baselines and pixel alignment across dashboard metric cards and step tabs.

---

## [v1.1.0] - 2026-09-24: Dashboard & AI Integration

### Added
- Integrated the Next.js frontend dashboard with the FastAPI backend via `src/lib/api.ts`.
- Added dynamic state management (`isLoading`, `liveData`) to replace hardcoded mock data in the True-Net arbitrage UI.
- Implemented `gTTS` text-to-speech streaming for vernacular audio counter-scripts (`/api/speak`).

### Changed
- Migrated LLM provider configurations to support both Groq (`llama-3.3-70b-versatile`) and Google Gemini.
- Enhanced APMC modal price calculations to incorporate diesel rates from regional fuel outlets.

### Fixed
- Resolved LiteLLM parameter validation errors that were blocking Groq API requests.
- Fixed UI package dependencies (`@base-ui/react`, `lucide-react`, `clsx`, `tailwind-merge`) causing build failures.

---

## [v1.0.0] - 2026-09-24: Initial Hackathon Architecture

### Added
- Base CrewAI sequential setup with Mandi Arbitrage, Middleman Bluff Detection, and Emergency Distress Salvage agents.
- Integrated SerpApi for Google Search, Google Maps, and real-time agricultural news.
- Established basic Supabase persistence for `farmers`, `arbitrage_records`, `bluff_reports`, and `distress_records`.
- Created vernacular OTP mobile login screen supporting Hindi (`hi`), Marathi (`mr`), and English (`en`).
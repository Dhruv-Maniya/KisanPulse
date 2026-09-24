export interface MandiComparison {
  name: string;
  distance_km: number;
  price_qtl: number;
  net_take_home: number;
}

export interface BluffAnalysis {
  claim: string;
  bluff_score: "LOW" | "MODERATE" | "HIGH";
  margin_gap_pct: number;
  counter_script: string;
}

export interface DistressContact {
  title: string;
  address: string;
  phone: string;
  rating: string | number;
  buyer_category: string;
}

export interface AdvisoryResponse {
  crop: string;
  district: string;
  quantity_qtl: number;
  diesel_rate: number;
  is_distress_active: boolean;
  arbitrage_comparison: MandiComparison[];
  arbitrage_verdict: string;
  bluff_analysis: BluffAnalysis | null;
  distress_contacts: DistressContact[];
}

export interface AnalysisInput {
  crop: string;
  district: string;
  quantity_quintals: number;
  buyer_claim?: string;
  buyer_quote_per_kg?: number;
  language: "hi" | "mr" | "en";
}
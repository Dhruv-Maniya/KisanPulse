"use client";

import React, { useState } from "react";
import { FarmerInputForm } from "../components/FarmerInputForm";
import { ArbitrageCard } from "../components/ArbitrageCard";
import { BluffDetectorAlert } from "../components/BluffDetectorAlert";
import { DistressSalvageList } from "../components/DistressSalvageList";
import { fetchAnalysis } from "../lib/api";
import { AdvisoryResponse, AnalysisInput } from "../types";
import { Wheat, ShieldCheck, Cpu } from "lucide-react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdvisoryResponse | null>(null);
  const [currentLang, setCurrentLang] = useState("hi");
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async (input: AnalysisInput) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentLang(input.language);
      const res = await fetchAnalysis(input);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze market. Ensure the Python API is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-16 bg-slate-50">
      {/* Header Bar */}
      <header className="bg-emerald-800 text-white py-6 shadow-md border-b border-emerald-900">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/80 rounded-xl">
              <Wheat className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                KisanPulse <span className="text-xs bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full font-extrabold uppercase">Autonomous AI</span>
              </h1>
              <p className="text-xs text-emerald-100 font-medium">True-Net Mandi Arbitrage • Middleman Bluff Detector • Distress Off-Take Pivot</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-emerald-200">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-300" /> SerpApi Verified</span>
            <span className="flex items-center gap-1"><Cpu className="w-4 h-4 text-amber-300" /> CrewAI Multi-Agent</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <FarmerInputForm onSubmit={handleRunAnalysis} isLoading={loading} />

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Distress Warning Pivot if Active */}
            {data.is_distress_active && (
              <DistressSalvageList contacts={data.distress_contacts} crop={data.crop} />
            )}

            {/* Middleman Bluff Alert */}
            {data.bluff_analysis && (
              <BluffDetectorAlert crop={data.crop} bluff={data.bluff_analysis} language={currentLang} />
            )}

            {/* True Net Arbitrage Comparison */}
            <ArbitrageCard
              comparisons={data.arbitrage_comparison}
              verdict={data.arbitrage_verdict}
              dieselRate={data.diesel_rate}
            />
          </div>
        )}
      </div>
    </main>
  );
}
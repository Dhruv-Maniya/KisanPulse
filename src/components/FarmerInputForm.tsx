"use client";

import React, { useState } from "react";
import { AnalysisInput } from "../types";
import { Search, Sprout, MapPin, Scale, MessageSquareWarning, DollarSign } from "lucide-react";

interface FarmerInputFormProps {
  onSubmit: (data: AnalysisInput) => void;
  isLoading: boolean;
}

export const FarmerInputForm: React.FC<FarmerInputFormProps> = ({ onSubmit, isLoading }) => {
  const [crop, setCrop] = useState("Tomato");
  const [district, setDistrict] = useState("Nashik");
  const [quantity, setQuantity] = useState(40);
  const [buyerClaim, setBuyerClaim] = useState("Azadpur terminal market crashed");
  const [buyerQuote, setBuyerQuote] = useState(8.0);
  const [language, setLanguage] = useState<"hi" | "mr" | "en">("hi");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      crop,
      district,
      quantity_quintals: Number(quantity),
      buyer_claim: buyerClaim,
      buyer_quote_per_kg: Number(buyerQuote),
      language,
    });
  };

  const setPreset = (c: string, d: string, claim: string, quote: number) => {
    setCrop(c);
    setDistrict(d);
    setBuyerClaim(claim);
    setBuyerQuote(quote);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6">
      {/* Language Selector */}
      <div className="flex items-center justify-between border-b pb-4">
        <label className="text-sm font-bold text-slate-700">Language / भाषा / भाषा निवडा</label>
        <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-slate-50">
          {(["hi", "mr", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                language === lang ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {lang === "hi" ? "हिंदी" : lang === "mr" ? "मराठी" : "English"}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Chips */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Demos:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreset("Tomato", "Nashik", "Azadpur market crashed", 8.0)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium"
          >
            🍅 Tomato (Nashik)
          </button>
          <button
            type="button"
            onClick={() => setPreset("Ginger", "Satara", "Wholesale demand dropped", 30.0)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium"
          >
            🫚 Ginger (Satara)
          </button>
          <button
            type="button"
            onClick={() => setPreset("Onion", "Lasalgaon", "Bumper arrival crash", 9.0)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium"
          >
            🧅 Onion (Lasalgaon)
          </button>
        </div>
      </div>

      {/* Primary Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Crop Name (पीक / फसल)
          </label>
          <input
            type="text"
            required
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g. Tomato"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> District / Tehsil (जिल्हा / ज़िला)
          </label>
          <input
            type="text"
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g. Nashik"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-600" /> Quantity (Quintals / क्विंटल)
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="40"
          />
        </div>
      </div>

      {/* Middleman Claim Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MessageSquareWarning className="w-3.5 h-3.5 text-amber-600" /> Trader Claim (व्यापारी का दावा)
          </label>
          <input
            type="text"
            value={buyerClaim}
            onChange={(e) => setBuyerClaim(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            placeholder="e.g. Azadpur terminal market crashed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Buyer Offer (₹ / Kg)
          </label>
          <input
            type="number"
            step="0.5"
            value={buyerQuote}
            onChange={(e) => setBuyerQuote(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            placeholder="8.0"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Search className="w-5 h-5" />
        {isLoading ? "Running Multi-Agent Intelligence Pipeline..." : "Analyze Market & Protect My Crop"}
      </button>
    </form>
  );
};
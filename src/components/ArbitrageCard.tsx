"use client";

import React from "react";
import { MandiComparison } from "../types";
import { TrendingUp, Truck, AlertCircle } from "lucide-react";

interface ArbitrageCardProps {
  comparisons: MandiComparison[];
  verdict: string;
  dieselRate: number;
}

export const ArbitrageCard: React.FC<ArbitrageCardProps> = ({ comparisons, verdict, dieselRate }) => {
  const bestMandi = comparisons.reduce((max, item) => (item.net_take_home > max.net_take_home ? item : max), comparisons[0]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-5">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-bold text-slate-800">True-Net Arbitrage Engine</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
          <Truck className="w-3.5 h-3.5" />
          Diesel: ₹{dieselRate.toFixed(2)}/L
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comparisons.map((mandi, idx) => {
          const isWinner = mandi.name === bestMandi.name;
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 transition ${
                isWinner ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-800">{mandi.name}</span>
                {isWinner && (
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-600 text-white rounded">
                    Best Net Yield
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Distance: {mandi.distance_km} km</p>

              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Quoted Modal Rate:</span>
                  <span className="font-semibold text-slate-800">₹{mandi.price_qtl.toLocaleString()}/qtl</span>
                </div>
                <div className="flex justify-between text-base border-t border-slate-200 pt-2 mt-2">
                  <span className="font-bold text-slate-900">Net Take-Home Yield:</span>
                  <span className={`font-extrabold ${isWinner ? "text-emerald-700" : "text-slate-700"}`}>
                    ₹{mandi.net_take_home.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg">
        <p className="text-sm font-medium text-emerald-950 leading-relaxed">
          <span className="font-bold">Agent Verdict: </span>
          {verdict}
        </p>
      </div>
    </div>
  );
};
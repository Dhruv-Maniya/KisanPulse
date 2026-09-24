"use client";

import React from "react";
import { BluffAnalysis } from "../types";
import { ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";
import { AudioSpeaker } from "./AudioSpeaker";
import { WhatsAppShare } from "./WhatsAppShare";

interface BluffDetectorAlertProps {
  crop: string;
  bluff: BluffAnalysis;
  language: string;
}

export const BluffDetectorAlert: React.FC<BluffDetectorAlertProps> = ({ crop, bluff, language }) => {
  const getBadge = () => {
    switch (bluff.bluff_score) {
      case "HIGH":
        return {
          color: "bg-rose-100 text-rose-800 border-rose-300",
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
          label: "High Bluff Risk (>20% Unearned Margin Gap)",
        };
      case "MODERATE":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-300",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          label: "Moderate Exploitation Gap",
        };
      default:
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          label: "Fair Market Alignment",
        };
    }
  };

  const badge = getBadge();

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-slate-800">Middleman Bluff Detector</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
          {badge.icon}
          {badge.label}
        </div>
      </div>

      <div className="text-sm bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-700">
        <span className="font-semibold text-slate-900">Buyer Claimed: </span>
        &quot;{bluff.claim}&quot;
        <span className="ml-3 font-semibold text-rose-600">({bluff.margin_gap_pct}% below verified modal benchmark)</span>
      </div>

      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-lg space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Recommended Farmer Counter-Script</p>
        <p className="text-slate-800 text-base font-semibold leading-relaxed italic">
          &quot;{bluff.counter_script}&quot;
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <AudioSpeaker text={bluff.counter_script} language={language} />
        <WhatsAppShare crop={crop} verdict={`Bluff Gap: ${bluff.margin_gap_pct}%`} counterScript={bluff.counter_script} />
      </div>
    </div>
  );
};
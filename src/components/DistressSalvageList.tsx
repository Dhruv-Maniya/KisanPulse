"use client";

import React from "react";
import { DistressContact } from "../types";
import { Building2, Phone, MapPin, Star, AlertOctagon } from "lucide-react";

interface DistressSalvageListProps {
  contacts: DistressContact[];
  crop: string;
}

export const DistressSalvageList: React.FC<DistressSalvageListProps> = ({ contacts, crop }) => {
  if (!contacts || contacts.length === 0) return null;

  return (
    <div className="bg-rose-50/40 rounded-xl shadow-md border-2 border-rose-300 p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-rose-200 pb-3">
        <AlertOctagon className="w-6 h-6 text-rose-600" />
        <div>
          <h3 className="text-xl font-bold text-rose-950">Market Distress Detected: Direct Off-Take Pivot</h3>
          <p className="text-xs text-rose-700">Mandi modal rates dropped below break-even harvesting levels. Emergency salvage buyers identified via Google Maps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((buyer, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-800 text-sm leading-snug">{buyer.title}</h4>
              <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded">
                {buyer.buyer_category}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{buyer.address}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Rating: {buyer.rating}</span>
              </div>
              <a
                href={`tel:${buyer.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow transition"
              >
                <Phone className="w-3 h-3" />
                {buyer.phone || "Call Buyer"}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
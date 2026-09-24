"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface WhatsAppShareProps {
  crop: string;
  verdict: string;
  counterScript?: string;
}

export const WhatsAppShare: React.FC<WhatsAppShareProps> = ({ crop, verdict, counterScript }) => {
  const handleShare = () => {
    let message = `🌾 *KisanPulse Market Advisory for ${crop}*\n\n`;
    message += `📊 *Market Verdict:*\n${verdict}\n\n`;
    if (counterScript) {
      message += `🛡️ *Negotiation Counter-Script:*\n"${counterScript}"\n\n`;
    }
    message += `_Verified live via SerpApi Google Search & Maps intelligence._`;

    const encoded = encodeURI(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition"
    >
      <Share2 className="w-4 h-4" />
      WhatsApp Share
    </button>
  );
};
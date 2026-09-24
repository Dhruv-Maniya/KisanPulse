export async function sendOtpApi(phone: string, language: string) {
  const response = await fetch("/api/auth/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, language, district: "" }),
  });
  if (!response.ok) throw new Error("Failed to send OTP");
  return response.json();
}

export async function verifyOtpApi(phone: string, otp: string) {
  const response = await fetch("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  if (!response.ok) throw new Error("Invalid OTP");
  return response.json();
}

export async function fetchAnalysis(input: {
  crop?: string;
  district?: string;
  quantity_quintals?: number | string;
  buyer_claim?: string;
  buyer_quote_per_kg?: number | string;
  language?: string;
  farmer_phone?: string;
}) {
  const payload = {
    crop: input.crop ?? "Tomato",
    district: input.district ?? "Nashik",
    quantity_quintals: Number(input.quantity_quintals ?? 40),
    buyer_claim: input.buyer_claim ?? "",
    buyer_quote_per_kg: Number(input.buyer_quote_per_kg ?? 0),
    language: input.language ?? "hi",
    farmer_phone: input.farmer_phone ?? "guest",
  };

  const response = await fetch("http://localhost:8000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.detail || "Analysis failed");
  }

  return response.json();
}

export async function fetchSpeechAudio(text: string, language = "hi") {
  const response = await fetch("http://localhost:8000/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.detail || "Audio generation failed");
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

export async function fetchMarketplaceFeed(district?: string) {
  const url = district
    ? `http://localhost:8000/api/marketplace/feed?district=${encodeURIComponent(district)}`
    : `http://localhost:8000/api/marketplace/feed`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch feed");
  return response.json();
}

export async function submitBuyerOffer(listingId: string, buyerPhone: string, offerPrice: number) {
  const response = await fetch("http://localhost:8000/api/marketplace/offer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listing_id: listingId,
      buyer_phone: buyerPhone,
      offer_price_per_kg: offerPrice,
    }),
  });
  if (!response.ok) throw new Error("Failed to submit offer");
  return response.json();
}

export async function registerBuyerApi(phone: string, companyName: string, gstNumber = "") {
  const response = await fetch("http://localhost:8000/api/buyer/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      company_name: companyName,
      gst_number: gstNumber,
    }),
  });
  if (!response.ok) throw new Error("Failed to register buyer");
  return response.json();
}

export async function createCropListingApi(data: {
  farmer_phone: string;
  crop: string;
  district: string;
  quantity_quintals: number;
  expected_price_per_kg: number;
  is_distress?: boolean;
}) {
  const response = await fetch("http://localhost:8000/api/marketplace/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create crop listing");
  return response.json();
}

export async function fetchBuyerOffersApi(phone?: string) {
  const url = phone
    ? `http://localhost:8000/api/marketplace/offers?phone=${encodeURIComponent(phone)}`
    : `http://localhost:8000/api/marketplace/offers`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch offers");
  return response.json();
}
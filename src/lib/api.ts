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
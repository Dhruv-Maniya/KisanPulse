import { AnalysisInput, AdvisoryResponse } from "../types";

export async function fetchAnalysis(input: AnalysisInput): Promise<AdvisoryResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Analysis failed to complete");
  }

  return response.json();
}

export async function fetchSpeechAudio(text: string, language: string): Promise<string> {
  const response = await fetch("/api/speak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to synthesize audio");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
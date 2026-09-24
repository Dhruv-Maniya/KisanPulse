"use client";

import React, { useState } from "react";
import { Volume2, Loader2, Play, Square } from "lucide-react";
import { fetchSpeechAudio } from "../lib/api";

interface AudioSpeakerProps {
  text: string;
  language: string;
}

export const AudioSpeaker: React.FC<AudioSpeakerProps> = ({ text, language }) => {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    try {
      setLoading(true);
      const url = await fetchSpeechAudio(text, language);
      setAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio playback error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlayAudio}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow transition disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <Square className="w-4 h-4 fill-current" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      {isPlaying ? "Stop Audio" : "Listen (ऑडियो सुनें)"}
    </button>
  );
};
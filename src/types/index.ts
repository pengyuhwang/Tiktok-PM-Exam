// src/types/index.ts

export type Language = "en" | "zh";

export interface UserInput {
  topic: string;
  language: Language;
}

export interface Script {
  id: string; // Added for unique identification in UI
  style: string;
  hook: string;
  core_narrative: string;
  cta: string;
}

export interface InsightResponse {
  scripts: Script[];
  hashtags: string[];
  music_style: string;
  meta?: {
    request_id?: string;
    language?: Language;
    latency_ms?: number;
    model_used?: string;
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
}

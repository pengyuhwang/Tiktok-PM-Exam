"use client";

import { useState, useRef, useEffect } from "react";
import { UserInput, InsightResponse, ErrorResponse } from "@/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import ErrorBanner from "./ErrorBanner";
import ResultsSection from "./ResultsSection";
import { Skeleton } from "./ui/Skeleton";
import { EXAMPLE_TOPICS, UI_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Helper: Timeout wrapper for fetch
const fetchWithTimeout = async (resource: string, options: RequestInit = {}) => {
  const { timeout = 60000 } = options as any;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
};

export default function GeneratorSection() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("zh");
  
  // State Machine
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<InsightResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const t = UI_TEXT[language];

  const handleGenerate = async () => {
    // 1. Input Validation (Client Side)
    if (!topic.trim() || topic.length < 2) {
        // Optional: Local toast could go here, but button is disabled anyway
        return;
    }
    if (status === "loading") return;

    // 2. Set Loading State
    setStatus("loading");
    setError(null);
    setData(null);

    // Auto-scroll to results area immediately to show Skeleton
    setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      // 3. API Call with Timeout
      const res = await fetchWithTimeout("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, language } as UserInput),
        timeout: 60000 // 60s timeout
      });

      const result = await res.json();

      if (!res.ok) {
        // 4. Server Error Mapping
        // The backend should return a structured ErrorResponse, but we enforce the mapping here just in case
        const code = (result as ErrorResponse).code || "INTERNAL_SERVER_ERROR";
        const message = (result as ErrorResponse).message || "Something went wrong.";
        
        // Refine mapping based on HTTP Status if code is generic
        let finalCode = code;
        let retryable = (result as ErrorResponse).retryable ?? true;

        if (res.status === 401 || res.status === 403) {
            finalCode = "AUTH_ERROR";
            retryable = false;
        } else if (res.status === 429) {
            finalCode = "RATE_LIMIT_EXCEEDED";
            retryable = true;
        } else if (res.status === 400) {
            finalCode = "PROVIDER_ERROR";
            retryable = false; // Usually invalid input
        } else if (res.status >= 500) {
            finalCode = "INTERNAL_SERVER_ERROR";
            retryable = true;
        }

        throw {
            code: finalCode,
            message,
            retryable
        } as ErrorResponse;
      }

      // 5. Success
      setData(result as InsightResponse);
      setStatus("success");

    } catch (err: any) {
      console.error("Generator Error:", err);
      
      // 6. Network / Unexpected Error Mapping
      let mappedError: ErrorResponse = {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
        retryable: true
      };

      if (err.name === 'AbortError') {
        mappedError = {
            code: "NETWORK_ERROR",
            message: "Request timed out. Please check your network.",
            retryable: true
        };
      } else if (err.code) {
        // Already a structured ErrorResponse from the try block
        mappedError = err;
      } else if (!navigator.onLine) {
        mappedError = {
            code: "NETWORK_ERROR",
            message: "You are offline. Please check your connection.",
            retryable: true
        };
      }

      setError(mappedError);
      setStatus("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && topic.length >= 2 && status !== "loading") {
      handleGenerate();
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Header Area (Centered Title) */}
      <div className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          {t.title}
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* 2. Search Card (The "Box") */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-shadow hover:shadow-md max-w-3xl mx-auto">
        <div className="space-y-6">
          
          {/* Row: Input + Button */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
              <Input
                id="topic"
                placeholder={t.placeholder}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                maxLength={100}
                className="h-12 md:h-14 text-lg px-5 shadow-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl transition-all w-full disabled:bg-slate-50 disabled:text-slate-400"
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="h-5 w-5 block animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                </div>
              )}
            </div>
            
            <Button 
                onClick={handleGenerate} 
                disabled={!topic.trim() || topic.length < 2 || isLoading}
                size="lg"
                isLoading={isLoading}
                className="h-12 md:h-14 px-8 rounded-xl font-bold text-base shadow-sm bg-black hover:bg-slate-800 text-white w-full md:w-auto shrink-0 transition-transform active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
            >
                {isLoading ? (language === "zh" ? "生成中..." : "Generating...") : t.btn_generate}
            </Button>
          </div>

          {/* Row: Chips + Language */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-6 pt-2">
             
             {/* Example Chips */}
             <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  {t.try_examples}
                </span>
                {EXAMPLE_TOPICS[language].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => !isLoading && setTopic(ex)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ex}
                  </button>
                ))}
             </div>

             {/* Language Switch */}
             <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 opacity-100 transition-opacity disabled:opacity-50">
                <button
                    onClick={() => setLanguage("zh")}
                    disabled={isLoading}
                    className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        language === "zh" ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    CN
                </button>
                <button
                    onClick={() => setLanguage("en")}
                    disabled={isLoading}
                    className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        language === "en" ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    EN
                </button>
             </div>
          </div>

        </div>
      </div>

      {/* Loading State: Skeleton Grid */}
      {isLoading && (
        <div ref={resultsRef} className="pt-8 w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Meta Card Skeleton */}
            <Skeleton className="h-40 w-full rounded-2xl bg-white shadow-sm border border-slate-100" />
            
            <div className="flex items-center gap-4 my-8 opacity-30">
                <div className="h-px bg-gray-300 flex-1"></div>
                <Skeleton className="h-4 w-32" />
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* Scripts Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-96 rounded-2xl bg-white shadow-sm border border-slate-100" />
                <Skeleton className="h-96 rounded-2xl bg-white shadow-sm border border-slate-100" />
                <Skeleton className="h-96 rounded-2xl bg-white shadow-sm border border-slate-100" />
            </div>
        </div>
      )}

      {/* Error State */}
      {status === "error" && error && (
          <div ref={resultsRef} className="pt-8 max-w-3xl mx-auto">
              <ErrorBanner error={error} onRetry={handleGenerate} />
          </div>
      )}

      {/* Results State */}
      {status === "success" && data && (
        <div ref={resultsRef} className="pt-8 w-full max-w-5xl mx-auto">
          <ResultsSection data={data} />
        </div>
      )}
    </div>
  );
}
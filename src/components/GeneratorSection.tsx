"use client";

import { useState } from "react";
import { UserInput, InsightResponse, ErrorResponse } from "@/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import ErrorBanner from "./ErrorBanner";
import ResultsSection from "./ResultsSection";
import { Skeleton } from "./ui/Skeleton";

export default function GeneratorSection() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("zh");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<InsightResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, language } as UserInput),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result as ErrorResponse);
      } else {
        setData(result as InsightResponse);
      }
    } catch (err) {
      setError({
        code: "NETWORK_ERROR",
        message: "Failed to connect to the server. Please check your connection.",
        retryable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Input Section */}
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              TikTok Script Generator
            </h1>
            <p className="text-lg text-gray-600">
              Turn a simple topic into viral video concepts in seconds.
            </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Video Topic
            </label>
            <Input
              id="topic"
              placeholder="e.g. Minimalist Home Office Setup"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              maxLength={100}
              className="text-lg py-6"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setLanguage("zh")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        language === "zh" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Chinese
                </button>
                <button
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        language === "en" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    English
                </button>
            </div>
            
            <Button 
                onClick={handleGenerate} 
                disabled={!topic.trim() || topic.length < 2 || isLoading}
                size="lg"
                isLoading={isLoading}
                className="w-full sm:w-auto min-w-[120px]"
            >
                {isLoading ? "Thinking..." : "Generate Insights"}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        </div>
      )}

      {/* Error State */}
      {error && <ErrorBanner error={error} onRetry={handleGenerate} />}

      {/* Results State */}
      {data && <ResultsSection data={data} />}
    </div>
  );
}
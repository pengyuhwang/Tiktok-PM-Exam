// src/app/page.tsx
"use client"; // This is a Client Component

import { useState } from "react";
import { UserInput, InsightResponse, ErrorResponse, Language } from "@/types";
import { GeneratorSection } from "@/components/GeneratorSection";
import { ResultsSection } from "@/components/ResultsSection";
import { ErrorBanner } from "@/components/ErrorBanner";

export default function HomePage() {
  const [topic, setTopic] = useState<string>("");
  const [language, setLanguage] = useState<Language>("zh");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const handleGenerate = async () => {
    setError(null); // Clear previous errors
    setInsights(null); // Clear previous insights
    setIsLoading(true);

    const userInput: UserInput = { topic, language };

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInput),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data as ErrorResponse);
      } else {
        setInsights(data as InsightResponse);
      }
    } catch (err) {
      console.error("Client-side fetch error:", err);
      setError({
        code: "NETWORK_ERROR",
        message: "网络连接失败，请检查您的网络或稍后再试。",
        details: err instanceof Error ? err.message : String(err),
        retryable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-16">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8 text-center w-full">TikTok Creator Insight Assistant</h1>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        {/* Potentially add logo/hero section here */}
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-1 lg:text-left">
        <GeneratorSection
          topic={topic}
          setTopic={setTopic}
          language={language}
          setLanguage={setLanguage}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        {error && (
          <ErrorBanner
            message={error.message}
            details={error.details}
            onRetry={error.retryable ? handleGenerate : undefined}
          />
        )}

        {isLoading && !insights && (
          <div className="mt-8">
            {/* Simple skeleton loader, replace with actual skeleton component later */}
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-1/2 mt-4 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
            </div>
          </div>
        )}

        {insights && (
          <ResultsSection insights={insights} />
        )}
      </div>

      <footer className="flex w-full items-center justify-center border-t py-4 mt-8">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} TikTok Creator Insight Assistant. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

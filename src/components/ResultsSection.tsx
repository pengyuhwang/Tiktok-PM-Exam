"use client";

import { InsightResponse } from "@/types";
import ScriptCard from "./ScriptCard";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { useState } from "react";

interface ResultsSectionProps {
  data: InsightResponse;
}

export default function ResultsSection({ data }: ResultsSectionProps) {
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyAll = async () => {
    const text = `
TOPIC RESULTS
=============
Music Style: ${data.music_style}
Hashtags: ${data.hashtags.join(" ")}

SCRIPTS
=======
${data.scripts.map((s, i) => `
[Option ${i + 1}: ${s.style}]
Hook: ${s.hook}
Narrative: ${s.core_narrative}
CTA: ${s.cta}
`).join("\n")}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy all", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Meta Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="space-y-4 flex-1">
                    <div>
                        <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">Suggested Music</h3>
                        <div className="mt-1 flex items-center">
                             <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                             </svg>
                             <p className="text-indigo-700 font-medium">{data.music_style}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">Hashtags</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {data.hashtags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <Button variant="outline" onClick={handleCopyAll} className="bg-white whitespace-nowrap">
                    {allCopied ? "Copied All!" : "Copy All Results"}
                </Button>
            </div>
        </CardContent>
      </Card>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.scripts.map((script) => (
          <ScriptCard key={script.id} script={script} />
        ))}
      </div>
    </div>
  );
}
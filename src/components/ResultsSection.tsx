// src/components/ResultsSection.tsx
import React from "react";
import { InsightResponse } from "@/types";
import { ScriptCard } from "./ScriptCard";
import { Button } from "@/components/ui/Button";
import { cn, copyToClipboard } from "@/lib/utils"; // Assuming copyToClipboard is here
import { toast } from "react-hot-toast"; // Placeholder for toast notification

interface ResultsSectionProps {
  insights: InsightResponse;
}

export function ResultsSection({ insights }: ResultsSectionProps) {
  const handleCopyAll = async () => {
    const allContent = insights.scripts
      .map((s) => `风格: ${s.style}\nHook: ${s.hook}\n内容主体: ${s.core_narrative}\nCTA: ${s.cta}`)
      .join("\n\n---\n\n");
    const hashtags = insights.hashtags.join(" ");
    const music = `音乐风格: ${insights.music_style}`;

    const fullText = `--- TikTok 创意灵感 ---\n\n${allContent}\n\n${hashtags}\n\n${music}\n\n---`;

    const success = await copyToClipboard(fullText);
    if (success) {
      // In a real app, you'd use a proper toast library
      alert("全部内容已复制！");
    } else {
      alert("复制失败，请手动复制。");
    }
  };

  return (
    <section className="mt-8 w-full max-w-5xl">
      <h2 className="text-2xl font-bold mb-4 text-center">生成结果</h2>

      <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="font-semibold text-sm">音乐风格:</span>
          <span className="text-sm text-muted-foreground">{insights.music_style}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="font-semibold text-sm">Hashtags:</span>
          {insights.hashtags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100"
            >
              #{tag}
            </span>
          ))}
        </div>
        <Button onClick={handleCopyAll} className="w-full mt-4">
          复制全部结果
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.scripts.map((script, index) => (
          <ScriptCard key={script.id || `script-${index}`} script={script} />
        ))}
      </div>
    </section>
  );
}

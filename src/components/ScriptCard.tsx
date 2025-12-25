"use client";

import { Script, Language } from "@/types";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";
import { UI_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ScriptCardProps {
  script: Script;
  language: Language;
  index: number;
}

const THEMES = [
  { // Option 1: Sky
    cardBg: "bg-sky-200",
    borderColor: "border-sky-400",
    badgeBg: "bg-white/80",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-200",
    accentColor: "bg-sky-600",
    iconHover: "hover:bg-sky-100 hover:text-sky-700",
    sectionBorder: "border-sky-200"
  },
  { // Option 2: Emerald
    cardBg: "bg-emerald-200",
    borderColor: "border-emerald-400",
    badgeBg: "bg-white/80",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    accentColor: "bg-emerald-600",
    iconHover: "hover:bg-emerald-100 hover:text-emerald-700",
    sectionBorder: "border-emerald-200"
  },
  { // Option 3: Violet
    cardBg: "bg-violet-200",
    borderColor: "border-violet-400",
    badgeBg: "bg-white/80",
    badgeText: "text-violet-700",
    badgeBorder: "border-violet-200",
    accentColor: "bg-violet-600",
    iconHover: "hover:bg-violet-100 hover:text-violet-700",
    sectionBorder: "border-violet-200"
  }
];

export default function ScriptCard({ script, language, index }: ScriptCardProps) {
  const { showToast } = useToast();
  const t = UI_TEXT[language];

  // Select theme based on index (cycle if more than 3)
  const theme = THEMES[index % THEMES.length];

  // Text cleaning utility to handle LLM artifacts
  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\\n/g, "\n")  // Fix escaped newlines
      .replace(/\\t/g, " ")   // Fix escaped tabs
      .replace(/\\\"/g, '"');  // Fix escaped quotes
  };

  const hookText = cleanText(script.hook);
  const narrativeText = cleanText(script.core_narrative);
  const ctaText = cleanText(script.cta);

  const handleCopy = async () => {
    const text = `[${script.style}]\n\n${t.header_hook}: ${hookText}\n\n${t.header_narrative}:\n${narrativeText}\n\n${t.header_cta}: ${ctaText}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast(t.toast_copied);
    } catch (err) {
      showToast(t.toast_error, "error");
    }
  };

  // Improved Narrative Renderer: Detect lists or paragraphs
  const renderNarrative = (text: string) => {
    // 1. Fallback for empty content
    if (!text || text.trim().length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-center p-4">
                <p className="text-xs text-gray-400 italic">
                    {language === "zh" ? "（AI 未生成核心内容，请重试）" : "(No content generated. Please try again.)"}
                </p>
            </div>
        );
    }

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    // Heuristic: If multiple lines start with list markers (- or 1.), treat as list
    const isList = lines.length > 1 && lines.some(l => l.trim().match(/^[-*•]|\\d+\./));

    if (isList) {
      return (
        <ul className="space-y-3">
          {lines.map((line, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-700">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5"></span>
              <span className="flex-1">{line.replace(/^[-*•]|\\d+\./, "").trim()}</span>
            </li>
          ))}
        </ul>
      );
    }
    // Default: preserve whitespace for simple paragraphs
    return <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{text}</p>;
  };

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <Card className={cn(
      "h-full shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 p-2",
      theme.cardBg,
      theme.borderColor
    )}>
      <div className="flex flex-col h-full rounded-lg relative">
        {/* Debug Overlay (Dev Only) */}
        {isDev && (
            <div className="absolute top-0 right-0 z-50 bg-black/80 text-white text-[9px] p-1 font-mono rounded-bl-lg opacity-50 hover:opacity-100 pointer-events-none">
                ID: {script.id}<br/>
                Style: {script.style}<br/>
                Hook: {hookText.length}ch<br/>
                Narrative: {narrativeText.length}ch<br/>
                CTA: {ctaText.length}ch
            </div>
        )}

        {/* Header Bar */}
        <div className="px-5 py-4 flex justify-between items-center">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
            theme.badgeBg,
            theme.badgeText,
            theme.badgeBorder
          )}>
            {script.style}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={cn(
              "h-8 w-8 p-0 text-slate-400 rounded-full transition-all",
              theme.iconHover
            )}
            title={t.btn_copy_script}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
        </div>

        <CardContent className="flex-1 p-5 space-y-4 flex flex-col">
          {/* Section 1: Hook (High Emphasis) */}
          <div className={cn(
            "bg-white rounded-xl p-4 border relative overflow-hidden ring-1 ring-black/5",
            theme.sectionBorder
          )}>
            {/* Accent Bar */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", theme.accentColor)}>
            </div>
            
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-2">
              {t.header_hook}
            </h4>
            <p className="text-base font-semibold text-slate-900 leading-snug pl-2">
              {hookText}
            </p>
          </div>

          {/* Section 2: Narrative (Content) */}
          <div className={cn(
            "flex-1 bg-white rounded-xl p-4 border",
            theme.sectionBorder,
            isDev ? "outline outline-1 outline-dashed outline-red-300" : "" // Debug outline
          )}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t.header_narrative}
            </h4>
            <div className="min-h-[80px]">
             {renderNarrative(narrativeText)}
            </div>
          </div>

          {/* Section 3: CTA (Action) */}
          <div className={cn(
            "bg-white rounded-xl p-4 border mt-auto",
            theme.sectionBorder
          )}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t.header_cta}
            </h4>
            <p className="text-sm font-medium text-slate-700 leading-snug">
              {ctaText}
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
"use client";

import { InsightResponse } from "@/types";
import ScriptCard from "./ScriptCard";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { useToast } from "./ui/Toast";
import { UI_TEXT } from "@/lib/constants";

interface ResultsSectionProps {
  data: InsightResponse;
}

export default function ResultsSection({ data }: ResultsSectionProps) {
  const { showToast } = useToast();
  // Safe default to 'zh' if meta language is missing, or rely on explicit prop if passed (simplified here)
  const lang = (data.meta?.language === "en" || data.meta?.language === "zh") ? data.meta.language : "zh";
  const t = UI_TEXT[lang];

  const handleCopyAll = async () => {
    const text = `
TOPIC RESULTS
=============
${t.header_music}: ${data.music_style}
${t.header_tags}: ${data.hashtags.join(" ")}

SCRIPTS
=======
${data.scripts.map((s, i) => `
[Option ${i + 1}: ${s.style}]
${t.header_hook}: ${s.hook}
${t.header_narrative}: ${s.core_narrative}
${t.header_cta}: ${s.cta}
`).join("\n")} 
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      showToast(t.toast_copy_all);
    } catch (err) {
      showToast(t.toast_error, "error");
    }
  };
  
  const handleCopyTagsOnly = async () => {
    try {
        await navigator.clipboard.writeText(data.hashtags.join(" "));
        showToast(t.toast_copy_tags);
    } catch (err) {
        showToast(t.toast_error, "error");
    }
  };

  const handleCopyHashtag = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      showToast(`${t.toast_copied} ${tag}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {/* Meta Card - Improved Visuals */}
      <Card className="bg-white border border-gray-100 shadow-md overflow-hidden rounded-2xl">
        <CardContent className="p-0">
            {/* Toolbar Header */}
            <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">AI Insights Ready</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleCopyTagsOnly} className="flex-1 sm:flex-none text-xs h-9">
                        {t.btn_copy_tags}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCopyAll} className="flex-1 sm:flex-none text-xs h-9 bg-black text-white hover:bg-gray-800">
                        {t.btn_copy_all}
                    </Button>
                </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                {/* Music Section */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.header_music}</h3>
                    <div className="flex items-center gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 hover:border-indigo-200 transition-colors">
                            <div className="flex-none w-10 h-10 flex items-center justify-center bg-white rounded-lg text-indigo-600 shadow-sm border border-indigo-50">
                            <svg 
                                width="20" 
                                height="20" 
                                style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
                                className="block" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="text-sm text-indigo-900 font-medium leading-tight">{data.music_style}</p>
                            </div>
                    </div>
                </div>
                
                {/* Hashtags Section */}
                <div className="flex-[1.5]">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.header_tags}</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.hashtags.map((tag, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleCopyHashtag(tag)}
                                className="group inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95"
                                title="Click to copy hashtag"
                            >
                                <span className="mr-1 opacity-50 group-hover:opacity-100">#</span>
                                {tag.replace(/^#/, '')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 my-8 opacity-60">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generated Scripts</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {data.scripts.map((script, idx) => (
          <ScriptCard key={script.id} script={script} language={lang} index={idx} />
        ))}
      </div>
    </div>
  );
}
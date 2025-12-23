// src/components/GeneratorSection.tsx
import React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Language } from "@/types";
import { cn } from "@/lib/utils";

interface GeneratorSectionProps {
  topic: string;
  setTopic: (topic: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function GeneratorSection({
  topic,
  setTopic,
  language,
  setLanguage,
  onGenerate,
  isLoading,
}: GeneratorSectionProps) {
  const isInputValid = topic.trim().length >= 2;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <section className="w-full max-w-lg mx-auto bg-card p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <label htmlFor="topic-input" className="block text-sm font-medium text-foreground mb-2">
          输入主题 (2-50字符)
        </label>
        <Input
          id="topic-input"
          placeholder="例如：日本旅游、职场吐槽、健康饮食"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={50}
          disabled={isLoading}
        />
        {topic.trim().length < 2 && topic.length > 0 && (
          <p className="text-xs text-red-500 mt-1">主题至少需要2个字符。</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          目标语言
        </label>
        <div className="flex space-x-2">
          <Button
            variant={language === "zh" ? "default" : "outline"}
            onClick={() => handleLanguageChange("zh")}
            disabled={isLoading}
            className={cn(language === "zh" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-800 hover:bg-gray-200")}
          >
            中文
          </Button>
          <Button
            variant={language === "en" ? "default" : "outline"}
            onClick={() => handleLanguageChange("en")}
            disabled={isLoading}
            className={cn(language === "en" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-800 hover:bg-gray-200")}
          >
            English
          </Button>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!isInputValid || isLoading}
        className="w-full"
      >
        {isLoading ? "生成中..." : "生成创意"}
      </Button>
    </section>
  );
}

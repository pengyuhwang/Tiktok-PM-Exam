// src/components/ScriptCard.tsx
import React from "react";
import { Script } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/utils"; // Assuming copyToClipboard is here
import { toast } from "react-hot-toast"; // Placeholder for toast notification

interface ScriptCardProps {
  script: Script;
}

export function ScriptCard({ script }: ScriptCardProps) {
  const handleCopyScript = async () => {
    const scriptText = `风格: ${script.style}\nHook: ${script.hook}\n内容主体: ${script.core_narrative}\nCTA: ${script.cta}`;
    const success = await copyToClipboard(scriptText);
    if (success) {
      // In a real app, you'd use a proper toast library
      alert("脚本已复制！");
    } else {
      alert("复制失败，请手动复制。");
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{script.style}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-3">
          <p className="font-semibold">Hook:</p>
          <p className="text-sm text-muted-foreground">{script.hook}</p>
        </div>
        <div className="mb-3">
          <p className="font-semibold">内容主体:</p>
          <p className="text-sm text-muted-foreground">{script.core_narrative}</p>
        </div>
        <div>
          <p className="font-semibold">CTA:</p>
          <p className="text-sm text-muted-foreground">{script.cta}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopyScript} className="w-full">
          复制脚本
        </Button>
      </CardFooter>
    </Card>
  );
}

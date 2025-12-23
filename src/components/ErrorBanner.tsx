// src/components/ErrorBanner.tsx
import React from "react";
import { Button } from "@/components/ui/Button";

interface ErrorBannerProps {
  message: string;
  details?: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, details, onRetry }: ErrorBannerProps) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-8 w-full max-w-lg mx-auto"
      role="alert"
    >
      <strong className="font-bold">错误: </strong>
      <span className="block sm:inline">{message}</span>
      {details && (
        <p className="text-sm mt-2">
          <span className="font-semibold">详情:</span> {details}
        </p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button onClick={onRetry} variant="outline">
            重试
          </Button>
        </div>
      )}
    </div>
  );
}

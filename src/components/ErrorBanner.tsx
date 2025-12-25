import { ErrorResponse } from "@/types";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";

interface ErrorBannerProps {
  error: ErrorResponse;
  onRetry: () => void;
}

export default function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  return (
    <Card 
      className="bg-red-50 border-red-200 shadow-sm animate-in fade-in slide-in-from-bottom-2"
      data-error-code={error.code}
    >
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </div>
            <div>
                <h3 className="text-sm font-bold text-red-900">
                  {error.code === 'NETWORK_ERROR' ? 'Connection Error' : 'Generation Failed'}
                </h3>
                <p className="text-sm text-red-700 mt-1 leading-relaxed">
                  {error.message}
                </p>
                {/* Configuration Hint for Auth/Model Errors */}
                {(error.code === 'PROVIDER_AUTH_ERROR' || error.code === 'PROVIDER_MODEL_NOT_FOUND') && (
                    <div className="mt-2 p-2 bg-red-100/50 rounded text-xs font-mono text-red-800 border border-red-200">
                        Please check <strong>.env.local</strong> for valid ALIYUN_API_KEY / ALIYUN_MODEL_ID and restart the dev server.
                    </div>
                )}
                {/* Debug info - hidden in production visually but available in DOM */}
                {error.details && (
                  <span className="hidden" data-debug-details={error.details}></span>
                )}
            </div>
        </div>
        
        {error.retryable && (
            <Button 
                size="sm" 
                variant="outline" 
                onClick={onRetry} 
                className="w-full sm:w-auto shrink-0 bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 font-medium transition-colors"
            >
                Try Again
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
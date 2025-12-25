import { InsightResponse, ErrorResponse, Script } from "@/types";
import { getSystemPrompt, constructUserPrompt } from "./prompt";
import { generateId } from "./utils";

const API_KEY = process.env.ALIYUN_API_KEY;
const MODEL_ID = process.env.ALIYUN_MODEL_ID || "qwen-max";
const API_ENDPOINT = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

// Custom error class for structured error handling
export class ServiceError extends Error {
  code: ErrorResponse['code'];
  status: number;
  retryable: boolean;

  constructor(code: ErrorResponse['code'], message: string, status = 500, retryable = true) {
    super(message);
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

export async function generateInsights(
  topic: string, 
  language: "en" | "zh"
): Promise<InsightResponse> {
  if (!API_KEY) {
    throw new ServiceError(
      "PROVIDER_AUTH_ERROR", 
      "Missing ALIYUN_API_KEY in environment variables.", 
      500, 
      false
    );
  }

  const startTime = Date.now();
  const systemPrompt = getSystemPrompt(language);
  const userPrompt = constructUserPrompt(topic, language);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" }, 
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = JSON.stringify(errorBody);
      console.error(`[Aliyun API Error] Status: ${response.status}`, errorBody);

      // Strict Error Mapping based on Status Code
      if (response.status === 401 || response.status === 403) {
        throw new ServiceError("PROVIDER_AUTH_ERROR", "Invalid API Key or unauthorized access.", 401, false);
      }
      
      if (response.status === 429) {
        throw new ServiceError("RATE_LIMIT_EXCEEDED", "Too many requests. Please wait a moment.", 429, true);
      }

      if (response.status === 404 || (response.status === 400 && errorMsg.includes("model"))) {
        throw new ServiceError("PROVIDER_MODEL_NOT_FOUND", `Model '${MODEL_ID}' not found or invalid.`, 400, false);
      }

      // Default upstream error
      throw new ServiceError("PROVIDER_ERROR", `Upstream service error: ${response.status}`, 502, true);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new ServiceError("PROVIDER_ERROR", "Empty response from LLM provider.", 502, true);
    }

    // Clean up potential markdown code blocks
    const cleanContent = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    
    let parsed: any;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error("JSON Parse Error:", content);
      throw new ServiceError("PROVIDER_ERROR", "Failed to parse LLM response.", 502, true);
    }

    // Validate structure
    if (!Array.isArray(parsed.scripts) || parsed.scripts.length === 0) {
      throw new ServiceError("PROVIDER_ERROR", "LLM response missing scripts array.", 502, true);
    }

    // Assign IDs to scripts
    const scriptsWithIds: Script[] = parsed.scripts.map((s: any, index: number) => ({
      id: `script_${Date.now()}_${index}`,
      style: s.style || "Generic",
      hook: s.hook || "",
      core_narrative: s.core_narrative || "",
      cta: s.cta || ""
    }));

    const result: InsightResponse = {
      scripts: scriptsWithIds,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      music_style: parsed.music_style || "Upbeat trending audio",
      meta: {
        request_id: data.id || `req_${Date.now()}`,
        language,
        latency_ms: Date.now() - startTime,
        model_used: MODEL_ID,
      }
    };

    return result;

  } catch (error: any) {
    // If it's already a ServiceError, rethrow it
    if (error instanceof ServiceError) {
      throw error;
    }
    
    // Catch-all for network errors or unexpected bugs
    console.error("Unexpected Logic Error:", error);
    throw new ServiceError("INTERNAL_SERVER_ERROR", "An internal error occurred.", 500, true);
  }
}
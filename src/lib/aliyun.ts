// src/lib/aliyun.ts
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import { UserInput, InsightResponse, ErrorResponse } from "@/types";

// Placeholder for Aliyun API Key and Model ID
const ALIYUN_API_KEY = process.env.ALIYUN_API_KEY;
const ALIYUN_MODEL_ID = process.env.ALIYUN_MODEL_ID || "qwen-max"; // Default from spec
const ALIYUN_BASE_URL = process.env.ALIYUN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";

interface AliyunChatRequest {
  model: string;
  input: {
    messages: Array<{
      role: "system" | "user";
      content: string;
    }>;
  };
  parameters?: {
    result_format: "json";
    temperature?: number;
    // Add other parameters as needed based on Aliyun Bailian docs
  };
}

interface AliyunChatResponse {
  output: {
    text: string; // The raw JSON string from LLM
    finish_reason: string;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  request_id: string;
}

export async function generateInsightsAliyun(
  userInput: UserInput
): Promise<InsightResponse | ErrorResponse> {
  if (!ALIYUN_API_KEY) {
    console.error("ALIYUN_API_KEY is not set.");
    return {
      code: "MISSING_API_KEY",
      message: "API Key is not configured on the server.",
      retryable: false,
    };
  }

  const userPrompt = buildUserPrompt(userInput);

  const requestBody: AliyunChatRequest = {
    model: ALIYUN_MODEL_ID,
    input: {
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    },
    parameters: {
      result_format: "json", // Enforce JSON output
      temperature: 0.7, // Example temperature, can be tuned
    },
  };

  try {
    const response = await fetch(`${ALIYUN_BASE_URL}/llm/v1/services/aigc/text-generation/generation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ALIYUN_API_KEY}`,
        "X-DashScope-SSE": "enable", // If SSE is needed, otherwise remove
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Handle HTTP errors
      const errorData = await response.json();
      console.error("Aliyun API Error:", response.status, errorData);

      // Map common errors
      if (response.status === 429) {
        return {
          code: "RATE_LIMIT_EXCEEDED",
          message: "访问量过大，请稍后再试。",
          details: errorData.message || `Aliyun API returned ${response.status}`,
          retryable: true,
        };
      } else if (response.status === 401) {
        return {
          code: "INVALID_API_KEY",
          message: "API Key 无效，请检查配置。",
          details: errorData.message || `Aliyun API returned ${response.status}`,
          retryable: false,
        };
      }

      return {
        code: "PROVIDER_ERROR",
        message: "LLM 服务提供商返回错误。",
        details: errorData.message || `Aliyun API returned ${response.status}`,
        retryable: true, // Assuming some provider errors might be transient
      };
    }

    const data: AliyunChatResponse = await response.json();
    const rawLLMOutput = data.output.text;

    try {
      // LLM is instructed to output pure JSON, so parse it directly
      const insights: InsightResponse = JSON.parse(rawLLMOutput);

      // Add meta info from Aliyun response
      insights.meta = {
        request_id: data.request_id,
        latency_ms: 0, // Placeholder, actual latency needs to be calculated
        model_used: ALIYUN_MODEL_ID,
        language: userInput.language, // Add requested language to meta
      };

      // Add IDs to scripts for UI rendering if not provided by LLM (important for React lists)
      insights.scripts = insights.scripts.map((script, index) => ({
        ...script,
        id: script.id || `script_${index + 1}`,
      }));


      return insights;
    } catch (parseError) {
      console.error("Failed to parse LLM JSON output:", rawLLMOutput, parseError);
      return {
        code: "LLM_PARSE_ERROR",
        message: "LLM 生成内容格式异常，请重试。",
        details: `Failed to parse LLM output: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        retryable: true,
      };
    }
  } catch (networkError) {
    console.error("Network or Fetch Error:", networkError);
    return {
      code: "NETWORK_ERROR",
      message: "网络连接失败，请检查您的网络。",
      details: `Fetch failed: ${networkError instanceof Error ? networkError.message : String(networkError)}`,
      retryable: true,
    };
  }
}

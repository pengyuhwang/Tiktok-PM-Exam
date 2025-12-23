import { InsightResponse, ErrorResponse, Script } from "@/types";
import { SYSTEM_PROMPT, constructUserPrompt } from "./prompt";
import { generateId } from "./utils";

const API_KEY = process.env.ALIYUN_API_KEY;
const MODEL_ID = process.env.ALIYUN_MODEL_ID || "qwen-max";
// Using the compatible-mode endpoint for standard OpenAI-like interaction
const API_ENDPOINT = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export async function generateInsights(
  topic: string, 
  language: "en" | "zh"
): Promise<InsightResponse> {
  if (!API_KEY) {
    throw new Error("Missing ALIYUN_API_KEY");
  }

  const startTime = Date.now();
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" }, // Attempt to enforce JSON if supported, otherwise prompt handles it
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      throw new Error(`Aliyun API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from LLM");
    }

    // Clean up potential markdown code blocks if the model ignores the system prompt
    const cleanContent = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    
    let parsed: any;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error("JSON Parse Error:", content);
      throw new Error("INVALID_JSON_FORMAT");
    }

    // Validate and fix structure (Basic validation)
    if (!Array.isArray(parsed.scripts) || parsed.scripts.length === 0) {
      throw new Error("MISSING_SCRIPTS");
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
    console.error("LLM Generation Error:", error);
    throw error; // Re-throw to be handled by route
  }
}
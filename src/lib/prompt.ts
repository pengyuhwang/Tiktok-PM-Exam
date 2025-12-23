// src/lib/prompt.ts
import { UserInput } from "@/types";

export const SYSTEM_PROMPT = `你是一位深谙病毒式传播法则的 TikTok 内容策略专家。你的目标是生成高留存率的视频创意。
你必须仅输出有效的 JSON 代码。不要包含 markdown 格式（如 \`\`\`json ... \`\`\`）或任何介绍性文本。
严格遵循用户提示中提供的 JSON Schema。`;

export function buildUserPrompt(input: UserInput): string {
  const { topic, language } = input;

  // The JSON Schema for the output. This is crucial for guiding the LLM.
  const jsonSchema = {
    scripts: [
      {
        style: "字符串 (风格名称)",
        hook: "字符串 (前3秒视觉/听觉钩子)",
        core_narrative: "字符串 (核心内容大纲)",
        cta: "字符串 (行动号召)",
      },
    ],
    hashtags: ["字符串", "字符串"],
    music_style: "字符串",
  };

  return `主题: ${topic}
语言: ${language} (输出内容必须使用此语言)

任务:
1. 生成 3 个独特的 TikTok 脚本结构 (风格包括但不限于: 教育/干货, 叙事/Vlog, 争议/幽默)。
2. 生成 5-10 个高流量、相关的 Hashtags。
3. 建议 1 个背景音乐风格描述。

必须严格遵循的 JSON Schema:
${JSON.stringify(jsonSchema, null, 2)}`;
}

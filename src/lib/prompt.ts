import { Language } from "@/types";

// --- System Prompts ---

const SYSTEM_PROMPT_ZH = `
你是一位深谙病毒式传播法则的 TikTok 内容策略专家。你的目标是生成高留存率的视频创意。
你必须仅输出有效的 JSON 代码。不要包含 markdown 格式（如 code blocks）或任何介绍性文本。
严格遵循用户提示中提供的 JSON Schema。
`.trim();

const SYSTEM_PROMPT_EN = `
You are a TikTok content strategy expert specializing in viral trends. Your goal is to generate high-retention video ideas.
You must output ONLY valid JSON code. Do not include markdown formatting (like code blocks) or any introductory text.
Strictly adhere to the JSON Schema provided in the user prompt.
`.trim();

export function getSystemPrompt(language: Language): string {
  return language === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ZH;
}

// --- User Prompts ---

export function constructUserPrompt(topic: string, language: Language): string {
  if (language === "en") {
    return `
Topic: ${topic}

Task:
1. Generate 3 unique TikTok script structures (Styles including but not limited to: Educational, Narrative/Vlog, Controversial/Humor).
2. Generate 5-10 high-traffic, relevant Hashtags.
3. Suggest 1 background music style description.

Must strictly follow this JSON Schema:
{
  "scripts": [
    {
      "style": "String (Style Name)",
      "hook": "String (First 3 seconds visual/audio hook)",
      "core_narrative": "String (Core content outline. **MUST** be a list of 3-6 specific storyboard shots. Each item includes [Visual] and [Audio/Script]. Example: \\n- Visual: Close up of chopping onions. Audio: 'Don't blink'\\n- Visual: Sizzling oil. Audio: 'Listen to that')",
      "cta": "String (Call to Action)"
    }
  ],
  "hashtags": ["String", "String"],
  "music_style": "String"
}
`.trim();
  }

  // Default to ZH
  return `
主题: ${topic}

任务:
1. 生成 3 个独特的 TikTok 脚本结构 (风格包括但不限于: 教育/干货, 叙事/Vlog, 争议/幽默)。
2. 生成 5-10 个高流量、相关的 Hashtags。
3. 建议 1 个背景音乐风格描述。

必须严格遵循的 JSON Schema:
{
  "scripts": [
    {
      "style": "字符串 (风格名称)",
      "hook": "字符串 (前3秒视觉/听觉钩子)",
      "core_narrative": "字符串 (核心内容大纲。**必须**是 3-6 条具体的分镜列表，每条包含[画面]与[台词]。例如：\\n- 画面：特写切洋葱。台词：'别眨眼'\\n- 画面：放入热油。台词：'滋啦一声')",
      "cta": "字符串 (行动号召)"
    }
  ],
  "hashtags": ["字符串", "字符串"],
  "music_style": "字符串"
}
`.trim();
}
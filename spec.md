# 技术规格说明书：TikTok 创意灵感助手 (MVP)

## 1. 概览 (Overview)

**项目名称:** TikTok Creator Insight Assistant
**版本:** 0.1.0 (MVP)
**状态:** 草稿 (Draft)

### 1.1 目标 (Goal)
为内容创作者提供基于模糊主题的即时、结构化短视频灵感。系统利用阿里云百炼（Aliyun Bailian）LLM 生成脚本结构、Hashtags 和音乐风格建议，帮助用户快速从创意走向执行。

### 1.2 范围 (Scope)
- **输入:** 用户输入文本主题（例如 "日本旅游"、"职场吐槽"）并选择目标语言（中文/英文）。
- **处理:** 集成阿里云百炼 API（模型：可配置 `qwen-max` 或 `deepseek-v3`）生成洞察。
- **输出:**
  - 3 套风格各异的脚本结构（包含 Hook/黄金3秒、核心叙事、Call to Action）。
  - 5-10 个高潜力 Hashtags。
  - 1 个背景音乐风格描述。
- **界面:** 基于 Web (Next.js)，卡片式布局，支持一键复制功能。

### 1.3 非 MVP 范围 (Out of Scope)
- 用户注册/登录系统。
- 保存历史记录或“收藏”脚本。
- 直接生成视频或剪辑功能。
- 社交媒体自动发布。
- 图片生成。

---

## 2. 用户故事 (User Stories)

| ID | 故事 (Story) | 验收标准 (Acceptance Criteria) |
|----|-------|---------------------|
| **US-1** | 作为创作者，我希望输入主题和语言，以便获得相关的内容创意。 | - 输入框接受文本（最少2字符，最多50字符）。<br>- 语言切换开关支持 中/英。<br>- 输入为空时，“生成”按钮禁用。 |
| **US-2** | 作为创作者，我希望能看到 3 种不同的脚本结构，以便选择适合我的风格。 | - 界面展示 3 张卡片。<br>- 每张卡片清晰标注 "Hook"、"内容主体"、"CTA"。<br>- 风格需有显著差异（如：教育干货 vs 娱乐剧情）。 |
| **US-3** | 作为创作者，我希望能看到推荐的 Hashtags 和音乐，这样我就不用手动去查了。 | - Hashtags 以可点击/可选中的标签形式展示。<br>- 音乐风格为简短的描述文本。 |
| **US-4** | 作为创作者，我需要在等待结果时知道系统正在运行。 | - API 调用期间显示加载骨架屏 (Skeleton) 或 Loading 动画。<br>- 加载期间禁用“生成”按钮。 |
| **US-5** | 作为创作者，我希望通过简单的操作复制脚本内容，以便粘贴到我的备忘录中。 | - 每个脚本卡片上有单独的“复制”按钮。<br>- 提供“复制全部”按钮用于复制完整结果。<br>- 复制成功后显示 Toast 提示（“已复制！”）。 |
| **US-6** | 作为创作者，如果生成失败，我希望能得到通知并重试。 | - 显示用户友好的错误信息（如“网络繁忙”、“主题过长”）。<br>- 失败时提供重试按钮。 |

---

## 3. 数据模型 (Data Models)

### 3.1 输入模型 (UserInput)
```json
{
  "topic": "Home Cooking",
  "language": "en" // 枚举: ["en", "zh"]
}
```

### 3.2 输出模型 (InsightResponse)
```json
{
  "scripts": [
    {
      "id": "script_1",
      "style": "干货教学", // 例如: "叙事型", "争议型", "Tips技巧"
      "hook": "别再这样煮意面了！",
      "core_narrative": "解释为什么煮面水需要加盐的科学原理...",
      "cta": "关注我，了解更多厨房冷知识。"
    },
    {
      "id": "script_2",
      "style": "沉浸式/ASMR",
      "hook": "(切洋葱的声音) 等待那一刻的滋滋声...",
      "core_narrative": "视觉重点放在食材的纹理和烹饪过程...",
      "cta": "下一期你想看我做什么？"
    },
    {
      "id": "script_3",
      "style": "幽默/翻车",
      "hook": "今天差点把厨房炸了。",
      "core_narrative": "讲述一个照着菜谱做却失败的搞笑故事...",
      "cta": "艾特你那个不会做饭的朋友。"
    }
  ],
  "hashtags": ["#家常菜", "#大厨日常", "#炸厨房", "#美食教程", "#做饭"],
  "music_style": "轻快活泼的 Lo-Fi 节奏，带点爵士感",
  "meta": {
    "request_id": "req_123456789",
    "language": "zh",
    "latency_ms": 1250,
    "model_used": "qwen-max"
  }
}
```

### 3.3 错误模型 (ErrorResponse)
```json
{
  "code": "RATE_LIMIT_EXCEEDED", // 或 INVALID_INPUT, PROVIDER_ERROR, INTERNAL_SERVER_ERROR
  "message": "访问量过大，请 30 秒后再试。",
  "details": "Aliyun Bailian API returned 429",
  "retryable": true
}
```

---

## 4. API 接口 (API Interface)

### 4.1 生成创意 (Generate Insights)
- **Endpoint:** `POST /api/insights`
- **Content-Type:** `application/json`

#### 请求 (Request)
```json
{
  "topic": "日本独自旅行",
  "language": "zh"
}
```

#### 响应 (Response 200 OK)
见上方 `InsightResponse` 模型。

#### 响应 (4xx/5xx)
见上方 `ErrorResponse` 模型。

#### 约束条件
- **超时:** 30 秒 (LLM 生成可能较慢)。
- **速率限制:** 每个 IP 每分钟 5 次请求 (MVP 可使用简单的内存存储或 Vercel KV，或者前端防抖 + 后端简单检查)。

---

## 5. Prompt 协议 (Prompt Contract)

与阿里云百炼的交互必须强制要求 JSON 输出。

### 5.1 系统提示词 (System Prompt)
```text
你是一位深谙病毒式传播法则的 TikTok 内容策略专家。你的目标是生成高留存率的视频创意。
你必须仅输出有效的 JSON 代码。不要包含 markdown 格式（如 ```json ... ```）或任何介绍性文本。
严格遵循用户提示中提供的 JSON Schema。
```

### 5.2 用户提示结构 (User Prompt Structure)
```text
主题: {topic}
语言: {language} (输出内容必须使用此语言)

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
      "core_narrative": "字符串 (核心内容大纲)",
      "cta": "字符串 (行动号召)"
    }
  ],
  "hashtags": ["字符串", "字符串"],
  "music_style": "字符串"
}
```

---

## 6. UI 组件层级 (UI Component Hierarchy)

```text
App (布局)
└── Page (首页)
    ├── Header (标题 + Logo)
    ├── MainContent
    │   ├── GeneratorSection (生成区)
    │   │   ├── TopicInput (文本输入)
    │   │   ├── LanguageSwitch (分段控制器: EN | ZH)
    │   │   └── GenerateButton (状态: 空闲 | 加载中 | 禁用)
    │   ├── ErrorBanner (错误提示条 - 条件渲染)
    │   └── ResultsSection (结果区 - 条件渲染)
    │       ├── MetaInfo (音乐风格 + Hashtag 列表)
    │       │   ├── MusicBadge
    │       │   ├── HashtagChips (点击可单独复制?)
    │       │   └── CopyAllHashtagsButton
    │       └── ScriptsGrid (桌面端3列，移动端1列)
    │           ├── ScriptCard (映射 scripts[0])
    │           │   ├── Header (风格徽章)
    │           │   ├── Section: Hook
    │           │   ├── Section: Narrative (叙事)
    │           │   ├── Section: CTA
    │           │   └── CopyButton (复制单卡)
    │           ├── ScriptCard (映射 scripts[1])
    │           └── ScriptCard (映射 scripts[2])
    └── Footer (版权 + 版本号)
```

---

## 7. 错误处理与可观测性 (Error Handling & Observability)

### 7.1 客户端 (Client-Side)
- **输入验证:** 如果主题长度 < 2，阻止提交。
- **网络错误:** 捕获通用的 fetch 错误并显示“网络连接错误”。
- **JSON 解析错误:** 如果 LLM 返回格式错误的 JSON（极少见但可能），显示“生成格式异常，请重试”。

### 7.2 服务端 (Server-Side)
- **日志:** 在控制台打印 `request_id`, `topic` (敏感词需脱敏?), `latency` (耗时), 和 `status` (MVP 阶段)。
- **异常捕获:** 使用 Try/Catch 包裹 LLM 调用。
  - 将阿里云 SDK 错误映射为 `ErrorResponse`。
  - 特别处理 `429 Too Many Requests`，提供 `retry-after` 提示。

---

## 8. 安全 (Security)

### 8.1 环境变量 (Environment Variables)
- `ALIYUN_API_KEY`: 存储在 `.env.local` (本地开发) 和 Vercel/平台环境变量中。**严禁** 提交到 Git。
- `ALIYUN_MODEL_ID`: 例如 `qwen-max` 或 `deepseek-v3`。

### 8.2 API 安全
- **后端代理:** 前端**绝不**直接调用阿里云。所有调用必须经过 `POST /api/insights`。
- **输入清洗:** 截断输入主题至最大 100 字符，防止 Token 消耗攻击。

---

## 9. 里程碑 (Milestones)

1.  **项目初始化:** 初始化 Next.js, TypeScript, Tailwind CSS, ESLint。配置 `.env`。
2.  **后端实现:** 创建 `api/insights` 路由。集成阿里云百炼 SDK。实现 Prompt 逻辑。使用 `curl` 测试。
3.  **前端 - 输入:** 构建输入表单和 Loading 状态。
4.  **前端 - 展示:** 构建 `ScriptCard` 和结果布局。集成 Mock 数据。
5.  **联调:** 连接前端与后端。处理真实的 API 响应。
6.  **打磨:** 添加“复制”功能，优化样式，完善错误提示。
7.  **最终验收:** 根据验收标准进行验证。

---

## 10. 待确认问题 (Open Questions)

- **Q1:** 阿里云百炼是否需要特定的 `agent_key` 还是仅需 `api_key` 即可直接访问模型？ *假设：标准 API Key 即可进行对话补全。*
- **Q2:** 如果用户输入中文但选择了“英文”作为目标语言，是否强制输出英文？ *决定：Prompt 中的“输出内容必须使用此语言”指令优先级最高。*
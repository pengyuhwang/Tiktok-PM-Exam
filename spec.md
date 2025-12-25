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
| **US-1** | 作为创作者，我希望输入主题和语言，以便获得相关的内容创意。 | - 输入框接受文本（最少2字符，最多100字符）。<br>- 语言切换开关支持 中/英。<br>- 输入为空时，“生成”按钮禁用。 |
| **US-2** | 作为创作者，我希望能看到 3 种不同的脚本结构，以便选择适合我的风格。 | - 界面展示 3 张独立卡片 (ScriptCard)。<br>- Hook、Narrative、CTA 必须使用不同的背景板或视觉分区进行隔离。<br>- 文本内容需清洗转义符并支持列表渲染（移除折叠交互以确保内容直观可见）。<br>- 桌面端 3 列网格，移动端 1 列。 |
| **US-3** | 作为创作者，我希望能看到推荐的 Hashtags 和音乐，这样我就不用手动去查了。 | - Hashtags 和音乐风格必须在独立的 MetaCard 中展示。<br>- MetaCard 提供“复制所有标签”与“复制全部结果”的操作按钮。<br>- 点击单个 Hashtag Chip 可复制该标签。 |
| **US-4** | 作为创作者，我需要在等待结果时知道系统正在运行。 | - 点击生成后：按钮变更为“Generating...”，输入框禁用。<br>- 结果区域显示 Skeleton (MetaCard + 3 ScriptCards) 占位。<br>- 页面自动滚动至加载区域。 |
| **US-5** | 作为创作者，我希望通过简单的操作复制脚本内容，以便粘贴到我的备忘录中。 | - 每个脚本卡片上有单独的“复制”按钮。<br>- 提供“复制全部”按钮用于复制完整结果。<br>- 复制成功后显示 Toast 提示（“已复制！”）。 |
| **US-6** | 作为创作者，如果生成失败，我希望能明确知道原因并决定是否重试。 | - 网络/服务端错误(5xx/Timeout)：显示错误 Banner + “重试”按钮。<br>- 认证/参数错误(400/401)：显示具体原因 + 隐藏重试按钮（提示检查配置）。<br>- 限流错误(429)：显示“请求过多” + “重试”按钮。 |
| **US-7** | (新增) 作为用户，我希望界面美观且操作反馈清晰，UI 语言随目标语言自动切换，以便获得沉浸式体验。 | - 结果区分为 Meta Card（顶部汇总）与 Scripts Grid（底部详情）。<br>- 移动端单列显示，桌面端三列，布局无横向滚动。<br>- UI 上的静态文案（按钮、标题、Placeholder）需根据选择的语言（中/英）自动切换。<br>- 任何“复制”操作成功后，屏幕出现全局 Toast 提示。 |
| **US-8** | (新增) 作为用户，我希望在输入前获得引导，并能快捷提交，以便快速上手。 | - 输入框下方展示 3-5 个示例主题 chips，内容随当前选择语言变化。<br>- 输入框内按 Enter 键触发生成（前提：Topic 合法且非 Loading）。<br>- Hashtag Chip 支持点击复制单个标签。<br>- 生成完成后，页面自动平滑滚动至结果区域。 |

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
前端统一消费的错误结构：
```json
{
  "code": "INVALID_INPUT", // 枚举: NETWORK_ERROR, RATE_LIMIT_EXCEEDED, PROVIDER_AUTH_ERROR, PROVIDER_MODEL_NOT_FOUND, PROVIDER_ERROR, INTERNAL_SERVER_ERROR
  "message": "用户可见的错误提示",
  "details": "Debug info (optional)",
  "retryable": true // 决定 UI 是否渲染重试按钮
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
- **超时:** 60 秒 (LLM 生成可能较慢)。
- **速率限制:** 每个 IP 每分钟 5 次请求 (MVP 可使用简单的内存存储或 Vercel KV，或者前端防抖 + 后端简单检查)。

---

## 5. Prompt 协议 (Prompt Contract)

与阿里云百炼的交互必须强制要求 JSON 输出。为了保证输出质量，**System Prompt 和 User Prompt 的指令语言必须与目标语言保持一致**（即：生成英文内容时，Prompt 指令本身也应为英文）。

### 5.1 系统提示词 (System Prompt)

**中文 (Target: zh):**
```text
你是一位深谙病毒式传播法则的 TikTok 内容策略专家。你的目标是生成高留存率的视频创意。
你必须仅输出有效的 JSON 代码。不要包含 markdown 格式（如 ```json ... ```）或任何介绍性文本。
严格遵循用户提示中提供的 JSON Schema。
```

**英文 (Target: en):**
```text
You are a TikTok content strategy expert specializing in viral trends. Your goal is to generate high-retention video ideas.
You must output ONLY valid JSON code. Do not include markdown formatting (like ```json ... ```) or any introductory text.
Strictly adhere to the JSON Schema provided in the user prompt.
```

### 5.2 用户提示结构 (User Prompt Structure)

根据目标语言选择对应的模板。

**中文模板:**
```text
主题: {topic}

任务:
1. 生成 3 个独特的 TikTok 脚本结构 (风格包括但不限于: 教育/干货, 叙事/Vlog, 争议/幽默)。
2. 生成 5-10 个高流量、相关的 Hashtags。
3. 建议 1 个背景音乐风格描述。

重要：所有输出内容必须使用中文，无论输入的主题是哪种语言。

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
```

**英文模板:**
```text
Topic: {topic}

Task:
1. Generate 3 unique TikTok script structures (Styles including but not limited to: Educational, Narrative/Vlog, Controversial/Humor).
2. Generate 5-10 high-traffic, relevant Hashtags.
3. Suggest 1 background music style description.

IMPORTANT: All output content MUST be in English, regardless of the topic's language.

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
```

---

## 6. UI 组件层级 (UI Component Hierarchy)

```text
App (布局)
└── ToastProvider (全局提示上下文)
    └── Page (首页)
        ├── Header (Badge: "TikTok Insight / MVP v0.1")
        ├── MainContent (flex-col, centered)
        │   └── GeneratorSection (State Container)
        │       ├── HeaderBlock (Title + Subtitle)
        │       ├── InputCard (Box Card - max-w-3xl)
        │       │   ├── TopicInput
        │       │   ├── Controls (Language/Button)
        │       │   └── Chips
        │       ├── ErrorBanner (max-w-3xl)
        │       └── ResultsSection (max-w-5xl - Conditionally Rendered)
        │           ├── MetaCard
        │           └── ScriptsGrid
        │               └── ScriptCard
        └── ToastHost
```

### 6.1 UX & Visual Guidelines (MVP)
- **Layout Strategy (Search Engine Style)**: 
  - **Global**: 页面主体采用 `min-h-screen flex flex-col items-center justify-start pt-[15vh]` 布局。
  - **Mixed Widths**:
    - **Header & Input**: 限制在 `max-w-3xl` 以保持视觉聚焦。
    - **Results**: 扩展至 `max-w-5xl` 以容纳三列卡片布局。
- **Component Styling**:
  - **Input Card**: 纯白背景 (`bg-white`) + 阴影 (`shadow-sm`) + 圆角 (`rounded-2xl`)。
  - **Script Cards (结果卡片)**:
    - **外层背景**: 每张卡片需使用不同的浅色系背景（`bg-sky-200`, `bg-emerald-200`, `bg-violet-200`）以做视觉区分。
    - **内部面板 (卡中卡)**: `Hook`, `Narrative`, `CTA` 各自的面板需使用纯白背景 (`bg-white`)，并带有对应主题色的边框（例如 `border-sky-200`）和圆角 (`rounded-xl`)。
    - **Hook 强调**: Hook 区域需保留 Accent Bar (`w-1`) 和 Ring (`ring-1`) 作为视觉强调。
  - **Search Row**: 桌面端 Input 与 Button 同行展示，高度统一。
  - **Chips**: "试试看" (Examples) 放置在输入框下方，卡片内部，采用 Chip 样式 (`bg-slate-50 hover:bg-slate-100`)。
  - **Controls**: 语言切换等次要控件应整合在卡片内（如右上角或底部），不干扰主输入流。
- **Visual Hierarchy**: 
  1. **Page Background**: `bg-slate-50`。
  2. **Card Depth**: 输入卡片使用 `shadow-sm`，结果卡片（若有）使用平铺或 Grid 布局。
  3. **Typography**: Hook 信息层级最高（字号大/加粗/强调色）。Core Narrative 若超过一定长度需默认折叠。

---

## 7. 错误处理与反馈策略 (Error Handling & Feedback Strategy)

### 7.1 错误映射表 (Error Mapping Table)
前端 `fetch` 封装层必须执行以下映射：

| 错误场景 | HTTP Status | Error Code | Retryable | UI 行为 |
| :--- | :--- | :--- | :--- | :--- |
| 输入不合法 (长度/格式) | 400 | `INVALID_INPUT` | **False** | Banner (Check Input) |
| 百炼鉴权失败 (API Key 无效) | 401/403 | `PROVIDER_AUTH_ERROR` | **False** | Banner (Check .env + Restart) |
| 模型名不存在/不可用 | 400/404 | `PROVIDER_MODEL_NOT_FOUND` | **False** | Banner (Check .env + Restart) |
| 请求限流 | 429 | `RATE_LIMIT_EXCEEDED` | **True** | Banner (Please wait...) + Retry |
| 网络断开 / 超时 (60s) | 502/504 | `NETWORK_ERROR` | **True** | Banner + Retry Button |
| 上游服务错误 | 502 | `PROVIDER_ERROR` | **True** | Banner + Retry Button |
| 生成内容不完整 (字段缺失) | 502 | `PROVIDER_ERROR` | **True** | Banner + Retry Button |
| 服务端崩溃 / 未知错误 | 5xx | `INTERNAL_SERVER_ERROR` | **True** | Banner + Retry Button |

### 7.2 加载状态 (Loading State)
- **触发**: 用户点击生成或按 Enter。
- **UI 变更**:
  1. **Input Area**: 输入框 `disabled`, Button `disabled` & text="Generating...", Chips `disabled`.
  2. **Results Area**: 立即渲染 `Skeleton` 组件（模拟最终卡片布局），淡入显示。
  3. **Scroll**: 页面平滑滚动至 Skeleton 顶部。

### 7.3 错误展示 (Error UI)
- **组件**: `ErrorBanner` (位于 GeneratorSection 下方)。
- **样式**: 红色柔和背景 (`bg-red-50`), 红色边框, 红色文字。
- **交互**: 
  - 若 `retryable=true`，Banner 右侧显示 "Try Again" 按钮。
  - 若 code 为 `PROVIDER_AUTH_ERROR` 或 `PROVIDER_MODEL_NOT_FOUND`，追加提示：“请检查 .env 配置并重启服务”。

---

## 8. 安全 (Security)

### 8.1 环境变量 (Environment Variables)
- `ALIYUN_API_KEY`: 存储在 `.env.local` (本地开发) 和 Vercel/平台环境变量中。**严禁** 提交到 Git。
- `ALIYUN_MODEL_ID`: 例如 `qwen-max` 或 `deepseek-v3`。

### 8.2 API 安全
- **后端代理:** 前端**绝不**直接调用阿里云。所有调用必须经过 `POST /api/insights`。
- **输入清洗:** 截断输入主题至最大 100 字符，防止 Token 消耗攻击。

---

## 9. 里程碑 (Milestones) — 按实现时间线

  1. **项目初始化（能跑起来）**
    - 初始化 Next.js + TypeScript + ESLint。
    - 跑通本地开发：`pnpm dev` / `npm run dev` 能打开页面，无构建错误。
    - 配置 `.env.local`（API Key/Model 仅从 env 读取，禁止硬编码）。

  2. **Tailwind 接入与样式链路修复（解决“任何颜色/居中都不生效、页面纯白”）**
    - 确认 Tailwind 已接入：在任意节点临时加 `bg-red-200 p-6` 肉眼必须可见。
    - 检查 `globals.css` 是否被 `layout.tsx` 引入；`tailwind.config.*` 的 `content` 是否覆盖 `src/**/*`。
    - 若生产构建后样式缺失：在 `.next/static/css` 中 grep 目标类（如 `.bg-sky-100`），必要时补 safelist。

  3. **首页基础布局打磨（搜索引擎式居中）**
    - 页面整体居中：首屏核心区域位于视口中上部（类似百度/Google）。
    - 输入区包裹在独立卡片（白底、边框、圆角、阴影），避免“纯文本流”。

  4. **结果区组件落地（ResultsSection / ScriptCard 渲染路径确认）**
    - 确认渲染链路确实使用 `ResultsSection → ScriptsGrid → ScriptCard`，避免绕过组件导致样式失效。
    - 桌面 3 列、移动 1 列，结果区无横向滚动。

  5. **脚本卡片“外层主题色”实现（3 张卡片可一眼区分）**
    - 渲染 scripts 时传入 index（0/1/2）。
    - 外层卡片按 index 使用不同浅色背景与边框（sky/emerald/violet），保证肉眼可见。

  6. **修复“主题色不显示/看起来仍纯白”的组件根因**
    - 排查并修复 `Card` 组件 className 透传问题。
    - 移除 `Card` 基础样式里硬编码的背景色（例如 `bg-white`），让调用方控制背景。
    - 做强制验证：临时把 ScriptCard 外层改 `bg-red-200 p-6`，确认背景确实落到真实 DOM。

  7. **卡片结构层级重构（露底面积/相框结构，确保主题色露出来）**
    - 外层彩色卡加 `p-4/p-5` 作为“彩色边框”。
    - Header + 内容放入内层白色容器：`bg-white rounded-xl overflow-hidden`，形成清晰的“卡中卡”。

  8. **每张卡内部 3 个模块框（Hook/Core/CTA）成型**
    - Hook/Core/CTA 均为：白底 + 边框 + 圆角 + padding，并且模块之间有明确间距。
    - Hook 额外强调（左侧强调条或 ring），但内容仍在白底框内。
    - 确保正文节点（如 `whitespace-pre-wrap`）不裸露，必须位于模块框容器中。

  9. **后端 /api/insights 接入阿里云百炼（端到端跑通）**
    - 接入 Bailian SDK：模型可配置（`qwen-max` / `deepseek-v3`）。
    - Prompt 强制 JSON 输出；服务端解析并返回 `InsightResponse`。
    - `curl` 覆盖测试：成功、apikey 错、模型名错、429 限流、provider 5xx、超时。

  10. **Loading 反馈落地（交互反馈要求之一）**
    - 点击生成后：按钮禁用 + Loading（Skeleton/Spinner）可见。
    - Loading 期间禁止重复提交；完成后自动滚动到结果区。

  11. **错误处理落地（交互反馈要求之二）**
    - 定义并实现 ErrorResponse：`code/message/details/retryable`。
    - 前端根据 `code` 做分类展示（至少区分：鉴权/Key 错、模型配置错、网络错误、限流、超时、服务端异常）。
    - 对可重试错误提供“重试”按钮与更具体提示；未知错误保留兜底文案（但要能定位）。

## 12. 输出不完整 (Incomplete Output) 与 严格校验
- **问题**: LLM 可能偶尔返回 JSON 结构完整但字段内容为空（例如 `hook: ""`）的情况，导致前端展示空白卡片。
- **策略**: 
  - **后端严格校验**: 在 `src/lib/aliyun.ts` 中解析 LLM 响应后，必须遍历检查每个 script 的 `hook`, `core_narrative`, `cta` 是否非空。
  - **失败处理**: 只要有任意一个关键字段为空，后端应直接抛出 `PROVIDER_ERROR` (Retryable: true)，以此触发前端的全局“重试”按钮，而不是渲染残缺的卡片。
  - **前端**: 不再需要单独处理字段为空的兜底 UI，因为后端会拦截这种情况。

## 13. 复制与 Toast（交互反馈要求之三）
    - 单卡复制、复制全部、复制标签、单个 hashtag 点击复制。
    - 所有复制操作统一 Toast 提示（中/英随语言切换）。

  14. **最终验收（Acceptance Criteria 驱动）**
    - 样式：居中布局 + 3 张可区分彩色卡 + 每卡 3 个白底模块框。
    - 交互：Loading 可见、错误可理解可重试、复制有 Toast。
    - 场景：apikey 错/模型名错/网络断开/429/超时/字段缺失均可被定位且有用户反馈。

---

## 10. 待确认问题 (Open Questions)

- **Q1:** 阿里云百炼是否需要特定的 `agent_key` 还是仅需 `api_key` 即可直接访问模型？ *假设：标准 API Key 即可进行对话补全。*
- **Q2:** 如果用户输入中文但选择了“英文”作为目标语言，是否强制输出英文？ *决定：Prompt 中的“输出内容必须使用此语言”指令优先级最高。*